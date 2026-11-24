import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils";
import {
  DisclosureTier,
  VaultStatus,
  type AuditReceiptRecord,
  type ExportedAuditPackage,
  type InvoiceSettlementInput,
  type InvoiceSettlementResult,
  type JurisdictionEntry,
  type OnChainPayloadPreview,
  type PrivateWitnessVault,
  type PublicLedgerSnapshot,
  type ReceiptVerificationCheck,
  type ReceiptVerificationResult,
  type SolvencyAttestation,
  type ZkPipelineStep
} from "./types";

const TREE_DEPTH = 8;
const ZERO_BYTES_32 = "00".repeat(32);

export function pad32(label: string): Uint8Array {
  const out = new Uint8Array(32);
  const encoded = utf8ToBytes(label);
  out.set(encoded.subarray(0, 32));
  return out;
}

export function uint64ToBytes(value: number | bigint): Uint8Array {
  const big = BigInt(value);
  if (big < 0n || big > 0xffff_ffff_ffff_ffffn) {
    throw new Error("Uint<64> out of bounds");
  }
  const buf = new Uint8Array(8);
  let remaining = big;
  for (let i = 7; i >= 0; i--) {
    buf[i] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  return buf;
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export function sha256SimulatorHashBytes(...parts: Uint8Array[]): Uint8Array {
  return sha256(concatBytes(...parts));
}

export function sha256SimulatorHashHex(...parts: Uint8Array[]): string {
  return bytesToHex(sha256SimulatorHashBytes(...parts));
}

// Backwards-compatible exports for existing callers; clearly backed by SHA-256 in the browser simulator.
export const persistentHashBytes = sha256SimulatorHashBytes;
export const persistentHashHex = sha256SimulatorHashHex;

export function persistentCommitUint64(value: number | bigint, saltHex: string): string {
  return sha256SimulatorHashHex(pad32("midnight:commit:u64"), uint64ToBytes(value), hexToBytes(saltHex));
}

export function deriveOperatorPublicKeyHex(secretKeyHex: string): string {
  return sha256SimulatorHashHex(pad32("proofvault:operator:v1"), hexToBytes(secretKeyHex));
}

export function deriveAuditorCommitmentHex(auditorViewingKeyHashHex: string): string {
  return sha256SimulatorHashHex(
    pad32("proofvault:auditor-reg:v2"),
    hexToBytes(auditorViewingKeyHashHex)
  );
}

export function deriveNullifierBlindingSaltHex(operatorSecretKeyHex: string): string {
  return sha256SimulatorHashHex(
    pad32("proofvault:nullifier-salt:v2"),
    hexToBytes(operatorSecretKeyHex)
  );
}

export function deriveJurisdictionDigestHex(isoCode: string): string {
  return sha256SimulatorHashHex(pad32("proofvault:jurisdiction:v1"), pad32(isoCode.trim().toUpperCase()));
}

export function deriveVendorIdHex(vendorIdRaw: string): string {
  return sha256SimulatorHashHex(pad32("proofvault:vendor:v1"), utf8ToBytes(vendorIdRaw.trim()));
}

export function deriveLineItemsHashHex(invoiceRef: string, summary: string): string {
  return sha256SimulatorHashHex(
    pad32("proofvault:lineitems:v1"),
    utf8ToBytes(`${invoiceRef.trim()}::${summary.trim()}`)
  );
}

/**
 * Secret-keyed anti-replay nullifier matching ProofVault v2.1:
 * H("proofvault:nullifier:v2", nullifierBlindingSalt, vendorId, lineItemsHash).
 * Defeats offline dictionary guessing over low-entropy vendor/invoice labels and
 * isolates nullifier namespaces across distinct ProofVault deployments.
 */
export function deriveNullifierHex(
  nullifierBlindingSaltHex: string,
  vendorIdHex: string,
  lineItemsHashHex: string
): string {
  return sha256SimulatorHashHex(
    pad32("proofvault:nullifier:v2"),
    hexToBytes(nullifierBlindingSaltHex),
    hexToBytes(vendorIdHex),
    hexToBytes(lineItemsHashHex)
  );
}

/**
 * Unkeyed v1-style public dictionary guess (used in Adversarial Breaker Lab & tests
 * to demonstrate why external observers cannot grind the v2.1 nullifier set).
 */
export function deriveUnkeyedDictionaryGuessHex(vendorIdHex: string, lineItemsHashHex: string): string {
  return sha256SimulatorHashHex(
    pad32("proofvault:nullifier:v1"),
    hexToBytes(vendorIdHex),
    hexToBytes(lineItemsHashHex)
  );
}

/**
 * Jurisdiction-bound invoice commitment matching ProofVault v2.1:
 * binds vendorId, lineItemsHash, amount, AND jurisdictionLeafDigest under salt.
 */
export function deriveInvoiceCommitmentHex(
  vendorIdHex: string,
  lineItemsHashHex: string,
  amountCents: number,
  jurisdictionLeafDigestHex: string,
  saltHex: string
): string {
  const amountDigest = sha256SimulatorHashBytes(uint64ToBytes(amountCents));
  return sha256SimulatorHashHex(
    pad32("midnight:commit:invoice"),
    pad32("proofvault:invoice:v2"),
    hexToBytes(vendorIdHex),
    hexToBytes(lineItemsHashHex),
    amountDigest,
    hexToBytes(jurisdictionLeafDigestHex),
    hexToBytes(saltHex)
  );
}

export function deriveAuditorViewingKeyHashHex(viewingKeyHex: string): string {
  return sha256SimulatorHashHex(pad32("proofvault:auditor-vk:v1"), hexToBytes(viewingKeyHex));
}

export function deriveAuditorTagHex(auditorViewingKeyHashHex: string, invoiceCommitmentHex: string): string {
  return sha256SimulatorHashHex(
    pad32("proofvault:auditor:v1"),
    hexToBytes(auditorViewingKeyHashHex),
    hexToBytes(invoiceCommitmentHex)
  );
}

export function deriveReceiptIdHex(invoiceCommitmentHex: string, nullifierHex: string): string {
  return sha256SimulatorHashHex(
    pad32("proofvault:receipt:v1"),
    hexToBytes(invoiceCommitmentHex),
    hexToBytes(nullifierHex)
  );
}

export function deriveDeterministicSaltHex(seed: string): string {
  return sha256SimulatorHashHex(pad32("proofvault:salt:v1"), utf8ToBytes(seed));
}

interface MerkleProofStep {
  siblingHex: string;
  goesLeft: boolean;
}

class HistoricMerkleTreeEngine {
  private readonly depth: number;
  private readonly zeroHashes: string[];
  private leaves: string[] = [];
  private rootHistory: string[] = [];

  constructor(depth: number = TREE_DEPTH) {
    this.depth = depth;
    this.zeroHashes = [ZERO_BYTES_32];
    for (let level = 0; level < depth; level++) {
      const prev = hexToBytes(this.zeroHashes[level]);
      this.zeroHashes.push(sha256SimulatorHashHex(pad32("proofvault:merkle:node"), prev, prev));
    }
    this.rootHistory.push(this.computeRoot());
  }

  public insert(leafHex: string): { index: number; rootHex: string } {
    const maxLeaves = 1 << this.depth;
    if (this.leaves.length >= maxLeaves) {
      throw new Error("Approved jurisdiction Merkle tree is full");
    }
    const index = this.leaves.length;
    this.leaves.push(leafHex);
    const rootHex = this.computeRoot();
    this.rootHistory.push(rootHex);
    return { index, rootHex };
  }

  public getRoot(): string {
    return this.rootHistory[this.rootHistory.length - 1];
  }

  public getHistory(): string[] {
    return [...this.rootHistory];
  }

  public checkRoot(rootHex: string): boolean {
    return this.rootHistory.includes(rootHex);
  }

  public findPathForLeaf(leafHex: string): { leafHex: string; path: MerkleProofStep[] } | null {
    const index = this.leaves.indexOf(leafHex);
    if (index === -1) return null;

    const path: MerkleProofStep[] = [];
    let currentIndex = index;
    let levelNodes = [...this.leaves];

    for (let level = 0; level < this.depth; level++) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
      const siblingHex =
        siblingIndex < levelNodes.length ? levelNodes[siblingIndex] : this.zeroHashes[level];
      path.push({
        siblingHex,
        goesLeft: !isRight
      });

      const nextLevel: string[] = [];
      for (let i = 0; i < levelNodes.length; i += 2) {
        const left = hexToBytes(levelNodes[i]);
        const right = hexToBytes(
          i + 1 < levelNodes.length ? levelNodes[i + 1] : this.zeroHashes[level]
        );
        nextLevel.push(sha256SimulatorHashHex(pad32("proofvault:merkle:node"), left, right));
      }
      levelNodes = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    return { leafHex, path };
  }

  public verifyPathRoot(leafHex: string, path: MerkleProofStep[]): string {
    let current = hexToBytes(leafHex);
    for (const step of path) {
      const sibling = hexToBytes(step.siblingHex);
      current = step.goesLeft
        ? sha256SimulatorHashBytes(pad32("proofvault:merkle:node"), current, sibling)
        : sha256SimulatorHashBytes(pad32("proofvault:merkle:node"), sibling, current);
    }
    return bytesToHex(current);
  }

  private computeRoot(): string {
    if (this.leaves.length === 0) {
      return this.zeroHashes[this.depth];
    }
    let levelNodes = [...this.leaves];
    for (let level = 0; level < this.depth; level++) {
      const nextLevel: string[] = [];
      for (let i = 0; i < levelNodes.length; i += 2) {
        const left = hexToBytes(levelNodes[i]);
        const right = hexToBytes(
          i + 1 < levelNodes.length ? levelNodes[i + 1] : this.zeroHashes[level]
        );
        nextLevel.push(sha256SimulatorHashHex(pad32("proofvault:merkle:node"), left, right));
      }
      levelNodes = nextLevel;
    }
    return levelNodes[0];
  }
}

export interface ProofVaultInitConfig {
  operatorSecretKeyHex: string;
  initialTreasuryBalanceCents: number;
  initialBlindingFactorHex: string;
  auditorViewingKeyHex: string;
  maxSingleSettlementCents: number;
  minReserveFloorCents: number;
  initialJurisdictions: Array<{ code: string; label: string }>;
}

/**
 * SHA-256 Deterministic Circuit Simulator for static browser evaluation.
 *
 * Models the state transitions, witness isolation, and all 24 circuit invariants of
 * contracts/proofvault.compact (v2.1) using browser-native SHA-256 (@noble/hashes/sha256)
 * so reviewers can test settlements and adversarial attacks with zero Docker or wallet setup.
 *
 * Distinct from the compiled Midnight Compact 0.28.0 contract (contracts/managed/proofvault/),
 * which uses Midnight's native persistentHash/persistentCommit builtins via
 * @midnight-ntwrk/compact-runtime@0.21.0 and Proof Server 9.0.2 (exercised in `npm test`
 * and deployed live on Midnight Preview).
 */
export class ProofVaultEngine {
  private readonly contractAddress: string;
  private privateVault: PrivateWitnessVault;
  private treasuryAuthority: string;
  private authorizedAuditorCommitment: string;
  private treasuryBalanceCommitment: string;
  private policyMaxSingleSettlementCents: number;
  private policyMinReserveFloorCents: number;
  private currentEpoch: number;
  private vaultStatus: VaultStatus;
  private lastSolvencyAttestation: string;
  private lastSolvencyFloorCents: number;
  private lastSolvencyEpoch: number;
  private jurisdictionTree: HistoricMerkleTreeEngine;
  private jurisdictionEntries: JurisdictionEntry[] = [];
  private usedNullifiers: Set<string> = new Set();
  private receipts: Map<string, AuditReceiptRecord> = new Map();
  private settledCount = 0;
  private nonceCounter = 1;

  constructor(config: ProofVaultInitConfig) {
    if (config.maxSingleSettlementCents <= 0) {
      throw new Error("Max single settlement must be positive");
    }

    const auditorViewingKeyHashHex = deriveAuditorViewingKeyHashHex(config.auditorViewingKeyHex);
    const auditorCommitment = deriveAuditorCommitmentHex(auditorViewingKeyHashHex);
    if (auditorCommitment === ZERO_BYTES_32) {
      throw new Error("Authorized auditor commitment must be non-zero");
    }

    const nullifierBlindingSaltHex = deriveNullifierBlindingSaltHex(config.operatorSecretKeyHex);
    this.privateVault = {
      operatorSecretKeyHex: config.operatorSecretKeyHex,
      nullifierBlindingSaltHex,
      treasuryBalanceCents: config.initialTreasuryBalanceCents,
      treasuryBlindingFactorHex: config.initialBlindingFactorHex,
      auditorViewingKeyHex: config.auditorViewingKeyHex,
      auditorViewingKeyHashHex
    };

    this.treasuryAuthority = deriveOperatorPublicKeyHex(config.operatorSecretKeyHex);
    this.authorizedAuditorCommitment = auditorCommitment;
    this.treasuryBalanceCommitment = persistentCommitUint64(
      config.initialTreasuryBalanceCents,
      config.initialBlindingFactorHex
    );
    this.policyMaxSingleSettlementCents = config.maxSingleSettlementCents;
    this.policyMinReserveFloorCents = config.minReserveFloorCents;
    this.currentEpoch = 1;
    this.vaultStatus = VaultStatus.Active;
    this.lastSolvencyAttestation = ZERO_BYTES_32;
    this.lastSolvencyFloorCents = 0;
    this.lastSolvencyEpoch = 0;
    this.jurisdictionTree = new HistoricMerkleTreeEngine(TREE_DEPTH);
    this.contractAddress = `0200${sha256SimulatorHashHex(
      pad32("proofvault:contract:addr"),
      hexToBytes(this.treasuryAuthority)
    ).slice(0, 60)}`;

    for (const j of config.initialJurisdictions) {
      this.registerApprovedJurisdiction(j.code, j.label);
    }
  }

  public getPublicLedger(): PublicLedgerSnapshot {
    return {
      contractAddress: this.contractAddress,
      compactLanguageVersion: "0.28.0",
      compilerVersion: "0.36.1",
      zkirVersion: "zkir-3.2.1",
      treasuryAuthority: this.treasuryAuthority,
      authorizedAuditorCommitment: this.authorizedAuditorCommitment,
      treasuryBalanceCommitment: this.treasuryBalanceCommitment,
      policyMaxSingleSettlementCents: this.policyMaxSingleSettlementCents,
      policyMinReserveFloorCents: this.policyMinReserveFloorCents,
      currentEpoch: this.currentEpoch,
      vaultStatus: this.vaultStatus,
      lastSolvencyAttestation: this.lastSolvencyAttestation,
      lastSolvencyFloorCents: this.lastSolvencyFloorCents,
      lastSolvencyEpoch: this.lastSolvencyEpoch,
      approvedJurisdictionsRoot: this.jurisdictionTree.getRoot(),
      approvedJurisdictionsHistory: this.jurisdictionTree.getHistory(),
      approvedJurisdictions: [...this.jurisdictionEntries],
      usedInvoiceNullifiers: [...this.usedNullifiers],
      auditReceipts: [...this.receipts.values()].reverse(),
      settledInvoiceCount: this.settledCount
    };
  }

  public getPrivateWitnessVault(): PrivateWitnessVault {
    return { ...this.privateVault };
  }

  public registerApprovedJurisdiction(
    code: string,
    label: string,
    operatorSecretKeyOverride?: string
  ): { ok: boolean; error?: string; entry?: JurisdictionEntry } {
    const normalizedCode = code.trim().toUpperCase();
    if (!/^[A-Z]{2,3}$/.test(normalizedCode)) {
      return { ok: false, error: "Jurisdiction code must be a 2–3 letter ISO code (e.g. CH, SG, US)." };
    }
    const candidateSk = operatorSecretKeyOverride ?? this.privateVault.operatorSecretKeyHex;
    if (deriveOperatorPublicKeyHex(candidateSk) !== this.treasuryAuthority) {
      return { ok: false, error: "Unauthorized treasury operator" };
    }
    if (this.jurisdictionEntries.some((entry) => entry.code === normalizedCode)) {
      return { ok: false, error: `Jurisdiction ${normalizedCode} is already registered.` };
    }

    const digestHex = deriveJurisdictionDigestHex(normalizedCode);
    const { index } = this.jurisdictionTree.insert(digestHex);
    const entry: JurisdictionEntry = {
      code: normalizedCode,
      label: label.trim() || normalizedCode,
      digestHex,
      leafIndex: index
    };
    this.jurisdictionEntries.push(entry);
    return { ok: true, entry };
  }

  public proveTreasurySolvency(
    claimedMinFloorCents: number,
    operatorSecretKeyOverride?: string
  ): SolvencyAttestation {
    const steps: ZkPipelineStep[] = [];

    const opSk = operatorSecretKeyOverride ?? this.privateVault.operatorSecretKeyHex;
    const opAuthorized = deriveOperatorPublicKeyHex(opSk) === this.treasuryAuthority;
    steps.push({
      id: "operator-auth",
      stage: "Operator Authorization Witness",
      circuitConstraint: "deriveOperatorPublicKey(operatorSecretKey()) == treasuryAuthority",
      status: opAuthorized ? "passed" : "failed",
      detail: opAuthorized
        ? `Authority ${this.treasuryAuthority.slice(0, 14)}... proved privately`
        : "Unauthorized treasury operator",
      durationMs: 7
    });
    if (!opAuthorized) {
      return {
        ok: false,
        error: "Unauthorized treasury operator",
        errorCode: "ERR_UNAUTHORIZED_OPERATOR",
        claimedMinFloorCents,
        treasuryBalanceCommitment: this.treasuryBalanceCommitment,
        epoch: this.currentEpoch,
        timestampIso: new Date().toISOString(),
        steps
      };
    }

    const openedCommitment = persistentCommitUint64(
      this.privateVault.treasuryBalanceCents,
      this.privateVault.treasuryBlindingFactorHex
    );

    const commitmentValid = openedCommitment === this.treasuryBalanceCommitment;
    steps.push({
      id: "commit-open",
      stage: "Treasury Commitment Opening",
      circuitConstraint: "persistentCommit<Uint<64>>(balance, salt) == treasuryBalanceCommitment",
      status: commitmentValid ? "passed" : "failed",
      detail: commitmentValid
        ? `Commitment ${openedCommitment.slice(0, 14)}... verified privately`
        : "Treasury commitment mismatch",
      durationMs: 14
    });
    if (!commitmentValid) {
      return {
        ok: false,
        error: "Treasury commitment mismatch",
        errorCode: "ERR_COMMITMENT_MISMATCH",
        claimedMinFloorCents,
        treasuryBalanceCommitment: this.treasuryBalanceCommitment,
        epoch: this.currentEpoch,
        timestampIso: new Date().toISOString(),
        steps
      };
    }

    const aboveGovernance = this.privateVault.treasuryBalanceCents >= this.policyMinReserveFloorCents;
    steps.push({
      id: "gov-floor",
      stage: "Governance Reserve Floor",
      circuitConstraint: "balance >= policyMinReserveFloor",
      status: aboveGovernance ? "passed" : "failed",
      detail: aboveGovernance
        ? `Shielded balance exceeds public reserve floor ($${(this.policyMinReserveFloorCents / 100).toLocaleString()})`
        : "Treasury below governance reserve floor",
      durationMs: 9
    });
    if (!aboveGovernance) {
      return {
        ok: false,
        error: "Treasury below governance reserve floor",
        errorCode: "ERR_GOVERNANCE_FLOOR_BREACH",
        claimedMinFloorCents,
        treasuryBalanceCommitment: this.treasuryBalanceCommitment,
        epoch: this.currentEpoch,
        timestampIso: new Date().toISOString(),
        steps
      };
    }

    const aboveRequested = this.privateVault.treasuryBalanceCents >= claimedMinFloorCents;
    steps.push({
      id: "claimed-floor",
      stage: "Requested Solvency Threshold",
      circuitConstraint: "balance >= claimedMinFloor",
      status: aboveRequested ? "passed" : "failed",
      detail: aboveRequested
        ? `Proved solvency >= $${(claimedMinFloorCents / 100).toLocaleString()} without revealing exact balance`
        : `Shielded treasury cannot prove solvency above $${(claimedMinFloorCents / 100).toLocaleString()}`,
      durationMs: 11
    });
    if (!aboveRequested) {
      return {
        ok: false,
        error: "Treasury below requested solvency floor",
        errorCode: "ERR_SOLVENCY_FLOOR_BREACH",
        claimedMinFloorCents,
        treasuryBalanceCommitment: this.treasuryBalanceCommitment,
        epoch: this.currentEpoch,
        timestampIso: new Date().toISOString(),
        steps
      };
    }

    const attestationDigest = sha256SimulatorHashHex(
      pad32("proofvault:solvency:v1"),
      hexToBytes(this.treasuryBalanceCommitment),
      sha256SimulatorHashBytes(uint64ToBytes(claimedMinFloorCents))
    );

    // Persist solvency attestation into public ledger state (v2.1 fix)
    this.lastSolvencyAttestation = attestationDigest;
    this.lastSolvencyFloorCents = claimedMinFloorCents;
    this.lastSolvencyEpoch = this.currentEpoch;

    steps.push({
      id: "disclose-attestation",
      stage: "On-Chain Solvency State Write",
      circuitConstraint: "lastSolvencyAttestation = disclose(attestation); lastSolvencyFloor = disclose(claimedMinFloor)",
      status: "passed",
      detail: `Attestation ${attestationDigest.slice(0, 18)}... recorded in ledger state (Epoch #${this.currentEpoch})`,
      durationMs: 18
    });

    return {
      ok: true,
      attestationDigest,
      claimedMinFloorCents,
      treasuryBalanceCommitment: this.treasuryBalanceCommitment,
      epoch: this.currentEpoch,
      timestampIso: new Date().toISOString(),
      steps
    };
  }

  public settleConfidentialInvoice(input: InvoiceSettlementInput): InvoiceSettlementResult {
    const startMs = Date.now();
    const steps: ZkPipelineStep[] = [];

    // 1. Vault status & Operator authorization
    if (this.vaultStatus !== VaultStatus.Active) {
      steps.push({
        id: "vault-active",
        stage: "Vault Circuit Breaker & Operator Witness",
        circuitConstraint: "assert(vaultStatus == VaultStatus.Active)",
        status: "failed",
        detail: "Vault is currently paused by governance circuit breaker",
        durationMs: 4
      });
      return {
        ok: false,
        error: "Vault is currently paused",
        errorCode: "ERR_VAULT_PAUSED",
        steps,
        proofTimeMs: Math.max(12, Date.now() - startMs)
      };
    }

    const opSk = input.operatorSecretKeyOverride ?? this.privateVault.operatorSecretKeyHex;
    const derivedOpPk = deriveOperatorPublicKeyHex(opSk);
    if (derivedOpPk !== this.treasuryAuthority) {
      steps.push({
        id: "operator-auth",
        stage: "Operator Authorization Witness",
        circuitConstraint: "deriveOperatorPublicKey(operatorSecretKey()) == treasuryAuthority",
        status: "failed",
        detail: "Supplied private operator secret key does not match on-chain treasuryAuthority",
        durationMs: 8
      });
      return {
        ok: false,
        error: "Unauthorized treasury operator",
        errorCode: "ERR_UNAUTHORIZED_OPERATOR",
        steps,
        proofTimeMs: Math.max(15, Date.now() - startMs)
      };
    }
    steps.push({
      id: "operator-auth",
      stage: "Operator Authorization Witness",
      circuitConstraint: "vaultStatus == Active && deriveOperatorPublicKey(sk) == treasuryAuthority",
      status: "passed",
      detail: `Authority ${this.treasuryAuthority.slice(0, 14)}... proved privately`,
      durationMs: 11
    });

    // 2. Open shielded treasury balance commitment
    const openedCommitment = persistentCommitUint64(
      this.privateVault.treasuryBalanceCents,
      this.privateVault.treasuryBlindingFactorHex
    );
    if (openedCommitment !== this.treasuryBalanceCommitment) {
      steps.push({
        id: "treasury-commit",
        stage: "Treasury Commitment Opening",
        circuitConstraint: "persistentCommit<Uint<64>>(balance, salt) == treasuryBalanceCommitment",
        status: "failed",
        detail: "Private witness balance/salt does not match on-chain commitment",
        durationMs: 12
      });
      return {
        ok: false,
        error: "Treasury commitment mismatch",
        errorCode: "ERR_COMMITMENT_MISMATCH",
        steps,
        proofTimeMs: Math.max(18, Date.now() - startMs)
      };
    }
    steps.push({
      id: "treasury-commit",
      stage: "Treasury Commitment Opening",
      circuitConstraint: "persistentCommit<Uint<64>>(balance, salt) == treasuryBalanceCommitment",
      status: "passed",
      detail: `Opened shielded commitment ${openedCommitment.slice(0, 14)}... locally`,
      durationMs: 14
    });

    // 3. Strict amount bounds (cap > amount) & post-settlement solvency invariant
    const amount = Math.round(input.amountCents);
    const cap = Math.round(input.budgetTierCapCents);
    const balance = this.privateVault.treasuryBalanceCents;
    let solvencyError: string | null = null;
    let solvencyErrorCode: string | undefined;

    if (amount <= 0) {
      solvencyError = "Invoice amount must be greater than zero";
      solvencyErrorCode = "ERR_ZERO_AMOUNT";
    } else if (amount >= cap) {
      solvencyError = "Invoice must be strictly below declared budget tier cap";
      solvencyErrorCode = amount === cap ? "ERR_STRICT_CAP_BOUND" : "ERR_EXCEEDS_TIER_CAP";
    } else if (cap > this.policyMaxSingleSettlementCents) {
      solvencyError = "Budget tier exceeds governance ceiling";
      solvencyErrorCode = "ERR_POLICY_CAP_EXCEEDED";
    } else if (balance < amount) {
      solvencyError = "Insufficient treasury balance";
      solvencyErrorCode = "ERR_INSUFFICIENT_BALANCE";
    } else if (balance - amount < this.policyMinReserveFloorCents) {
      solvencyError = "Settlement breaches minimum reserve floor";
      solvencyErrorCode = "ERR_RESERVE_FLOOR_BREACH";
    }

    if (solvencyError) {
      steps.push({
        id: "solvency-bounds",
        stage: "Strict Cap (cap > amount) & Post-Settlement Solvency",
        circuitConstraint: "0 < amount < budgetTierCap <= policyMax && balance - amount >= policyMinReserveFloor",
        status: "failed",
        detail: solvencyError,
        durationMs: 10
      });
      return {
        ok: false,
        error: solvencyError,
        errorCode: solvencyErrorCode,
        steps,
        proofTimeMs: Math.max(24, Date.now() - startMs)
      };
    }

    // 4. Distinct Disclosure Tier cap constraints
    if (
      input.disclosureTier === DisclosureTier.MinimalSolvency &&
      cap !== this.policyMaxSingleSettlementCents
    ) {
      steps.push({
        id: "tier-policy",
        stage: "Disclosure Tier Policy Isolation",
        circuitConstraint: "publicTier != MinimalSolvency || publicCap == policyMaxSingleSettlement",
        status: "failed",
        detail: `MinimalSolvency requires the full governance ceiling ($${(this.policyMaxSingleSettlementCents / 100).toLocaleString()}) so no narrow spend band leaks`,
        durationMs: 8
      });
      return {
        ok: false,
        error: "MinimalSolvency tier must use full governance ceiling",
        errorCode: "ERR_TIER_CAP_POLICY_MISMATCH",
        steps,
        proofTimeMs: Math.max(26, Date.now() - startMs)
      };
    }

    if (
      input.disclosureTier === DisclosureTier.ThresholdBand &&
      cap >= this.policyMaxSingleSettlementCents
    ) {
      steps.push({
        id: "tier-policy",
        stage: "Disclosure Tier Policy Isolation",
        circuitConstraint: "publicTier != ThresholdBand || publicCap < policyMaxSingleSettlement",
        status: "failed",
        detail: `ThresholdBand requires a budget cap strictly below the governance ceiling ($${(this.policyMaxSingleSettlementCents / 100).toLocaleString()})`,
        durationMs: 8
      });
      return {
        ok: false,
        error: "ThresholdBand cap must be strictly below governance ceiling",
        errorCode: "ERR_TIER_CAP_POLICY_MISMATCH",
        steps,
        proofTimeMs: Math.max(26, Date.now() - startMs)
      };
    }

    steps.push({
      id: "solvency-bounds",
      stage: "Strict Cap (cap > amount), Tier Policy & Solvency Floor",
      circuitConstraint: "0 < amount < publicCap <= policyMax && tierCapRule && bal - amt >= floor",
      status: "passed",
      detail: `Proved private payout strictly below $${(cap / 100).toLocaleString()} (${DisclosureTier[input.disclosureTier]}) & remaining balance >= $${(this.policyMinReserveFloorCents / 100).toLocaleString()}`,
      durationMs: 16
    });

    // 5. HistoricMerkleTree non-sanctioned jurisdiction membership proof & leaf binding
    const pathJurisdictionDigest = deriveJurisdictionDigestHex(input.jurisdictionCode);
    const witnessJurisdictionDigest = input.jurisdictionLeafOverrideCode
      ? deriveJurisdictionDigestHex(input.jurisdictionLeafOverrideCode)
      : pathJurisdictionDigest;

    if (witnessJurisdictionDigest !== pathJurisdictionDigest) {
      steps.push({
        id: "jurisdiction-merkle",
        stage: "Bound Jurisdiction Leaf & Merkle Path Check",
        circuitConstraint: "assert(jPath.leaf == jLeaf) && deriveInvoiceCommitment(..., jLeaf, salt)",
        status: "failed",
        detail: `Leaf swap rejected: witness jurisdiction "${input.jurisdictionLeafOverrideCode?.toUpperCase()}" does not match Merkle path leaf "${input.jurisdictionCode.toUpperCase()}"`,
        durationMs: 17
      });
      return {
        ok: false,
        error: "Jurisdiction leaf does not match Merkle path",
        errorCode: "ERR_JURISDICTION_LEAF_MISMATCH",
        steps,
        proofTimeMs: Math.max(34, Date.now() - startMs)
      };
    }

    const merklePath = this.jurisdictionTree.findPathForLeaf(witnessJurisdictionDigest);
    if (!merklePath) {
      steps.push({
        id: "jurisdiction-merkle",
        stage: "HistoricMerkleTree Jurisdiction Compliance",
        circuitConstraint: "approvedJurisdictions.checkRoot(disclose(merkleTreePathRoot<8, Bytes<32>>(jPath)))",
        status: "failed",
        detail: `Jurisdiction "${input.jurisdictionCode.toUpperCase()}" is NOT in the approved non-sanctioned Merkle tree`,
        durationMs: 19
      });
      return {
        ok: false,
        error: "Jurisdiction is not in the approved compliance Merkle tree",
        errorCode: "ERR_UNAPPROVED_JURISDICTION",
        steps,
        proofTimeMs: Math.max(36, Date.now() - startMs)
      };
    }

    const computedRoot = this.jurisdictionTree.verifyPathRoot(merklePath.leafHex, merklePath.path);
    if (!this.jurisdictionTree.checkRoot(computedRoot)) {
      steps.push({
        id: "jurisdiction-merkle",
        stage: "HistoricMerkleTree Jurisdiction Compliance",
        circuitConstraint: "approvedJurisdictions.checkRoot(disclose(merkleTreePathRoot<8, Bytes<32>>(jPath)))",
        status: "failed",
        detail: "Computed Merkle path root failed HistoricMerkleTree checkRoot()",
        durationMs: 18
      });
      return {
        ok: false,
        error: "Jurisdiction is not in the approved compliance Merkle tree",
        errorCode: "ERR_UNAPPROVED_JURISDICTION",
        steps,
        proofTimeMs: Math.max(36, Date.now() - startMs)
      };
    }
    steps.push({
      id: "jurisdiction-merkle",
      stage: "Bound Jurisdiction Leaf & Merkle Inclusion",
      circuitConstraint: "jPath.leaf == jLeaf && approvedJurisdictions.checkRoot(root) && jLeaf in invoiceCommitment",
      status: "passed",
      detail: `Depth-8 inclusion verified against root ${computedRoot.slice(0, 14)}... and bound into invoiceCommitment (ISO code hidden)`,
      durationMs: 22
    });

    // 6. Secret-keyed anti-replay nullifier & jurisdiction-bound invoice commitment
    const vendorIdHex = deriveVendorIdHex(input.vendorIdRaw);
    const lineItemsHashHex = deriveLineItemsHashHex(input.invoiceReference, input.lineItemsSummary);
    const nullifierSaltHex = deriveNullifierBlindingSaltHex(opSk);
    const nullifier = deriveNullifierHex(nullifierSaltHex, vendorIdHex, lineItemsHashHex);

    if (this.usedNullifiers.has(nullifier)) {
      steps.push({
        id: "nullifier-check",
        stage: "Secret-Keyed Nullifier Anti-Replay Guard",
        circuitConstraint: "assert(!usedInvoiceNullifiers.member(disclose(deriveNullifier(nullifierSalt, vendorId, lineItemsHash))))",
        status: "failed",
        detail: `Replay blocked: keyed nullifier ${nullifier.slice(0, 16)}... is already spent on-chain`,
        durationMs: 9
      });
      return {
        ok: false,
        error: "Invoice nullifier already spent",
        errorCode: "ERR_NULLIFIER_REPLAY",
        steps,
        proofTimeMs: Math.max(41, Date.now() - startMs)
      };
    }
    steps.push({
      id: "nullifier-check",
      stage: "Secret-Keyed Nullifier Anti-Replay Guard",
      circuitConstraint: "assert(!usedInvoiceNullifiers.member(disclose(deriveNullifier(H(opSk), vendorId, lineItemsHash))))",
      status: "passed",
      detail: `Fresh secret-keyed nullifier ${nullifier.slice(0, 14)}... accepted (dictionary-resistant)`,
      durationMs: 13
    });

    // 7. Registered auditor key verification (AuditorScoped tier)
    const auditorVkHash = input.auditorViewingKeyOverride
      ? deriveAuditorViewingKeyHashHex(input.auditorViewingKeyOverride)
      : this.privateVault.auditorViewingKeyHashHex;
    const derivedAuditorCommitment = deriveAuditorCommitmentHex(auditorVkHash);

    if (
      input.disclosureTier === DisclosureTier.AuditorScoped &&
      derivedAuditorCommitment !== this.authorizedAuditorCommitment
    ) {
      steps.push({
        id: "auditor-auth",
        stage: "Registered Auditor Authorization",
        circuitConstraint: "publicTier != AuditorScoped || deriveAuditorCommitment(vkHash) == authorizedAuditorCommitment",
        status: "failed",
        detail: "Supplied auditor viewing key does not match the vault's on-chain authorizedAuditorCommitment",
        durationMs: 10
      });
      return {
        ok: false,
        error: "Auditor viewing key is not authorized for this vault",
        errorCode: "ERR_UNAUTHORIZED_AUDITOR_KEY",
        steps,
        proofTimeMs: Math.max(43, Date.now() - startMs)
      };
    }

    // Secret-keyed invoice salt so simulator openings cannot be reconstructed from public receipt fields
    const invSalt = deriveDeterministicSaltHex(`inv:${opSk}:${this.nonceCounter}:${nullifier}`);
    const invoiceCommitment = deriveInvoiceCommitmentHex(
      vendorIdHex,
      lineItemsHashHex,
      amount,
      witnessJurisdictionDigest,
      invSalt
    );
    const auditorTag =
      input.disclosureTier === DisclosureTier.AuditorScoped
        ? deriveAuditorTagHex(auditorVkHash, invoiceCommitment)
        : ZERO_BYTES_32;

    const receiptId = deriveReceiptIdHex(invoiceCommitment, nullifier);
    const nextBalance = balance - amount;
    const nextSalt =
      input.nextBlindingFactorOverrideHex ??
      deriveDeterministicSaltHex(
        `treasury:${opSk}:${this.nonceCounter}:${this.privateVault.treasuryBlindingFactorHex}:${receiptId}`
      );

    if (nextSalt === this.privateVault.treasuryBlindingFactorHex) {
      steps.push({
        id: "salt-freshness",
        stage: "Blinding Factor Freshness",
        circuitConstraint: "assert(nextTreasuryBlindingFactor() != treasuryBlindingFactor())",
        status: "failed",
        detail: "Blinding salt reuse rejected to prevent cross-epoch balance opening linkability",
        durationMs: 7
      });
      return {
        ok: false,
        error: "Next treasury blinding factor must be fresh",
        errorCode: "ERR_REUSED_BLINDING_SALT",
        steps,
        proofTimeMs: Math.max(45, Date.now() - startMs)
      };
    }

    const nextCommitment = persistentCommitUint64(nextBalance, nextSalt);
    this.nonceCounter += 1;

    // Commit private + public state atomically
    this.privateVault = {
      ...this.privateVault,
      treasuryBalanceCents: nextBalance,
      treasuryBlindingFactorHex: nextSalt
    };
    this.treasuryBalanceCommitment = nextCommitment;
    this.usedNullifiers.add(nullifier);
    this.settledCount += 1;

    const receipt: AuditReceiptRecord = {
      receiptId,
      invoiceCommitment,
      nullifier,
      budgetTierCapCents: cap,
      jurisdictionRoot: computedRoot,
      auditorTag,
      disclosureTier: input.disclosureTier,
      settledEpoch: this.currentEpoch,
      timestampIso: new Date().toISOString(),
      txFingerprint: sha256SimulatorHashHex(
        pad32("proofvault:tx:v1"),
        hexToBytes(receiptId),
        hexToBytes(nextCommitment)
      ),
      localMemo: `${input.vendorLabel} · ${input.invoiceReference}`
    };
    this.receipts.set(receiptId, receipt);

    steps.push({
      id: "state-transition",
      stage: "Re-Blinded State Transition & Selective Receipt",
      circuitConstraint: "nextSalt != currentSalt && treasuryBalanceCommitment = disclose(commit(bal - amt, nextSalt))",
      status: "passed",
      detail: `Receipt ${receiptId.slice(0, 14)}... committed; balance re-blinded to ${nextCommitment.slice(0, 14)}...`,
      durationMs: 28
    });

    const payloadPreview: OnChainPayloadPreview = {
      circuitName: "settleConfidentialInvoice",
      publicInputs: {
        budgetTierCap: `$${(cap / 100).toLocaleString()} (${cap} cents)`,
        disclosureTier: DisclosureTier[input.disclosureTier]
      },
      disclosedOutputs: {
        receiptId,
        invoiceCommitment,
        nullifier,
        jurisdictionRoot: computedRoot,
        auditorTag,
        nextTreasuryBalanceCommitment: nextCommitment
      },
      shieldedWitnessFieldsRedacted: [
        `vendorLabel ("${input.vendorLabel}") — REDACTED`,
        `vendorId ("${input.vendorIdRaw}") — REDACTED`,
        `lineItems ("${input.invoiceReference}") — REDACTED`,
        `exactInvoiceAmount ($${(amount / 100).toLocaleString()}) — REDACTED`,
        `exactTreasuryBalance ($${(nextBalance / 100).toLocaleString()}) — REDACTED`,
        `counterpartyJurisdiction ("${input.jurisdictionCode.toUpperCase()}") — REDACTED (bound in commitment)`,
        `nullifierBlindingSalt & operatorSecretKey — REDACTED`
      ]
    };

    const totalStepMs = steps.reduce((acc, s) => acc + s.durationMs, 0);
    return {
      ok: true,
      receipt,
      steps,
      payloadPreview,
      proofTimeMs: Math.max(totalStepMs, Date.now() - startMs)
    };
  }

  public updateGovernancePolicy(
    newMaxSettlementCents: number,
    newMinReserveFloorCents: number,
    newStatus: VaultStatus,
    operatorSecretKeyOverride?: string
  ): { ok: boolean; error?: string } {
    const opSk = operatorSecretKeyOverride ?? this.privateVault.operatorSecretKeyHex;
    if (deriveOperatorPublicKeyHex(opSk) !== this.treasuryAuthority) {
      return { ok: false, error: "Unauthorized treasury operator" };
    }
    if (newMaxSettlementCents <= 0) {
      return { ok: false, error: "Max single settlement must be positive" };
    }
    this.policyMaxSingleSettlementCents = Math.round(newMaxSettlementCents);
    this.policyMinReserveFloorCents = Math.round(newMinReserveFloorCents);
    this.vaultStatus = newStatus;
    this.currentEpoch += 1;
    return { ok: true };
  }

  public verifyReceiptOnChain(receiptId: string): boolean {
    return this.receipts.has(receiptId);
  }

  public buildExportedAuditPackage(receiptId: string): ExportedAuditPackage | null {
    const receipt = this.receipts.get(receiptId);
    if (!receipt) return null;
    // Strip localMemo from exported package so exported JSON never leaks private vendor labels
    const cleanReceipt: AuditReceiptRecord = {
      receiptId: receipt.receiptId,
      invoiceCommitment: receipt.invoiceCommitment,
      nullifier: receipt.nullifier,
      budgetTierCapCents: receipt.budgetTierCapCents,
      jurisdictionRoot: receipt.jurisdictionRoot,
      auditorTag: receipt.auditorTag,
      disclosureTier: receipt.disclosureTier,
      settledEpoch: receipt.settledEpoch,
      timestampIso: receipt.timestampIso,
      txFingerprint: receipt.txFingerprint
    };
    return {
      schema: "proofvault.selective-disclosure.v1",
      network: "sha256-browser-simulator",
      contractAddress: this.contractAddress,
      receipt: cleanReceipt,
      selectiveClaims: {
        solvencyMaintainedAboveFloorCents: this.policyMinReserveFloorCents,
        amountWithinBudgetTierCapCents: receipt.budgetTierCapCents,
        nonSanctionedJurisdictionVerified: true,
        nullifierRecordedOnChain: true,
        privateFieldsWithheld: [
          "counterpartyIdentity",
          "invoiceLineItems",
          "exactInvoiceAmount",
          "exactTreasuryBalance",
          "specificCountryCode",
          "nullifierBlindingSalt"
        ]
      }
    };
  }
}

export function verifyAuditPackageAgainstLedger(
  rawJson: string,
  ledger: PublicLedgerSnapshot,
  optionalAuditorViewingKeyHex?: string
): ReceiptVerificationResult {
  const checks: ReceiptVerificationCheck[] = [];
  let parsed: ExportedAuditPackage | null = null;
  try {
    parsed = JSON.parse(rawJson) as ExportedAuditPackage;
  } catch {
    return {
      valid: false,
      auditorScopeMatched: null,
      checks: [
        {
          name: "JSON Schema Integrity",
          passed: false,
          detail: "Input is not valid JSON."
        }
      ]
    };
  }

  const receipt = parsed?.receipt;
  if (!parsed || parsed.schema !== "proofvault.selective-disclosure.v1" || !receipt?.receiptId) {
    return {
      valid: false,
      auditorScopeMatched: null,
      checks: [
        {
          name: "Selective-Disclosure Package Schema",
          passed: false,
          detail: "Missing or unsupported ProofVault receipt schema."
        }
      ]
    };
  }

  checks.push({
    name: "Selective-Disclosure Package Schema",
    passed: true,
    detail: `Schema ${parsed.schema} targeting contract ${parsed.contractAddress.slice(0, 16)}...`
  });

  const recomputedId = deriveReceiptIdHex(receipt.invoiceCommitment, receipt.nullifier);
  const idMatches = recomputedId === receipt.receiptId;
  checks.push({
    name: "Deterministic Receipt Digest Binding",
    passed: idMatches,
    detail: idMatches
      ? `H(invoiceCommitment, nullifier) matches ${receipt.receiptId.slice(0, 16)}...`
      : "Tampered receipt: receiptId does not match commitment + nullifier digest."
  });

  const onChainReceipt = ledger.auditReceipts.find((r) => r.receiptId === receipt.receiptId);
  const existsOnChain = Boolean(onChainReceipt);
  checks.push({
    name: "Ledger AuditReceipt Map Existence",
    passed: existsOnChain,
    detail: existsOnChain
      ? `Verified in auditReceipts Map at Epoch #${onChainReceipt!.settledEpoch}`
      : "Receipt ID not found in public ledger auditReceipts Map."
  });

  const fieldsMatchOnChain =
    Boolean(onChainReceipt) &&
    onChainReceipt!.invoiceCommitment === receipt.invoiceCommitment &&
    onChainReceipt!.nullifier === receipt.nullifier &&
    onChainReceipt!.budgetTierCapCents === receipt.budgetTierCapCents &&
    onChainReceipt!.jurisdictionRoot === receipt.jurisdictionRoot &&
    onChainReceipt!.auditorTag === receipt.auditorTag &&
    onChainReceipt!.disclosureTier === receipt.disclosureTier &&
    onChainReceipt!.settledEpoch === receipt.settledEpoch;

  checks.push({
    name: "Receipt Field & Budget Tier Immutability",
    passed: fieldsMatchOnChain,
    detail: fieldsMatchOnChain
      ? `Strict cap < $${(receipt.budgetTierCapCents / 100).toLocaleString()} and disclosure tier ${DisclosureTier[receipt.disclosureTier]} match ledger state`
      : "Receipt fields diverge from immutable AuditReceipt record."
  });

  const nullifierRecorded = ledger.usedInvoiceNullifiers.includes(receipt.nullifier);
  checks.push({
    name: "Secret-Keyed Nullifier Set Membership",
    passed: nullifierRecorded,
    detail: nullifierRecorded
      ? `Nullifier ${receipt.nullifier.slice(0, 16)}... confirmed in usedInvoiceNullifiers Set`
      : "Nullifier missing from usedInvoiceNullifiers Set."
  });

  const rootValid = ledger.approvedJurisdictionsHistory.includes(receipt.jurisdictionRoot);
  checks.push({
    name: "HistoricMerkleTree Jurisdiction Root Validity",
    passed: rootValid,
    detail: rootValid
      ? `Root ${receipt.jurisdictionRoot.slice(0, 16)}... confirmed in HistoricMerkleTree history`
      : "Jurisdiction Merkle root is unknown to this vault."
  });

  let auditorScopeMatched: boolean | null = null;
  if (receipt.disclosureTier === DisclosureTier.AuditorScoped) {
    if (optionalAuditorViewingKeyHex && /^[0-9a-fA-F]{64}$/.test(optionalAuditorViewingKeyHex.trim())) {
      const vkHash = deriveAuditorViewingKeyHashHex(optionalAuditorViewingKeyHex.trim().toLowerCase());
      const regMatches = deriveAuditorCommitmentHex(vkHash) === ledger.authorizedAuditorCommitment;
      const expectedTag = deriveAuditorTagHex(vkHash, receipt.invoiceCommitment);
      auditorScopeMatched = regMatches && expectedTag === receipt.auditorTag;
      checks.push({
        name: "Registered Auditor Key & Scope Binding",
        passed: auditorScopeMatched,
        detail: auditorScopeMatched
          ? `Key matches authorizedAuditorCommitment and scoped auditorTag ${receipt.auditorTag.slice(0, 16)}...`
          : "Supplied auditor viewing key does not match the vault's authorized auditor commitment or receipt auditorTag."
      });
    } else {
      checks.push({
        name: "Registered Auditor Key & Scope Binding",
        passed: true,
        detail: "AuditorScoped tag present on ledger (provide 64-hex authorized auditor key to verify scoped ownership)."
      });
    }
  } else {
    const tagZeroed = receipt.auditorTag === ZERO_BYTES_32;
    checks.push({
      name: "Minimal / Threshold Zero-Tag Privacy Check",
      passed: tagZeroed,
      detail: tagZeroed
        ? "auditorTag is zeroed (0x00..00) — no auditor linkage exposed"
        : "Unexpected non-zero auditorTag for non-AuditorScoped tier."
    });
  }

  const allPassed = checks.every((c) => c.passed);
  return {
    valid: allPassed,
    auditorScopeMatched,
    checks,
    receipt
  };
}
