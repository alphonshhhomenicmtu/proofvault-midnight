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
  compilerVersion: "0.36.1",
  compilerCommit: "7fa3a117c5e7efe9d2c51da04263e5f0b3509144",
  languageVersion: "0.28.0",
  runtimePackage: "@midnight-ntwrk/compact-runtime@0.21.0",
  connectorPackage: "@midnight-ntwrk/dapp-connector-api@4.1.0",
  ledgerTarget: "Ledger 9 (zkir-3.2.1)",
  license: "Apache-2.0"
} as const;

export const COMPILED_CIRCUIT_STATS: CompiledCircuitStat[] = [
  {
    name: "settleConfidentialInvoice",
    kind: "impure-zk",
    zkirBytes: 20385,
    bzkirBytes: 6159,
    verifierKeyBytes: 2121,
    proverKeyMb: "43.0 MB",
    purpose:
      "Atomic 7-guard ZK settlement: verifies operator key, opens balance commitment, enforces cap & reserve floor, proves HistoricMerkleTree jurisdiction membership, blocks nullifier replay, re-blinds treasury commitment, and writes a selective-disclosure AuditReceipt."
  },
  {
    name: "proveTreasurySolvency",
    kind: "impure-zk",
    zkirBytes: 3879,
    bzkirBytes: 998,
    verifierKeyBytes: 2121,
    proverKeyMb: "10.8 MB",
    purpose:
      "Proves shielded treasury balance exceeds both governance reserve floor and a caller-requested threshold without revealing the exact balance."
  },
  {
    name: "registerApprovedJurisdiction",
    kind: "impure-zk",
    zkirBytes: 3433,
    bzkirBytes: 964,
    verifierKeyBytes: 2121,
    proverKeyMb: "10.8 MB",
    purpose:
      "Operator-authenticated insertion of a compliant ISO-3166 jurisdiction digest into HistoricMerkleTree<8, Bytes<32>>."
  },
  {
    name: "updateGovernancePolicy",
    kind: "impure-zk",
    zkirBytes: 3606,
    bzkirBytes: 1053,
    verifierKeyBytes: 2121,
    proverKeyMb: "10.8 MB",
    purpose:
      "Operator-authenticated governance update for max settlement ceiling, minimum reserve floor, active/paused circuit breaker, and epoch increment."
  },
  {
    name: "verifyReceiptOnChain",
    kind: "impure-zk",
    zkirBytes: 969,
    bzkirBytes: 266,
    verifierKeyBytes: 1353,
    proverKeyMb: "0.2 MB",
    purpose:
      "Public verification circuit confirming whether an AuditReceipt ID exists in the on-chain auditReceipts Map."
  }
];
