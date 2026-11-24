import compactSourceRaw from "../../contracts/proofvault.compact?raw";

export interface CompiledCircuitStat {
  name: string;
  kind: "impure-zk" | "pure";
  zkirBytes: number;
  bzkirBytes: number;
  verifierKeyBytes: number;
  proverKeyMb: string;
  purpose: string;
}

export const COMPACT_CONTRACT_SOURCE = compactSourceRaw;

export const COMPACT_COMPILER_METADATA = {
  contractFile: "contracts/proofvault.compact",
  contractVersion: "v2.1 (Hardened Circuit)",
  compilerVersion: "0.36.1",
  compilerCommit: "7fa3a117c5e7efe9d2c51da04263e5f0b3509144",
  languageVersion: "0.28.0",
  runtimePackage: "@midnight-ntwrk/compact-runtime@0.21.0",
  connectorPackage: "@midnight-ntwrk/dapp-connector-api@4.1.0",
  ledgerTarget: "Ledger 9 (zkir-3.2.1)",
  sourceSha256: "fc0ac33e60d3c69769b9d501a5a5eee178fcd49ed44360675b87a852625f4a2a",
  contractJsSha256: "b32e86c309610e9fd16804a2fdd1465b22218b24790acf17ab0baea83f3e46fc",
  auditedAssertGuards: 24,
  license: "Apache-2.0"
} as const;

export const COMPILED_CIRCUIT_STATS: CompiledCircuitStat[] = [
  {
    name: "settleConfidentialInvoice",
    kind: "impure-zk",
    zkirBytes: 24040,
    bzkirBytes: 7445,
    verifierKeyBytes: 2121,
    proverKeyMb: "86.0 MB",
    purpose:
      "Atomic settlement circuit: verifies operator key, opens balance commitment, enforces strict amount < cap <= ceiling and reserve floor, enforces distinct MinimalSolvency/ThresholdBand/AuditorScoped rules, binds jurisdictionLeaf into invoiceCommitment, derives secret-keyed nullifier, checks blinding salt freshness, and writes AuditReceipt."
  },
  {
    name: "proveTreasurySolvency",
    kind: "impure-zk",
    zkirBytes: 6400,
    bzkirBytes: 1755,
    verifierKeyBytes: 2121,
    proverKeyMb: "21.5 MB",
    purpose:
      "Operator-authenticated solvency proof that opens treasuryBalanceCommitment, enforces balance >= max(reserveFloor, claimedMinFloor), and persists lastSolvencyAttestation, lastSolvencyFloor, and lastSolvencyEpoch on-chain."
  },
  {
    name: "registerApprovedJurisdiction",
    kind: "impure-zk",
    zkirBytes: 3433,
    bzkirBytes: 964,
    verifierKeyBytes: 2121,
    proverKeyMb: "10.8 MB",
    purpose:
      "Operator-authenticated insertion of an approved ISO-3166 jurisdiction digest into HistoricMerkleTree<8, Bytes<32>>."
  },
  {
    name: "updateGovernancePolicy",
    kind: "impure-zk",
    zkirBytes: 3606,
    bzkirBytes: 1053,
    verifierKeyBytes: 2121,
    proverKeyMb: "10.8 MB",
    purpose:
      "Operator-authenticated update for max settlement ceiling, minimum reserve floor, active/paused circuit breaker, and epoch counter."
  },
  {
    name: "verifyReceiptOnChain",
    kind: "impure-zk",
    zkirBytes: 969,
    bzkirBytes: 266,
    verifierKeyBytes: 1353,
    proverKeyMb: "0.2 MB",
    purpose:
      "Public map membership helper returning whether a receiptId exists in auditReceipts."
  }
];
