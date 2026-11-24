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
  authorizedAuditorCommitment: string;
  treasuryBalanceCommitment: string;
  policyMaxSingleSettlementCents: number;
  policyMinReserveFloorCents: number;
  currentEpoch: number;
  vaultStatus: VaultStatus;
  lastSolvencyAttestation: string;
  lastSolvencyFloorCents: number;
  lastSolvencyEpoch: number;
  approvedJurisdictionsRoot: string;
  approvedJurisdictionsHistory: string[];
  approvedJurisdictions: JurisdictionEntry[];
  usedInvoiceNullifiers: string[];
  auditReceipts: AuditReceiptRecord[];
  settledInvoiceCount: number;
}

export interface PrivateWitnessVault {
  operatorSecretKeyHex: string;
  nullifierBlindingSaltHex: string;
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
  /** Optional adversarial override to test mismatched jurisdictionLeaf vs MerkleTreePath */
  jurisdictionLeafOverrideCode?: string;
  /** Optional adversarial override to test reused nextTreasuryBlindingFactor */
  nextBlindingFactorOverrideHex?: string;
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

export interface WalletDispatchResult {
  ok: boolean;
  dispatchPath: "balance-and-submit" | "wallet-sign-attestation" | "unavailable";
  walletName: string;
  networkId: MidnightNetworkId;
  proverPath: string;
  submittedOnChain: boolean;
  balancedTxHex?: string;
  signatureHex?: string;
  verifyingKeyHex?: string;
  signatureScheme?: string;
  detail: string;
  timestampIso: string;
  error?: string;
}

export interface InvoiceSettlementResult {
  ok: boolean;
  error?: string;
  errorCode?: string;
  receipt?: AuditReceiptRecord;
  steps: ZkPipelineStep[];
  payloadPreview?: OnChainPayloadPreview;
  proofTimeMs: number;
  walletDispatch?: WalletDispatchResult;
}

export interface SolvencyAttestation {
  ok: boolean;
  error?: string;
  errorCode?: string;
  attestationDigest?: string;
  claimedMinFloorCents: number;
  treasuryBalanceCommitment: string;
  epoch: number;
  timestampIso: string;
  steps: ZkPipelineStep[];
}

export interface ExportedAuditPackage {
  schema: "proofvault.selective-disclosure.v1";
  network: MidnightNetworkId | "sha256-browser-simulator";
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
  rdns: string;
  apiVersion: string;
  brand: "lace" | "1am" | "other";
}

export interface WalletConnectionState {
  mode: ExecutionMode;
  networkId: MidnightNetworkId;
  walletConnected: boolean;
  walletName: string | null;
  walletKey: string | null;
  walletRdns: string | null;
  shieldedAddress: string | null;
  unshieldedAddress: string | null;
  dustAddress: string | null;
  dustBalance: string | null;
  dustCap: string | null;
  provingMode: "wallet-proving-provider" | "http-prover" | "local-engine";
  serviceUris: {
    indexerUri?: string;
    indexerWsUri?: string;
    proverServerUri?: string;
    substrateNodeUri?: string;
  } | null;
  lastDispatch: WalletDispatchResult | null;
  error: string | null;
}

export interface LiveIndexerSnapshot {
  ok: boolean;
  network: "preview" | "preprod" | "custom";
  endpoint: string;
  explorerBaseUrl: string | null;
  fetchedAtIso: string;
  latencyMs: number;
  blockHeight: number | null;
  blockHash: string | null;
  blockTimestampIso: string | null;
  protocolVersion: number | null;
  zswapMerkleTreeRoot: string | null;
  dustCommitmentMerkleTreeRoot: string | null;
  queriedContractAddress: string | null;
  contractFound: boolean;
  contractActionType: string | null;
  contractEntryPoint: string | null;
  contractStateBytes: number | null;
  contractStatePreviewHex: string | null;
  contractBlockHeight: number | null;
  contractTxHash: string | null;
  migrationNotice: string | null;
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

export type AdversarialAttackId =
  | "replay-used-nullifier"
  | "forge-unapproved-jurisdiction"
  | "exceed-policy-cap"
  | "break-solvency-threshold"
  | "forge-unregistered-auditor"
  | "break-tier-cap-isolation";

export interface AdversarialAttackScenario {
  id: AdversarialAttackId;
  code: string;
  title: string;
  primary: boolean;
  summary: string;
  targetCircuit: "settleConfidentialInvoice" | "proveTreasurySolvency";
  expectedErrorCode: string;
  compactGuardId: string;
  compactAssertion: string;
  mutationProof: string;
}

export interface AdversarialSubCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface AdversarialAttackReport {
  attackId: AdversarialAttackId;
  code: string;
  title: string;
  rejected: boolean;
  errorCode: string;
  guardMessage: string;
  compactGuardId: string;
  compactAssertion: string;
  mutationProof: string;
  stateUnchanged: boolean;
  beforeCommitment: string;
  afterCommitment: string;
  beforeSettledCount: number;
  afterSettledCount: number;
  durationMs: number;
  executedAtIso: string;
  steps: ZkPipelineStep[];
  subChecks: AdversarialSubCheck[];
}
