export enum DisclosureTier {
  MinimalSolvency = 0,
  ThresholdBand = 1,
  AuditorScoped = 2
}

export enum VaultStatus {
  Active = 0,
  Paused = 1
}

export type MidnightNetworkId = "preprod" | "preview" | "mainnet" | "undeployed";

export type ExecutionMode = "local-simulator" | "lace-wallet";

export interface JurisdictionEntry {
  code: string;
  label: string;
  digestHex: string;
  leafIndex: number;
}

export interface AuditReceiptRecord {
  receiptId: string;
  invoiceCommitment: string;
  nullifier: string;
  budgetTierCapCents: number;
  jurisdictionRoot: string;
  auditorTag: string;
  disclosureTier: DisclosureTier;
  settledEpoch: number;
  timestampIso: string;
  txFingerprint: string;
  // Local-only reference note (never placed on-chain)
  localMemo?: string;
}

export interface PublicLedgerSnapshot {
  contractAddress: string;
  compactLanguageVersion: string;
  compilerVersion: string;
  zkirVersion: string;
  treasuryAuthority: string;
  treasuryBalanceCommitment: string;
  policyMaxSingleSettlementCents: number;
  policyMinReserveFloorCents: number;
  currentEpoch: number;
  vaultStatus: VaultStatus;
  approvedJurisdictionsRoot: string;
  approvedJurisdictionsHistory: string[];
  approvedJurisdictions: JurisdictionEntry[];
  usedInvoiceNullifiers: string[];
  auditReceipts: AuditReceiptRecord[];
  settledInvoiceCount: number;
}

export interface PrivateWitnessVault {
  operatorSecretKeyHex: string;
  treasuryBalanceCents: number;
  treasuryBlindingFactorHex: string;
  auditorViewingKeyHex: string;
  auditorViewingKeyHashHex: string;
}

export interface ZkPipelineStep {
  id: string;
  stage: string;
  circuitConstraint: string;
  status: "passed" | "failed" | "skipped";
  detail: string;
  durationMs: number;
}

export interface InvoiceSettlementInput {
  vendorLabel: string;
  vendorIdRaw: string;
  lineItemsSummary: string;
  invoiceReference: string;
  amountCents: number;
  budgetTierCapCents: number;
  jurisdictionCode: string;
  disclosureTier: DisclosureTier;
  auditorViewingKeyOverride?: string;
  operatorSecretKeyOverride?: string;
}

export interface OnChainPayloadPreview {
  circuitName: "settleConfidentialInvoice";
  publicInputs: {
    budgetTierCap: string;
    disclosureTier: string;
  };
  disclosedOutputs: {
    receiptId: string;
    invoiceCommitment: string;
    nullifier: string;
    jurisdictionRoot: string;
    auditorTag: string;
    nextTreasuryBalanceCommitment: string;
  };
  shieldedWitnessFieldsRedacted: string[];
}

export interface InvoiceSettlementResult {
  ok: boolean;
  error?: string;
  receipt?: AuditReceiptRecord;
  steps: ZkPipelineStep[];
  payloadPreview?: OnChainPayloadPreview;
  proofTimeMs: number;
}

export interface SolvencyAttestation {
  ok: boolean;
  error?: string;
  attestationDigest?: string;
  claimedMinFloorCents: number;
  treasuryBalanceCommitment: string;
  epoch: number;
  timestampIso: string;
  steps: ZkPipelineStep[];
}

export interface ExportedAuditPackage {
  schema: "proofvault.selective-disclosure.v1";
  network: MidnightNetworkId | "local-zk-engine";
  contractAddress: string;
  receipt: AuditReceiptRecord;
  selectiveClaims: {
    solvencyMaintainedAboveFloorCents: number;
    amountWithinBudgetTierCapCents: number;
    nonSanctionedJurisdictionVerified: true;
    nullifierRecordedOnChain: true;
    privateFieldsWithheld: string[];
  };
}

export interface ReceiptVerificationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface ReceiptVerificationResult {
  valid: boolean;
  auditorScopeMatched: boolean | null;
  checks: ReceiptVerificationCheck[];
  receipt?: AuditReceiptRecord;
}

export interface DiscoveredWallet {
  key: string;
  name: string;
  apiVersion: string;
}

export interface WalletConnectionState {
  mode: ExecutionMode;
  networkId: MidnightNetworkId;
  walletConnected: boolean;
  walletName: string | null;
  walletKey: string | null;
  shieldedAddress: string | null;
  unshieldedAddress: string | null;
  dustAddress: string | null;
  serviceUris: {
    indexerUri?: string;
    indexerWsUri?: string;
    proverServerUri?: string;
    substrateNodeUri?: string;
  } | null;
  error: string | null;
}

export interface VaultPresetScenario {
  id: string;
  label: string;
  category: "valid" | "guard-test";
  badge: string;
  description: string;
  input: InvoiceSettlementInput;
}
