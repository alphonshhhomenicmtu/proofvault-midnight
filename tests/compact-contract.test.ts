import { describe, expect, it } from "vitest";
import * as runtime from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  DisclosureTier,
  VaultStatus,
  ledger,
  pureCircuits,
  type Witnesses
} from "../contracts/managed/proofvault/contract/index.js";

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

const UINT64_TYPE = new runtime.CompactTypeUnsignedInteger(18446744073709551615n, 8);
const BYTES32_TYPE = new runtime.CompactTypeBytes(32);

function bytes32FromLabel(label: string): Uint8Array {
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

function createWitnesses(): Witnesses<ProofVaultPrivateState> {
  return {
    operatorSecretKey: ({ privateState }) => [privateState, privateState.operatorSecretKey],
    treasurySecretBalance: ({ privateState }) => [privateState, privateState.treasurySecretBalance],
    treasuryBlindingFactor: ({ privateState }) => [privateState, privateState.treasuryBlindingFactor],
    nextTreasuryBlindingFactor: ({ privateState }) => [privateState, privateState.nextTreasuryBlindingFactor],
    invoiceVendorId: ({ privateState }) => [privateState, privateState.invoiceVendorId],
    invoiceLineItemsHash: ({ privateState }) => [privateState, privateState.invoiceLineItemsHash],
    invoiceAmount: ({ privateState }) => [privateState, privateState.invoiceAmount],
    invoiceSalt: ({ privateState }) => [privateState, privateState.invoiceSalt],
    jurisdictionLeaf: ({ privateState }) => [privateState, privateState.jurisdictionLeaf],
    jurisdictionMerklePath: ({ privateState }) => [privateState, privateState.jurisdictionMerklePath],
    auditorViewingKeyHash: ({ privateState }) => [privateState, privateState.auditorViewingKeyHash]
  };
}

class CompiledProofVaultSimulator {
  public readonly contract: Contract<ProofVaultPrivateState>;
  public readonly contractAddress: string;
  public readonly coinPublicKey: string;
  public contractState: runtime.ContractState;
  public privateState: ProofVaultPrivateState;

  private constructor(
    contract: Contract<ProofVaultPrivateState>,
    contractAddress: string,
    coinPublicKey: string,
    contractState: runtime.ContractState,
    privateState: ProofVaultPrivateState
  ) {
    this.contract = contract;
    this.contractAddress = contractAddress;
    this.coinPublicKey = coinPublicKey;
    this.contractState = contractState;
    this.privateState = privateState;
  }

  public static async deploy(params: {
    operatorSk: Uint8Array;
    initialBalance: bigint;
    initialSalt: Uint8Array;
    maxSingleSettlement: bigint;
    minReserveFloor: bigint;
    auditorVkHash: Uint8Array;
  }): Promise<CompiledProofVaultSimulator> {
    const contract = new Contract<ProofVaultPrivateState>(createWitnesses());
    const contractAddress = runtime.sampleContractAddress();
    const coinPublicKey = runtime.toHex(bytes32FromLabel("proofvault:coin-pk"));
    const initOperatorPk = pureCircuits.deriveOperatorPublicKey(params.operatorSk);
    const initCommitment = runtime.persistentCommit(
      UINT64_TYPE,
      params.initialBalance,
      params.initialSalt
    );

    const initialPrivateState: ProofVaultPrivateState = {
      operatorSecretKey: params.operatorSk,
      treasurySecretBalance: params.initialBalance,
      treasuryBlindingFactor: params.initialSalt,
      nextTreasuryBlindingFactor: bytes32FromLabel("salt:next:0"),
      invoiceVendorId: bytes32FromLabel("vendor:init"),
      invoiceLineItemsHash: bytes32FromLabel("lineitems:init"),
      invoiceAmount: 0n,
      invoiceSalt: bytes32FromLabel("inv:salt:0"),
      jurisdictionLeaf: bytes32FromLabel("iso:US"),
      jurisdictionMerklePath: emptyMerklePath(bytes32FromLabel("iso:US")),
      auditorViewingKeyHash: params.auditorVkHash
    };

    const constructorCtx = runtime.createConstructorContext(initialPrivateState, coinPublicKey);
    const deployed = await contract.initialState(
      constructorCtx,
      initOperatorPk,
      initCommitment,
      params.maxSingleSettlement,
      params.minReserveFloor
    );

    return new CompiledProofVaultSimulator(
      contract,
      contractAddress,
      coinPublicKey,
      deployed.currentContractState,
      deployed.currentPrivateState
    );
  }

  public getLedger() {
    return ledger(this.contractState.data);
  }

  private buildContext(circuitId: string) {
    return runtime.createCircuitContext({
      circuitId,
      contractAddress: this.contractAddress,
      coinPublicKeyOrZswapState: this.coinPublicKey,
      contractState: this.contractState,
      privateState: this.privateState
    });
  }

  private commitResult(res: runtime.CircuitResults<ProofVaultPrivateState, unknown>): void {
    this.contractState.data = res.context.callContext.currentQueryContext.state;
    if (res.context.callContext.currentPrivateState !== undefined) {
      this.privateState = res.context.callContext.currentPrivateState;
    }
  }

  public async registerJurisdiction(digest: Uint8Array): Promise<void> {
    const ctx = this.buildContext("registerApprovedJurisdiction");
    const res = await this.contract.impureCircuits.registerApprovedJurisdiction(ctx, digest);
    this.commitResult(res);
  }

  public async proveSolvency(claimedMinFloor: bigint): Promise<Uint8Array> {
    const ctx = this.buildContext("proveTreasurySolvency");
    const res = await this.contract.impureCircuits.proveTreasurySolvency(ctx, claimedMinFloor);
    this.commitResult(res);
    return res.result;
  }

  public async settleInvoice(
    budgetTierCap: bigint,
    tier: DisclosureTier,
    witnessPatch: Partial<ProofVaultPrivateState>
  ): Promise<Uint8Array> {
    this.privateState = { ...this.privateState, ...witnessPatch };
    const ctx = this.buildContext("settleConfidentialInvoice");
    const res = await this.contract.impureCircuits.settleConfidentialInvoice(
      ctx,
      budgetTierCap,
      tier
    );
    this.commitResult(res);
    return res.result;
  }

  public async updatePolicy(
    newMax: bigint,
    newFloor: bigint,
    newStatus: VaultStatus
  ): Promise<void> {
    const ctx = this.buildContext("updateGovernancePolicy");
    const res = await this.contract.impureCircuits.updateGovernancePolicy(
      ctx,
      newMax,
      newFloor,
      newStatus
    );
    this.commitResult(res);
  }

  public async verifyReceipt(receiptId: Uint8Array): Promise<boolean> {
    const ctx = this.buildContext("verifyReceiptOnChain");
    const res = await this.contract.impureCircuits.verifyReceiptOnChain(ctx, receiptId);
    return res.result;
  }
}

describe("Compiled Compact 0.28.0 Contract (proofvault.compact via @midnight-ntwrk/compact-runtime@0.21.0)", () => {
  const operatorSk = bytes32FromLabel("operator:master:secret:2026");
  const initialSalt = bytes32FromLabel("treasury:salt:genesis");
  const auditorVkHash = bytes32FromLabel("auditor:deloitte-zk:vk");
  const isoCH = bytes32FromLabel("iso:CH");
  const isoSG = bytes32FromLabel("iso:SG");
  const isoKP = bytes32FromLabel("iso:KP");

  async function bootVault() {
    const sim = await CompiledProofVaultSimulator.deploy({
      operatorSk,
      initialBalance: 245_000_000n, // $2,450,000.00
      initialSalt,
      maxSingleSettlement: 15_000_000n, // $150,000.00
      minReserveFloor: 50_000_000n, // $500,000.00
      auditorVkHash
    });
    await sim.registerJurisdiction(isoCH);
    await sim.registerJurisdiction(isoSG);
    return sim;
  }

  it("initializes shielded commitment, governance caps, and HistoricMerkleTree jurisdictions", async () => {
    const sim = await bootVault();
    const state = sim.getLedger();

    expect(state.policyMaxSingleSettlement).toBe(15_000_000n);
    expect(state.policyMinReserveFloor).toBe(50_000_000n);
    expect(state.currentEpoch).toBe(1n);
    expect(state.vaultStatus).toBe(VaultStatus.Active);
    expect(state.settledInvoiceCount).toBe(0n);
    expect(state.approvedJurisdictions.firstFree()).toBe(2n);
    expect(state.approvedJurisdictions.findPathForLeaf(isoCH)).toBeDefined();
    expect(state.approvedJurisdictions.findPathForLeaf(isoKP)).toBeUndefined();
  });

  it("generates a verifiable ZK solvency attestation without disclosing exact treasury balance", async () => {
    const sim = await bootVault();
    const attestation = await sim.proveSolvency(200_000_000n); // prove >= $2.0M
    expect(attestation).toBeInstanceOf(Uint8Array);
    expect(attestation.length).toBe(32);

    // Rejects claiming a floor above actual private balance ($2.45M)
    await expect(sim.proveSolvency(300_000_000n)).rejects.toThrow(
      /Treasury below requested solvency floor/
    );
  });

  it("settles a confidential invoice atomically, re-blinds balance, records nullifier, and verifies receipt on-chain", async () => {
    const sim = await bootVault();
    const pathCH = sim.getLedger().approvedJurisdictions.findPathForLeaf(isoCH);
    expect(pathCH).toBeDefined();

    const vendorId = bytes32FromLabel("vendor:ch:halcyon-security-ag");
    const lineItemsHash = bytes32FromLabel("inv:2026-051:zk-formal-audit");
    const invSalt = bytes32FromLabel("inv:salt:051");
    const nextSalt = bytes32FromLabel("treasury:salt:1");
    const amount = 4_250_000n; // $42,500
    const cap = 5_000_000n; // $50,000 tier

    const receiptId = await sim.settleInvoice(cap, DisclosureTier.AuditorScoped, {
      invoiceVendorId: vendorId,
      invoiceLineItemsHash: lineItemsHash,
      invoiceAmount: amount,
      invoiceSalt: invSalt,
      jurisdictionLeaf: isoCH,
      jurisdictionMerklePath: pathCH!,
      nextTreasuryBlindingFactor: nextSalt
    });

    // Update local private treasury balance after successful settlement
    sim.privateState = {
      ...sim.privateState,
      treasurySecretBalance: 245_000_000n - amount,
      treasuryBlindingFactor: nextSalt
    };

    const updatedLedger = sim.getLedger();
    expect(updatedLedger.settledInvoiceCount).toBe(1n);
    expect(await sim.verifyReceipt(receiptId)).toBe(true);

    const receipt = updatedLedger.auditReceipts.lookup(receiptId);
    const expectedNullifier = pureCircuits.deriveNullifier(vendorId, lineItemsHash);
    const expectedInvCommit = pureCircuits.deriveInvoiceCommitment(
      vendorId,
      lineItemsHash,
      amount,
      invSalt
    );

    expect(runtime.toHex(receipt.nullifier)).toBe(runtime.toHex(expectedNullifier));
    expect(runtime.toHex(receipt.invoiceCommitment)).toBe(runtime.toHex(expectedInvCommit));
    expect(receipt.budgetTierCap).toBe(cap);
    expect(receipt.disclosureTier).toBe(DisclosureTier.AuditorScoped);
    expect(receipt.settledEpoch).toBe(1n);
    expect(updatedLedger.usedInvoiceNullifiers.member(expectedNullifier)).toBe(true);
    // AuditorScoped must emit a non-zero scoped auditorTag
    expect(receipt.auditorTag.some((b) => b !== 0)).toBe(true);

    // Confirm post-settlement solvency proof works with the new re-blinded balance commitment
    const postSolvency = await sim.proveSolvency(240_000_000n);
    expect(postSolvency.length).toBe(32);
  });

  it("zeroes auditorTag under MinimalSolvency disclosure tier", async () => {
    const sim = await bootVault();
    const pathSG = sim.getLedger().approvedJurisdictions.findPathForLeaf(isoSG)!;
    const receiptId = await sim.settleInvoice(3_000_000n, DisclosureTier.MinimalSolvency, {
      invoiceVendorId: bytes32FromLabel("vendor:sg:kestrel"),
      invoiceLineItemsHash: bytes32FromLabel("inv:2026-052:milestone"),
      invoiceAmount: 2_400_000n,
      invoiceSalt: bytes32FromLabel("inv:salt:052"),
      jurisdictionLeaf: isoSG,
      jurisdictionMerklePath: pathSG,
      nextTreasuryBlindingFactor: bytes32FromLabel("treasury:salt:minimal")
    });

    const receipt = sim.getLedger().auditReceipts.lookup(receiptId);
    expect(receipt.disclosureTier).toBe(DisclosureTier.MinimalSolvency);
    expect(receipt.auditorTag.every((b) => b === 0)).toBe(true);
  });

  it("blocks double-settlement replay attacks via usedInvoiceNullifiers", async () => {
    const sim = await bootVault();
    const pathCH = sim.getLedger().approvedJurisdictions.findPathForLeaf(isoCH)!;
    const vendorId = bytes32FromLabel("vendor:ch:replay-target");
    const lineItemsHash = bytes32FromLabel("inv:2026-099:unique-deliverable");
    const nextSalt = bytes32FromLabel("treasury:salt:after-first");

    await sim.settleInvoice(5_000_000n, DisclosureTier.ThresholdBand, {
      invoiceVendorId: vendorId,
      invoiceLineItemsHash: lineItemsHash,
      invoiceAmount: 1_500_000n,
      invoiceSalt: bytes32FromLabel("inv:salt:first"),
      jurisdictionLeaf: isoCH,
      jurisdictionMerklePath: pathCH,
      nextTreasuryBlindingFactor: nextSalt
    });

    // Advance private balance & salt, then attempt to replay exact same invoice with fresh salt
    sim.privateState = {
      ...sim.privateState,
      treasurySecretBalance: 245_000_000n - 1_500_000n,
      treasuryBlindingFactor: nextSalt
    };

    await expect(
      sim.settleInvoice(5_000_000n, DisclosureTier.ThresholdBand, {
        invoiceVendorId: vendorId,
        invoiceLineItemsHash: lineItemsHash,
        invoiceAmount: 1_500_000n,
        invoiceSalt: bytes32FromLabel("inv:salt:replay-attempt"),
        jurisdictionLeaf: isoCH,
        jurisdictionMerklePath: pathCH,
        nextTreasuryBlindingFactor: bytes32FromLabel("treasury:salt:after-replay")
      })
    ).rejects.toThrow(/Invoice nullifier already spent/);
  });

  it("blocks sanctioned / unlisted jurisdictions via HistoricMerkleTree root verification", async () => {
    const sim = await bootVault();
    const forgedPath = emptyMerklePath(isoKP);

    await expect(
      sim.settleInvoice(5_000_000n, DisclosureTier.AuditorScoped, {
        invoiceVendorId: bytes32FromLabel("vendor:kp:sanctioned"),
        invoiceLineItemsHash: bytes32FromLabel("inv:2026-901:blocked"),
        invoiceAmount: 1_000_000n,
        invoiceSalt: bytes32FromLabel("inv:salt:blocked"),
        jurisdictionLeaf: isoKP,
        jurisdictionMerklePath: forgedPath,
        nextTreasuryBlindingFactor: bytes32FromLabel("treasury:salt:blocked")
      })
    ).rejects.toThrow(/Jurisdiction is not in the approved compliance Merkle tree/);
  });

  it("blocks unauthorized operators, cap violations, reserve floor breaches, and paused vaults", async () => {
    const sim = await bootVault();
    const pathCH = sim.getLedger().approvedJurisdictions.findPathForLeaf(isoCH)!;

    // 1. Unauthorized operator secret key
    const wrongSk = bytes32FromLabel("attacker:forged-sk");
    await expect(
      sim.settleInvoice(5_000_000n, DisclosureTier.ThresholdBand, {
        operatorSecretKey: wrongSk,
        invoiceVendorId: bytes32FromLabel("vendor:ch:a"),
        invoiceLineItemsHash: bytes32FromLabel("inv:a"),
        invoiceAmount: 1_000_000n,
        jurisdictionLeaf: isoCH,
        jurisdictionMerklePath: pathCH
      })
    ).rejects.toThrow(/Unauthorized treasury operator/);

    // Restore valid operator key
    sim.privateState = { ...sim.privateState, operatorSecretKey: operatorSk };

    // 2. Invoice exceeds declared budget tier cap
    await expect(
      sim.settleInvoice(2_000_000n, DisclosureTier.ThresholdBand, {
        invoiceVendorId: bytes32FromLabel("vendor:ch:b"),
        invoiceLineItemsHash: bytes32FromLabel("inv:b"),
        invoiceAmount: 2_500_000n,
        jurisdictionLeaf: isoCH,
        jurisdictionMerklePath: pathCH
      })
    ).rejects.toThrow(/Invoice exceeds declared budget tier cap/);

    // 3. Budget cap exceeds governance ceiling ($150,000)
    await expect(
      sim.settleInvoice(20_000_000n, DisclosureTier.ThresholdBand, {
        invoiceVendorId: bytes32FromLabel("vendor:ch:c"),
        invoiceLineItemsHash: bytes32FromLabel("inv:c"),
        invoiceAmount: 16_000_000n,
        jurisdictionLeaf: isoCH,
        jurisdictionMerklePath: pathCH
      })
    ).rejects.toThrow(/Budget tier exceeds governance ceiling/);

    // 4. Pause vault via governance circuit breaker
    await sim.updatePolicy(15_000_000n, 244_500_000n, VaultStatus.Paused);
    expect(sim.getLedger().vaultStatus).toBe(VaultStatus.Paused);
    expect(sim.getLedger().currentEpoch).toBe(2n);

    await expect(
      sim.settleInvoice(5_000_000n, DisclosureTier.ThresholdBand, {
        invoiceVendorId: bytes32FromLabel("vendor:ch:d"),
        invoiceLineItemsHash: bytes32FromLabel("inv:d"),
        invoiceAmount: 1_000_000n,
        jurisdictionLeaf: isoCH,
        jurisdictionMerklePath: pathCH
      })
    ).rejects.toThrow(/Vault is currently paused/);

    // 5. Resume vault with high reserve floor ($2,445,000) -> $10,000 payout breaches reserve floor
    await sim.updatePolicy(15_000_000n, 244_500_000n, VaultStatus.Active);
    await expect(
      sim.settleInvoice(5_000_000n, DisclosureTier.ThresholdBand, {
        invoiceVendorId: bytes32FromLabel("vendor:ch:e"),
        invoiceLineItemsHash: bytes32FromLabel("inv:e"),
        invoiceAmount: 1_000_000n,
        jurisdictionLeaf: isoCH,
        jurisdictionMerklePath: pathCH
      })
    ).rejects.toThrow(/Settlement breaches minimum reserve floor/);
  });

  it("audits on-chain serialized ContractState to verify zero private witness leakage", async () => {
    const sim = await bootVault();
    const pathCH = sim.getLedger().approvedJurisdictions.findPathForLeaf(isoCH)!;
    const secretVendor = bytes32FromLabel("SECRET_VENDOR_ACME_ZURICH");
    const secretLineItems = bytes32FromLabel("SECRET_SCOPE_42500_USD");

    await sim.settleInvoice(5_000_000n, DisclosureTier.AuditorScoped, {
      invoiceVendorId: secretVendor,
      invoiceLineItemsHash: secretLineItems,
      invoiceAmount: 4_250_000n,
      invoiceSalt: bytes32FromLabel("inv:salt:privacy-check"),
      jurisdictionLeaf: isoCH,
      jurisdictionMerklePath: pathCH,
      nextTreasuryBlindingFactor: bytes32FromLabel("treasury:salt:privacy-check")
    });

    const serializedPublicHex = runtime.toHex(sim.contractState.serialize());
    expect(serializedPublicHex).not.toContain(runtime.toHex(operatorSk));
    expect(serializedPublicHex).not.toContain(runtime.toHex(secretVendor));
    expect(serializedPublicHex).not.toContain(runtime.toHex(secretLineItems));
    expect(serializedPublicHex).not.toContain(runtime.toHex(initialSalt));
  });
});
