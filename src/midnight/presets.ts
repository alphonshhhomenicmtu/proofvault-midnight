import {
  ProofVaultEngine,
  deriveDeterministicSaltHex
} from "./proofEngine";
import {
  DisclosureTier,
  type VaultPresetScenario
} from "./types";

export const DEFAULT_JURISDICTIONS: Array<{ code: string; label: string }> = [
  { code: "US", label: "United States" },
  { code: "CH", label: "Switzerland" },
  { code: "SG", label: "Singapore" },
  { code: "GB", label: "United Kingdom" },
  { code: "DE", label: "Germany" },
  { code: "JP", label: "Japan" },
  { code: "CA", label: "Canada" },
  { code: "NL", label: "Netherlands" }
];

export const DEFAULT_OPERATOR_SECRET_KEY = deriveDeterministicSaltHex("proofvault:demo:operator:key:2026");
export const DEFAULT_INITIAL_BLINDING_SALT = deriveDeterministicSaltHex("proofvault:demo:treasury:salt:0");
export const DEFAULT_AUDITOR_VIEWING_KEY = deriveDeterministicSaltHex("proofvault:demo:auditor:deloitte-zk:2026");

export function createSeededProofVaultEngine(): ProofVaultEngine {
  const engine = new ProofVaultEngine({
    operatorSecretKeyHex: DEFAULT_OPERATOR_SECRET_KEY,
    initialTreasuryBalanceCents: 245_000_000, // $2,450,000.00
    initialBlindingFactorHex: DEFAULT_INITIAL_BLINDING_SALT,
    auditorViewingKeyHex: DEFAULT_AUDITOR_VIEWING_KEY,
    maxSingleSettlementCents: 15_000_000, // $150,000.00 max single invoice
    minReserveFloorCents: 50_000_000, // $500,000.00 min solvency reserve
    initialJurisdictions: DEFAULT_JURISDICTIONS
  });

  // Seed two initial confidential settlements so Ledger & Audit views are rich immediately
  engine.settleConfidentialInvoice({
    vendorLabel: "Helvetia Formal Verification GmbH",
    vendorIdRaw: "vendor:ch:helvetia-fv-01",
    lineItemsSummary: "Compact ZK circuit soundness review + ZKIR constraint audit (120 hrs)",
    invoiceReference: "INV-2026-041",
    amountCents: 38_500_00, // $38,500.00
    budgetTierCapCents: 50_000_00, // $50,000.00 tier
    jurisdictionCode: "CH",
    disclosureTier: DisclosureTier.AuditorScoped
  });

  engine.settleConfidentialInvoice({
    vendorLabel: "Meridian RPC Infrastructure Pte Ltd",
    vendorIdRaw: "vendor:sg:meridian-rpc-09",
    lineItemsSummary: "Midnight Preprod Indexer + Prover GPU cluster hosting Q4",
    invoiceReference: "INV-2026-042",
    amountCents: 19_200_00, // $19,200.00
    budgetTierCapCents: 25_000_00, // $25,000.00 tier
    jurisdictionCode: "SG",
    disclosureTier: DisclosureTier.ThresholdBand
  });

  return engine;
}

export const SETTLEMENT_PRESETS: VaultPresetScenario[] = [
  {
    id: "audit-bounty-ch",
    label: "ZK Security Audit Bounty (CH)",
    category: "valid",
    badge: "PASS · AUDITOR SCOPED",
    description: "Pays $42,500 confidentially under a $50,000 DAO tier cap to a Zurich auditor with an auditor-scoped receipt.",
    input: {
      vendorLabel: "Halcyon Security AG",
      vendorIdRaw: "vendor:ch:halcyon-sec-88",
      lineItemsSummary: "Critical ZK witness isolation audit & formal proof verification",
      invoiceReference: "INV-2026-051",
      amountCents: 42_500_00,
      budgetTierCapCents: 50_000_00,
      jurisdictionCode: "CH",
      disclosureTier: DisclosureTier.AuditorScoped
    }
  },
  {
    id: "core-eng-sg",
    label: "Protocol Engineering Milestone (SG)",
    category: "valid",
    badge: "PASS · THRESHOLD BAND",
    description: "Settles $88,000 milestone under $100,000 cap in Singapore without binding an auditor key.",
    input: {
      vendorLabel: "Kestrel Systems Pte Ltd",
      vendorIdRaw: "vendor:sg:kestrel-eng-14",
      lineItemsSummary: "Midnight.js SDK integration & browser prover pipeline Milestone 3",
      invoiceReference: "INV-2026-052",
      amountCents: 88_000_00,
      budgetTierCapCents: 100_000_00,
      jurisdictionCode: "SG",
      disclosureTier: DisclosureTier.ThresholdBand
    }
  },
  {
    id: "legal-retainer-us",
    label: "Regulatory Counsel Retainer (US)",
    category: "valid",
    badge: "PASS · MINIMAL SOLVENCY",
    description: "Minimal disclosure proof ($24,000 under $30,000 cap) proving non-sanctioned eligibility and solvency only.",
    input: {
      vendorLabel: "Alder & Vance LLP",
      vendorIdRaw: "vendor:us:alder-vance-03",
      lineItemsSummary: "Q4 MiCA & US Treasury compliance advisory",
      invoiceReference: "INV-2026-053",
      amountCents: 24_000_00,
      budgetTierCapCents: 30_000_00,
      jurisdictionCode: "US",
      disclosureTier: DisclosureTier.MinimalSolvency
    }
  },
  {
    id: "sanctioned-kp",
    label: "Sanctioned Jurisdiction Test (KP)",
    category: "guard-test",
    badge: "BLOCKED · MERKLE GUARD",
    description: "Attempts settlement to an unlisted / sanctioned jurisdiction (KP). Rejected by HistoricMerkleTree.checkRoot().",
    input: {
      vendorLabel: "Unverified Offshore Entity",
      vendorIdRaw: "vendor:kp:blocked-entity-77",
      lineItemsSummary: "Unscreened external contractor invoice",
      invoiceReference: "INV-2026-901",
      amountCents: 15_000_00,
      budgetTierCapCents: 25_000_00,
      jurisdictionCode: "KP",
      disclosureTier: DisclosureTier.AuditorScoped
    }
  },
  {
    id: "over-cap-breach",
    label: "Budget Ceiling Breach Test",
    category: "guard-test",
    badge: "BLOCKED · SOLVENCY GUARD",
    description: "Attempts a $175,000 settlement exceeding the $150,000 public DAO governance ceiling.",
    input: {
      vendorLabel: "Apex Market Makers Ltd",
      vendorIdRaw: "vendor:gb:apex-mm-22",
      lineItemsSummary: "Unauthorized liquidity retainer exceeding governance cap",
      invoiceReference: "INV-2026-902",
      amountCents: 175_000_00,
      budgetTierCapCents: 180_000_00,
      jurisdictionCode: "GB",
      disclosureTier: DisclosureTier.ThresholdBand
    }
  },
  {
    id: "replay-attack",
    label: "Double-Settlement Replay Test",
    category: "guard-test",
    badge: "BLOCKED · NULLIFIER GUARD",
    description: "Replays already-settled invoice INV-2026-041. Blocked deterministically by usedInvoiceNullifiers.member().",
    input: {
      vendorLabel: "Helvetia Formal Verification GmbH",
      vendorIdRaw: "vendor:ch:helvetia-fv-01",
      lineItemsSummary: "Compact ZK circuit soundness review + ZKIR constraint audit (120 hrs)",
      invoiceReference: "INV-2026-041",
      amountCents: 38_500_00,
      budgetTierCapCents: 50_000_00,
      jurisdictionCode: "CH",
      disclosureTier: DisclosureTier.AuditorScoped
    }
  }
];

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cents / 100);
}

export function truncateHex(hex: string, head = 10, tail = 8): string {
  if (hex.length <= head + tail + 3) return hex;
  return `${hex.slice(0, head)}...${hex.slice(-tail)}`;
}
