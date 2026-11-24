import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import * as runtime from "@midnight-ntwrk/compact-runtime";
import {
  ProofVaultEngine,
  deriveDeterministicSaltHex,
  verifyAuditPackageAgainstLedger
} from "../src/midnight/proofEngine";
import { DisclosureTier as UiDisclosureTier } from "../src/midnight/types";
import { DEFAULT_JURISDICTIONS } from "../src/midnight/presets";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const COMPACT_SRC = fs.readFileSync(path.join(ROOT_DIR, "contracts", "proofvault.compact"), "utf8");
const COMPILED_JS = fs.readFileSync(
  path.join(ROOT_DIR, "contracts", "managed", "proofvault", "contract", "index.js"),
  "utf8"
);

const UINT64_TYPE = new runtime.CompactTypeUnsignedInteger(18446744073709551615n, 8);
const BYTES32_TYPE = new runtime.CompactTypeBytes(32);

interface CompiledModuleShape {
  Contract: new (witnesses: Record<string, unknown>) => {
    initialState: (...args: unknown[]) => Promise<{
      currentContractState: runtime.ContractState;
      currentPrivateState: ProofVaultPrivateState;
    }>;
    impureCircuits: {
      registerApprovedJurisdiction: (ctx: unknown, digest: Uint8Array) => Promise<runtime.CircuitResults<ProofVaultPrivateState, unknown>>;
      proveTreasurySolvency: (ctx: unknown, floor: bigint) => Promise<runtime.CircuitResults<ProofVaultPrivateState, Uint8Array>>;
      settleConfidentialInvoice: (ctx: unknown, cap: bigint, tier: number) => Promise<runtime.CircuitResults<ProofVaultPrivateState, Uint8Array>>;
      updateGovernancePolicy: (ctx: unknown, max: bigint, floor: bigint, status: number) => Promise<runtime.CircuitResults<ProofVaultPrivateState, unknown>>;
      verifyReceiptOnChain: (ctx: unknown, receiptId: Uint8Array) => Promise<runtime.CircuitResults<ProofVaultPrivateState, boolean>>;
    };
  };
  DisclosureTier: { MinimalSolvency: number; ThresholdBand: number; AuditorScoped: number };
  VaultStatus: { Active: number; Paused: number };
  ledger: (data: unknown) => {
    settledInvoiceCount: bigint;
    treasuryBalanceCommitment: Uint8Array;
    policyMaxSingleSettlement: bigint;
    policyMinReserveFloor: bigint;
    currentEpoch: bigint;
    vaultStatus: number;
    approvedJurisdictions: {
      findPathForLeaf: (leaf: Uint8Array) => runtime.MerkleTreePath<Uint8Array> | undefined;
    };
    usedInvoiceNullifiers: {
      member: (n: Uint8Array) => boolean;
    };
    auditReceipts: {
      lookup: (id: Uint8Array) => {
        invoiceCommitment: Uint8Array;
        nullifier: Uint8Array;
        budgetTierCap: bigint;
        jurisdictionRoot: Uint8Array;
        auditorTag: Uint8Array;
        disclosureTier: number;
        settledEpoch: bigint;
      };
    };
  };
  pureCircuits: {
    deriveOperatorPublicKey: (sk: Uint8Array) => Uint8Array;
    deriveNullifier: (vendorId: Uint8Array, lineItemsHash: Uint8Array) => Uint8Array;
    deriveInvoiceCommitment: (vendorId: Uint8Array, lineItemsHash: Uint8Array, amount: bigint, salt: Uint8Array) => Uint8Array;
  };
}

interface ProofVaultPrivateState {
  operatorSecretKey: Uint8Array;
  treasurySecretBalance: bigint;
  treasuryBlindingFactor: Uint8Array;
  nextTreasuryBlindingFactor: Uint8Array;
  invoiceVendorId: Uint8Array;
  invoiceLineItemsHash: Uint8Array;
  invoiceAmount: bigint;
  invoiceSalt: Uint8Array;
  jurisdictionLeaf: Uint8Array;
  jurisdictionMerklePath: runtime.MerkleTreePath<Uint8Array>;
  auditorViewingKeyHash: Uint8Array;
}

interface AssertCallSpan {
  index: number;
  start: number;
  end: number;
  message: string;
  isCompilerGenerated: boolean;
}

/**
 * Balanced-parenthesis scanner finding every `__compactRuntime.assert(...)` call
 * in the real `compactc 0.36.1` output so each guard can be surgically deleted.
 */
function findCompiledAssertSpans(source: string): AssertCallSpan[] {
  const spans: AssertCallSpan[] = [];
  const needle = "__compactRuntime.assert(";
  let pos = 0;

  while (true) {
    const start = source.indexOf(needle, pos);
    if (start === -1) break;

    let i = start + needle.length;
    let depth = 1;
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;
    while (i < source.length && depth > 0) {
      const ch = source[i];
      const prev = source[i - 1];
      if (!inDouble && !inTemplate && ch === "'" && prev !== "\\") {
        inSingle = !inSingle;
      } else if (!inSingle && !inTemplate && ch === '"' && prev !== "\\") {
        inDouble = !inDouble;
      } else if (!inSingle && !inDouble && ch === "`" && prev !== "\\") {
        inTemplate = !inTemplate;
      } else if (!inSingle && !inDouble && !inTemplate) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
      }
      i++;
    }

    const callText = source.slice(start, i);
    const msgMatch = callText.match(/,\s*['"]([^'"]+)['"]\s*\)$/);
    const message = msgMatch ? msgMatch[1] : "<unknown>";
    spans.push({
      index: spans.length,
      start,
      end: i,
      message,
      isCompilerGenerated: message === "result of subtraction would be negative"
    });
    pos = i;
  }

  return spans;
}

/**
 * Evaluates either the unmodified compiled contract JS (`disableSpanIndex = null`)
 * or a surgical single-guard-deleted mutant (`disableSpanIndex = span.index`)
 * against the real `@midnight-ntwrk/compact-runtime@0.21.0`.
 */
function loadCompiledContract(disableSpanIndex: number | null): CompiledModuleShape {
  let code = COMPILED_JS;
  if (disableSpanIndex !== null) {
    const spans = findCompiledAssertSpans(COMPILED_JS);
    const target = spans[disableSpanIndex];
    if (!target) {
      throw new Error(`No compiled assert span at index ${disableSpanIndex}`);
    }
    code = `${code.slice(0, target.start)}(void 0)${code.slice(target.end)}`;
  }

  const transformed = code
    .replace(/^import \* as __compactRuntime from '@midnight-ntwrk\/compact-runtime';\r?\n/, "")
    .replace(/^export var /gm, "var ")
    .replace(/^export class /gm, "class ")
    .replace(/^export function /gm, "function ")
    .replace(/^export const /gm, "const ");

  const factory = new Function(
    "__compactRuntime",
    `${transformed}\nreturn { Contract, DisclosureTier, VaultStatus, ledger, pureCircuits };`
  );
  return factory(runtime) as CompiledModuleShape;
}

function bytes32(label: string): Uint8Array {
  const raw = new TextEncoder().encode(label);
  const padded = new Uint8Array(32);
  padded.set(raw.subarray(0, 32));
  return runtime.persistentHash(BYTES32_TYPE, padded);
}

function emptyMerklePath(leaf: Uint8Array): runtime.MerkleTreePath<Uint8Array> {
  return {
    leaf,
    path: Array.from({ length: 8 }, () => ({
      sibling: { field: 0n },
      goes_left: true
    }))
  };
}

function createWitnesses() {
  return {
    operatorSecretKey: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.operatorSecretKey],
    treasurySecretBalance: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.treasurySecretBalance],
    treasuryBlindingFactor: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.treasuryBlindingFactor],
    nextTreasuryBlindingFactor: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.nextTreasuryBlindingFactor],
    invoiceVendorId: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.invoiceVendorId],
    invoiceLineItemsHash: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.invoiceLineItemsHash],
    invoiceAmount: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.invoiceAmount],
    invoiceSalt: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.invoiceSalt],
    jurisdictionLeaf: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.jurisdictionLeaf],
    jurisdictionMerklePath: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.jurisdictionMerklePath],
    auditorViewingKeyHash: ({ privateState }: { privateState: ProofVaultPrivateState }) => [privateState, privateState.auditorViewingKeyHash]
  };
}

class MutantHarness {
  public readonly mod: CompiledModuleShape;
  public readonly contract: InstanceType<CompiledModuleShape["Contract"]>;
  public readonly address: string;
  public readonly coinPk: string;
  public contractState: runtime.ContractState;
  public privateState: ProofVaultPrivateState;

  private constructor(
    mod: CompiledModuleShape,
    contract: InstanceType<CompiledModuleShape["Contract"]>,
    address: string,
    coinPk: string,
    contractState: runtime.ContractState,
    privateState: ProofVaultPrivateState
  ) {
    this.mod = mod;
    this.contract = contract;
    this.address = address;
    this.coinPk = coinPk;
    this.contractState = contractState;
    this.privateState = privateState;
  }

  public static async boot(
    mod: CompiledModuleShape,
    overrides?: {
      initialBalance?: bigint;
      maxSingleSettlement?: bigint;
      minReserveFloor?: bigint;
      registerCH?: boolean;
    }
  ): Promise<MutantHarness> {
    const operatorSk = bytes32("mutant:operator:sk");
    const initialSalt = bytes32("mutant:salt:0");
    const initialBalance = overrides?.initialBalance ?? 200_000_000n;
    const maxSingleSettlement = overrides?.maxSingleSettlement ?? 15_000_000n;
    const minReserveFloor = overrides?.minReserveFloor ?? 50_000_000n;

    const contract = new mod.Contract(createWitnesses());
    const address = runtime.sampleContractAddress();
    const coinPk = runtime.toHex(bytes32("mutant:coin:pk"));
    const initOpPk = mod.pureCircuits.deriveOperatorPublicKey(operatorSk);
    const initCommit = runtime.persistentCommit(UINT64_TYPE, initialBalance, initialSalt);
    const isoCH = bytes32("iso:CH");

    const initPriv: ProofVaultPrivateState = {
      operatorSecretKey: operatorSk,
      treasurySecretBalance: initialBalance,
      treasuryBlindingFactor: initialSalt,
      nextTreasuryBlindingFactor: bytes32("mutant:salt:next"),
      invoiceVendorId: bytes32("mutant:vendor:01"),
      invoiceLineItemsHash: bytes32("mutant:items:01"),
      invoiceAmount: 2_000_000n,
      invoiceSalt: bytes32("mutant:inv:salt:01"),
      jurisdictionLeaf: isoCH,
      jurisdictionMerklePath: emptyMerklePath(isoCH),
      auditorViewingKeyHash: bytes32("mutant:auditor:vk")
    };

    const deployed = await contract.initialState(
      runtime.createConstructorContext(initPriv, coinPk),
      initOpPk,
      initCommit,
      maxSingleSettlement,
      minReserveFloor
    );

    const h = new MutantHarness(
      mod,
      contract,
      address,
      coinPk,
      deployed.currentContractState,
      deployed.currentPrivateState
    );

    if (overrides?.registerCH !== false) {
      await h.registerJurisdiction(isoCH);
      const pathCH = h.getLedger().approvedJurisdictions.findPathForLeaf(isoCH)!;
      h.privateState = { ...h.privateState, jurisdictionLeaf: isoCH, jurisdictionMerklePath: pathCH };
    }
    return h;
  }

  public getLedger() {
    return this.mod.ledger(this.contractState.data);
  }

  private ctx(circuitId: string) {
    return runtime.createCircuitContext({
      circuitId,
      contractAddress: this.address,
      coinPublicKeyOrZswapState: this.coinPk,
      contractState: this.contractState,
      privateState: this.privateState
    });
  }

  private apply(res: runtime.CircuitResults<ProofVaultPrivateState, unknown>) {
    this.contractState.data = res.context.callContext.currentQueryContext.state;
    if (res.context.callContext.currentPrivateState !== undefined) {
      this.privateState = res.context.callContext.currentPrivateState;
    }
  }

  public async registerJurisdiction(digest: Uint8Array, patch?: Partial<ProofVaultPrivateState>) {
    if (patch) this.privateState = { ...this.privateState, ...patch };
    const res = await this.contract.impureCircuits.registerApprovedJurisdiction(
      this.ctx("registerApprovedJurisdiction"),
      digest
    );
    this.apply(res);
  }

  public async proveSolvency(floor: bigint, patch?: Partial<ProofVaultPrivateState>) {
    if (patch) this.privateState = { ...this.privateState, ...patch };
    const res = await this.contract.impureCircuits.proveTreasurySolvency(
      this.ctx("proveTreasurySolvency"),
      floor
    );
    this.apply(res);
    return res.result;
  }

  public async settle(cap: bigint, tier: number, patch?: Partial<ProofVaultPrivateState>) {
    if (patch) this.privateState = { ...this.privateState, ...patch };
    const res = await this.contract.impureCircuits.settleConfidentialInvoice(
      this.ctx("settleConfidentialInvoice"),
      cap,
      tier
    );
    this.apply(res);
    return res.result;
  }

  public async updatePolicy(max: bigint, floor: bigint, status: number, patch?: Partial<ProofVaultPrivateState>) {
    if (patch) this.privateState = { ...this.privateState, ...patch };
    const res = await this.contract.impureCircuits.updateGovernancePolicy(
      this.ctx("updateGovernancePolicy"),
      max,
      floor,
      status
    );
    this.apply(res);
  }

  public async verifyReceipt(receiptId: Uint8Array) {
    const res = await this.contract.impureCircuits.verifyReceiptOnChain(
      this.ctx("verifyReceiptOnChain"),
      receiptId
    );
    return res.result;
  }
}

interface GuardMutationCase {
  id: string;
  circuit: string;
  expectedMessage: string;
  /** Exact 0-based index among user-authored asserts in contracts/proofvault.compact */
  userGuardOrdinal: number;
  runAttack: (mod: CompiledModuleShape) => Promise<unknown>;
  /** True only for explicit underflow pre-guard backed by compiler's own u64 subtraction check */
  fallsThroughToCompilerUnderflow?: boolean;
}

const GUARD_MUTATION_CASES: GuardMutationCase[] = [
  {
    id: "G01",
    circuit: "constructor",
    expectedMessage: "Max single settlement must be positive",
    userGuardOrdinal: 0,
    runAttack: (mod) => MutantHarness.boot(mod, { maxSingleSettlement: 0n, registerCH: false })
  },
  {
    id: "G02",
    circuit: "registerApprovedJurisdiction",
    expectedMessage: "Unauthorized treasury operator",
    userGuardOrdinal: 1,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.registerJurisdiction(bytes32("iso:FR"), { operatorSecretKey: bytes32("attacker:sk") });
    }
  },
  {
    id: "G03",
    circuit: "proveTreasurySolvency",
    expectedMessage: "Treasury commitment mismatch",
    userGuardOrdinal: 2,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.proveSolvency(100_000_000n, { treasurySecretBalance: 999_000_000n });
    }
  },
  {
    id: "G04",
    circuit: "proveTreasurySolvency",
    expectedMessage: "Treasury below governance reserve floor",
    userGuardOrdinal: 3,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod, { initialBalance: 40_000_000n, minReserveFloor: 50_000_000n });
      return h.proveSolvency(10_000_000n);
    }
  },
  {
    id: "G05",
    circuit: "proveTreasurySolvency",
    expectedMessage: "Treasury below requested solvency floor",
    userGuardOrdinal: 4,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.proveSolvency(250_000_000n);
    }
  },
  {
    id: "G06",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Vault is currently paused",
    userGuardOrdinal: 5,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      await h.updatePolicy(15_000_000n, 50_000_000n, mod.VaultStatus.Paused);
      return h.settle(5_000_000n, mod.DisclosureTier.AuditorScoped);
    }
  },
  {
    id: "G07",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Unauthorized treasury operator",
    userGuardOrdinal: 6,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.settle(5_000_000n, mod.DisclosureTier.AuditorScoped, {
        operatorSecretKey: bytes32("attacker:sk")
      });
    }
  },
  {
    id: "G08",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Treasury commitment mismatch",
    userGuardOrdinal: 7,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.settle(5_000_000n, mod.DisclosureTier.AuditorScoped, {
        treasuryBlindingFactor: bytes32("wrong:salt")
      });
    }
  },
  {
    id: "G09",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Invoice amount must be greater than zero",
    userGuardOrdinal: 8,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.settle(5_000_000n, mod.DisclosureTier.ThresholdBand, { invoiceAmount: 0n });
    }
  },
  {
    id: "G10",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Invoice exceeds declared budget tier cap",
    userGuardOrdinal: 9,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.settle(1_000_000n, mod.DisclosureTier.ThresholdBand, { invoiceAmount: 2_500_000n });
    }
  },
  {
    id: "G11",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Budget tier exceeds governance ceiling",
    userGuardOrdinal: 10,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.settle(20_000_000n, mod.DisclosureTier.ThresholdBand, { invoiceAmount: 2_000_000n });
    }
  },
  {
    id: "G12",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Insufficient treasury balance",
    userGuardOrdinal: 11,
    fallsThroughToCompilerUnderflow: true,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod, {
        initialBalance: 1_000_000n,
        minReserveFloor: 0n,
        maxSingleSettlement: 15_000_000n
      });
      return h.settle(5_000_000n, mod.DisclosureTier.MinimalSolvency, { invoiceAmount: 2_000_000n });
    }
  },
  {
    id: "G13",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Settlement breaches minimum reserve floor",
    userGuardOrdinal: 12,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod, {
        initialBalance: 51_000_000n,
        minReserveFloor: 50_000_000n
      });
      return h.settle(5_000_000n, mod.DisclosureTier.MinimalSolvency, { invoiceAmount: 2_000_000n });
    }
  },
  {
    id: "G14",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Jurisdiction leaf does not match Merkle path",
    userGuardOrdinal: 13,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.settle(5_000_000n, mod.DisclosureTier.AuditorScoped, {
        jurisdictionLeaf: bytes32("iso:KP") // path still carries valid CH leaf
      });
    }
  },
  {
    id: "G15",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Jurisdiction is not in the approved compliance Merkle tree",
    userGuardOrdinal: 14,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      const isoKP = bytes32("iso:KP");
      return h.settle(5_000_000n, mod.DisclosureTier.AuditorScoped, {
        jurisdictionLeaf: isoKP,
        jurisdictionMerklePath: emptyMerklePath(isoKP)
      });
    }
  },
  {
    id: "G16",
    circuit: "settleConfidentialInvoice",
    expectedMessage: "Invoice nullifier already spent",
    userGuardOrdinal: 15,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      const nextSalt = bytes32("mutant:salt:after-1");
      await h.settle(5_000_000n, mod.DisclosureTier.AuditorScoped, {
        nextTreasuryBlindingFactor: nextSalt
      });
      h.privateState = {
        ...h.privateState,
        treasurySecretBalance: 200_000_000n - 2_000_000n,
        treasuryBlindingFactor: nextSalt,
        nextTreasuryBlindingFactor: bytes32("mutant:salt:after-2"),
        invoiceSalt: bytes32("mutant:inv:salt:replay")
      };
      return h.settle(5_000_000n, mod.DisclosureTier.AuditorScoped);
    }
  },
  {
    id: "G17",
    circuit: "updateGovernancePolicy",
    expectedMessage: "Unauthorized treasury operator",
    userGuardOrdinal: 16,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.updatePolicy(10_000_000n, 40_000_000n, mod.VaultStatus.Active, {
        operatorSecretKey: bytes32("attacker:sk")
      });
    }
  },
  {
    id: "G18",
    circuit: "updateGovernancePolicy",
    expectedMessage: "Max single settlement must be positive",
    userGuardOrdinal: 17,
    runAttack: async (mod) => {
      const h = await MutantHarness.boot(mod);
      return h.updatePolicy(0n, 50_000_000n, mod.VaultStatus.Active);
    }
  }
];

describe("Guard-Mutation Security Audit (18/18 Compact Contract assert() Guards)", () => {
  const allCompiledSpans = findCompiledAssertSpans(COMPILED_JS);
  const userCompiledSpans = allCompiledSpans.filter((s) => !s.isCompilerGenerated);

  it("maps 100% of assert(...) statements in contracts/proofvault.compact to compiled guards", () => {
    const compactAssertCount = (COMPACT_SRC.match(/\bassert\s*\(/g) ?? []).length;
    expect(compactAssertCount).toBe(18);
    expect(userCompiledSpans).toHaveLength(18);
    expect(GUARD_MUTATION_CASES).toHaveLength(18);

    // Verify every single case message matches the compiled JS guard at its exact ordinal
    for (const tc of GUARD_MUTATION_CASES) {
      expect(userCompiledSpans[tc.userGuardOrdinal].message).toBe(tc.expectedMessage);
    }
  });

  const baselineMod = loadCompiledContract(null);

  for (const tc of GUARD_MUTATION_CASES) {
    it(`[${tc.id}] kills mutant when deleting ${tc.circuit}() guard: "${tc.expectedMessage}"`, async () => {
      // 1. Baseline compiled contract MUST block the exploit with the exact guard message
      await expect(tc.runAttack(baselineMod)).rejects.toThrow(tc.expectedMessage);

      // 2. Surgically delete ONLY this guard from compiled contract JS and re-run the attack
      const targetSpan = userCompiledSpans[tc.userGuardOrdinal];
      const mutatedMod = loadCompiledContract(targetSpan.index);

      if (tc.fallsThroughToCompilerUnderflow) {
        // Removing explicit "Insufficient treasury balance" exposes compiler u64 subtraction check
        await expect(tc.runAttack(mutatedMod)).rejects.toThrow(
          /result of subtraction would be negative/
        );
      } else {
        // Without this guard, the exploit bypasses the security check and resolves cleanly -> mutant KILLED!
        let bypassError: unknown = null;
        try {
          await tc.runAttack(mutatedMod);
        } catch (err) {
          bypassError = err;
        }
        expect(bypassError).toBeNull();
      }
    });
  }
});

describe("Property-Based Fuzzing (fast-check) — Compiled Runtime & Browser Engine Invariants", () => {
  const baselineMod = loadCompiledContract(null);

  it("fuzzes arbitrary valid settlement tuples against compiled Compact 0.28.0 runtime", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.bigInt({ min: 1_000_000n, max: 500_000_000n }), // floor
        fc.bigInt({ min: 1n, max: 100_000_000n }), // amount
        fc.bigInt({ min: 0n, max: 50_000_000n }), // capSlack
        fc.bigInt({ min: 0n, max: 50_000_000n }), // maxSlack
        fc.bigInt({ min: 0n, max: 500_000_000n }), // balanceSlack
        fc.constantFrom(0, 1, 2), // DisclosureTier
        async (floor, amount, capSlack, maxSlack, balanceSlack, tier) => {
          const cap = amount + capSlack;
          const maxCap = cap + maxSlack;
          const initialBalance = floor + amount + balanceSlack;

          const h = await MutantHarness.boot(baselineMod, {
            initialBalance,
            maxSingleSettlement: maxCap,
            minReserveFloor: floor
          });

          const nextSalt = bytes32(`fuzz:next:${initialBalance}:${amount}`);
          const receiptId = await h.settle(cap, tier, {
            invoiceAmount: amount,
            nextTreasuryBlindingFactor: nextSalt
          });

          const st = h.getLedger();
          expect(st.settledInvoiceCount).toBe(1n);
          expect(await h.verifyReceipt(receiptId)).toBe(true);

          const receipt = st.auditReceipts.lookup(receiptId);
          expect(receipt.budgetTierCap).toBe(cap);
          expect(receipt.disclosureTier).toBe(tier);
          if (tier === baselineMod.DisclosureTier.AuditorScoped) {
            expect(receipt.auditorTag.some((b) => b !== 0)).toBe(true);
          } else {
            expect(receipt.auditorTag.every((b) => b === 0)).toBe(true);
          }

          // Re-blinded balance proves exact remaining balance solvency and rejects remaining+1
          const remaining = initialBalance - amount;
          h.privateState = {
            ...h.privateState,
            treasurySecretBalance: remaining,
            treasuryBlindingFactor: nextSalt
          };
          const solvency = await h.proveSolvency(remaining);
          expect(solvency).toHaveLength(32);
          await expect(h.proveSolvency(remaining + 1n)).rejects.toThrow(
            /Treasury below requested solvency floor/
          );
        }
      ),
      { numRuns: 15 }
    );
  });

  it("fuzzes invalid amount/cap/floor violations on compiled runtime and guarantees zero state mutation", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 3 }), // violation kind
        fc.bigInt({ min: 1n, max: 10_000_000n }), // delta
        async (kind, delta) => {
          const h = await MutantHarness.boot(baselineMod, {
            initialBalance: 100_000_000n,
            maxSingleSettlement: 15_000_000n,
            minReserveFloor: 90_000_000n
          });
          const beforeCommit = runtime.toHex(h.getLedger().treasuryBalanceCommitment);

          let cap = 5_000_000n;
          let amount = 2_000_000n;
          if (kind === 0) {
            amount = 0n; // zero amount
          } else if (kind === 1) {
            amount = cap + delta; // exceeds budgetTierCap
          } else if (kind === 2) {
            cap = 15_000_000n + delta; // exceeds governance ceiling
          } else {
            cap = 15_000_000n;
            amount = 10_000_000n + (delta % 5_000_000n) + 1n; // breaches $90M reserve floor
          }

          await expect(
            h.settle(cap, baselineMod.DisclosureTier.ThresholdBand, { invoiceAmount: amount })
          ).rejects.toThrow();

          // On-chain ledger must remain completely untouched
          expect(h.getLedger().settledInvoiceCount).toBe(0n);
          expect(runtime.toHex(h.getLedger().treasuryBalanceCommitment)).toBe(beforeCommit);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("fuzzes serialized ContractState bytes to prove zero witness leakage across random secrets", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 24 }),
        fc.string({ minLength: 8, maxLength: 24 }),
        fc.string({ minLength: 8, maxLength: 24 }),
        async (vendorSeed, itemsSeed, saltSeed) => {
          const h = await MutantHarness.boot(baselineMod);
          const vendor = bytes32(`v:${vendorSeed}`);
          const items = bytes32(`i:${itemsSeed}`);
          const invSalt = bytes32(`s:${saltSeed}`);

          await h.settle(5_000_000n, baselineMod.DisclosureTier.AuditorScoped, {
            invoiceVendorId: vendor,
            invoiceLineItemsHash: items,
            invoiceSalt: invSalt
          });

          const serializedHex = runtime.toHex(h.contractState.serialize());
          expect(serializedHex).not.toContain(runtime.toHex(h.privateState.operatorSecretKey));
          expect(serializedHex).not.toContain(runtime.toHex(vendor));
          expect(serializedHex).not.toContain(runtime.toHex(items));
          expect(serializedHex).not.toContain(runtime.toHex(invSalt));
        }
      ),
      { numRuns: 12 }
    );
  });

  it("fuzzes multi-invoice browser engine sequences for balance conservation & 7/7 receipt validity", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            amountCents: fc.integer({ min: 10_000, max: 4_000_000 }),
            capSlack: fc.integer({ min: 0, max: 3_000_000 }),
            jurisdiction: fc.constantFrom("US", "CH", "SG", "GB", "DE", "JP"),
            tier: fc.constantFrom(
              UiDisclosureTier.MinimalSolvency,
              UiDisclosureTier.ThresholdBand,
              UiDisclosureTier.AuditorScoped
            )
          }),
          { minLength: 1, maxLength: 6 }
        ),
        (invoices) => {
          const auditorKey = deriveDeterministicSaltHex("fuzz:auditor:key");
          const initialBalance = 500_000_000;
          const engine = new ProofVaultEngine({
            operatorSecretKeyHex: deriveDeterministicSaltHex("fuzz:op:key"),
            initialTreasuryBalanceCents: initialBalance,
            initialBlindingFactorHex: deriveDeterministicSaltHex("fuzz:salt:0"),
            auditorViewingKeyHex: auditorKey,
            maxSingleSettlementCents: 20_000_000,
            minReserveFloorCents: 50_000_000,
            initialJurisdictions: DEFAULT_JURISDICTIONS
          });

          let spent = 0;
          invoices.forEach((inv, idx) => {
            const cap = inv.amountCents + inv.capSlack;
            const res = engine.settleConfidentialInvoice({
              vendorLabel: `Confidential Vendor ${idx}`,
              vendorIdRaw: `vendor:fuzz:${idx}`,
              invoiceReference: `INV-FUZZ-${idx}`,
              lineItemsSummary: `Scope item ${idx}`,
              amountCents: inv.amountCents,
              budgetTierCapCents: cap,
              jurisdictionCode: inv.jurisdiction,
              disclosureTier: inv.tier
            });
            expect(res.ok).toBe(true);
            spent += inv.amountCents;

            const pkg = engine.buildExportedAuditPackage(res.receipt!.receiptId)!;
            const ver = verifyAuditPackageAgainstLedger(
              JSON.stringify(pkg),
              engine.getPublicLedger(),
              auditorKey
            );
            expect(ver.valid).toBe(true);
            expect(ver.checks).toHaveLength(7);
          });

          expect(engine.getPrivateWitnessVault().treasuryBalanceCents).toBe(initialBalance - spent);
          expect(engine.getPublicLedger().settledInvoiceCount).toBe(invoices.length);
          expect(engine.getPublicLedger().usedInvoiceNullifiers).toHaveLength(invoices.length);
        }
      ),
      { numRuns: 25 }
    );
  });

  it("fuzzes deterministic anti-replay nullifiers across changing amounts, caps, and tiers", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        fc.integer({ min: 50_000, max: 2_000_000 }),
        fc.integer({ min: 50_000, max: 2_000_000 }),
        (vendor, ref, amt1, amt2) => {
          const engine = new ProofVaultEngine({
            operatorSecretKeyHex: deriveDeterministicSaltHex("replay:op"),
            initialTreasuryBalanceCents: 300_000_000,
            initialBlindingFactorHex: deriveDeterministicSaltHex("replay:salt"),
            auditorViewingKeyHex: deriveDeterministicSaltHex("replay:aud"),
            maxSingleSettlementCents: 15_000_000,
            minReserveFloorCents: 50_000_000,
            initialJurisdictions: DEFAULT_JURISDICTIONS
          });

          const first = engine.settleConfidentialInvoice({
            vendorLabel: "First Co",
            vendorIdRaw: vendor,
            invoiceReference: ref,
            lineItemsSummary: "Fixed deliverable",
            amountCents: amt1,
            budgetTierCapCents: 5_000_000,
            jurisdictionCode: "CH",
            disclosureTier: UiDisclosureTier.AuditorScoped
          });
          expect(first.ok).toBe(true);

          const replay = engine.settleConfidentialInvoice({
            vendorLabel: "Renamed Co",
            vendorIdRaw: vendor,
            invoiceReference: ref,
            lineItemsSummary: "Fixed deliverable",
            amountCents: amt2,
            budgetTierCapCents: 10_000_000,
            jurisdictionCode: "SG",
            disclosureTier: UiDisclosureTier.MinimalSolvency
          });
          expect(replay.ok).toBe(false);
          expect(replay.error).toBe("Invoice nullifier already spent");
        }
      ),
      { numRuns: 30 }
    );
  });

  it("fuzzes exported JSON audit packages to guarantee zero plaintext vendor or exact-amount leakage", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z][a-z]{4,12} GmbH$/),
        fc.integer({ min: 123_456, max: 4_876_543 }),
        (vendorName, exactAmount) => {
          const cap = 10_000_000; // fixed $100,000 public tier band independent of exactAmount
          const engine = new ProofVaultEngine({
            operatorSecretKeyHex: deriveDeterministicSaltHex("pii:op"),
            initialTreasuryBalanceCents: 300_000_000,
            initialBlindingFactorHex: deriveDeterministicSaltHex("pii:salt"),
            auditorViewingKeyHex: deriveDeterministicSaltHex("pii:aud"),
            maxSingleSettlementCents: 15_000_000,
            minReserveFloorCents: 50_000_000,
            initialJurisdictions: DEFAULT_JURISDICTIONS
          });

          const res = engine.settleConfidentialInvoice({
            vendorLabel: vendorName,
            vendorIdRaw: `id:${vendorName}`,
            invoiceReference: "INV-PII-CHECK",
            lineItemsSummary: "CONFIDENTIAL_DELIVERABLE_TOKEN",
            amountCents: exactAmount,
            budgetTierCapCents: cap,
            jurisdictionCode: "CH",
            disclosureTier: UiDisclosureTier.AuditorScoped
          });
          expect(res.ok).toBe(true);
          const rawJson = JSON.stringify(engine.buildExportedAuditPackage(res.receipt!.receiptId));

          expect(rawJson).not.toContain(vendorName);
          expect(rawJson).not.toContain("CONFIDENTIAL_DELIVERABLE_TOKEN");
          expect(rawJson).not.toContain(String(exactAmount));
        }
      ),
      { numRuns: 30 }
    );
  });

  it("fuzzes single-field receipt tampering and proves verifier catches 100% of mutations", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("cap", "epoch", "nullifier", "commitment", "root", "auditorTag"),
        fc.integer({ min: 1, max: 999_999 }),
        (field, delta) => {
          const audKey = deriveDeterministicSaltHex("tamper:aud");
          const engine = new ProofVaultEngine({
            operatorSecretKeyHex: deriveDeterministicSaltHex("tamper:op"),
            initialTreasuryBalanceCents: 300_000_000,
            initialBlindingFactorHex: deriveDeterministicSaltHex("tamper:salt"),
            auditorViewingKeyHex: audKey,
            maxSingleSettlementCents: 15_000_000,
            minReserveFloorCents: 50_000_000,
            initialJurisdictions: DEFAULT_JURISDICTIONS
          });

          const res = engine.settleConfidentialInvoice({
            vendorLabel: "Tamper Target AG",
            vendorIdRaw: "vendor:tamper:01",
            invoiceReference: "INV-TAMPER-01",
            lineItemsSummary: "Audit scope",
            amountCents: 1_000_000,
            budgetTierCapCents: 2_000_000,
            jurisdictionCode: "CH",
            disclosureTier: UiDisclosureTier.AuditorScoped
          });
          const pkg = engine.buildExportedAuditPackage(res.receipt!.receiptId)!;
          const mutated = structuredClone(pkg);

          if (field === "cap") mutated.receipt.budgetTierCapCents += delta;
          else if (field === "epoch") mutated.receipt.settledEpoch += delta;
          else if (field === "nullifier") mutated.receipt.nullifier = deriveDeterministicSaltHex(`bad:n:${delta}`);
          else if (field === "commitment") mutated.receipt.invoiceCommitment = deriveDeterministicSaltHex(`bad:c:${delta}`);
          else if (field === "root") mutated.receipt.jurisdictionRoot = deriveDeterministicSaltHex(`bad:r:${delta}`);
          else if (field === "auditorTag") mutated.receipt.auditorTag = deriveDeterministicSaltHex(`bad:a:${delta}`);

          const check = verifyAuditPackageAgainstLedger(
            JSON.stringify(mutated),
            engine.getPublicLedger(),
            audKey
          );
          expect(check.valid).toBe(false);
        }
      ),
      { numRuns: 30 }
    );
  });
});
