import { describe, expect, it } from "vitest";
import {
  DEFAULT_AUDITOR_VIEWING_KEY,
  SETTLEMENT_PRESETS,
  createSeededProofVaultEngine
} from "../src/midnight/presets";
import {
  deriveDeterministicSaltHex,
  verifyAuditPackageAgainstLedger
} from "../src/midnight/proofEngine";
import { DisclosureTier, VaultStatus } from "../src/midnight/types";
import { discoverMidnightWallets } from "../src/midnight/walletAdapter";

describe("ProofVault Browser Circuit-Equivalence Engine & Selective-Disclosure Verifier", () => {
  it("boots with seeded ledger commitments, 8 compliant jurisdictions, and 2 initial receipts", () => {
    const engine = createSeededProofVaultEngine();
    const ledger = engine.getPublicLedger();
    const priv = engine.getPrivateWitnessVault();

    expect(ledger.approvedJurisdictions.length).toBe(8);
    expect(ledger.settledInvoiceCount).toBe(2);
    expect(ledger.auditReceipts.length).toBe(2);
    expect(ledger.usedInvoiceNullifiers.length).toBe(2);
    // $2,450,000 - $38,500 - $19,200 = $2,392,300 (239,230,000 cents)
    expect(priv.treasuryBalanceCents).toBe(239_230_000);
  });

  it("executes all valid presets cleanly and rejects all 3 attack/guard presets", () => {
    const engine = createSeededProofVaultEngine();

    for (const preset of SETTLEMENT_PRESETS) {
      const res = engine.settleConfidentialInvoice(preset.input);
      if (preset.category === "valid") {
        expect(res.ok, `Expected preset ${preset.id} to pass`).toBe(true);
        expect(res.receipt).toBeDefined();
        expect(res.payloadPreview).toBeDefined();
        expect(engine.verifyReceiptOnChain(res.receipt!.receiptId)).toBe(true);
      } else {
        expect(res.ok, `Expected guard preset ${preset.id} to fail`).toBe(false);
        expect(res.error).toBeTruthy();
        expect(res.steps.some((s) => s.status === "failed")).toBe(true);
      }
    }

    expect(engine.getPublicLedger().settledInvoiceCount).toBe(5);
  });

  it("verifies exported selective-disclosure receipts and detects tampering or wrong auditor keys", () => {
    const engine = createSeededProofVaultEngine();
    const ledger = engine.getPublicLedger();
    const auditorReceipt = ledger.auditReceipts.find(
      (r) => r.disclosureTier === DisclosureTier.AuditorScoped
    )!;
    expect(auditorReceipt).toBeDefined();

    const pkg = engine.buildExportedAuditPackage(auditorReceipt.receiptId)!;
    const rawJson = JSON.stringify(pkg);

    // Exported package must strip local memos and never contain vendor names
    expect(rawJson).not.toContain("Helvetia");
    expect(rawJson).not.toContain("3850000");

    // 1. Valid verification with matching auditor viewing key
    const validResult = verifyAuditPackageAgainstLedger(
      rawJson,
      ledger,
      DEFAULT_AUDITOR_VIEWING_KEY
    );
    expect(validResult.valid).toBe(true);
    expect(validResult.auditorScopeMatched).toBe(true);

    // 2. Wrong auditor viewing key fails scoped binding check
    const wrongAuditorKey = deriveDeterministicSaltHex("wrong-auditor-key");
    const wrongKeyResult = verifyAuditPackageAgainstLedger(rawJson, ledger, wrongAuditorKey);
    expect(wrongKeyResult.valid).toBe(false);
    expect(wrongKeyResult.auditorScopeMatched).toBe(false);

    // 3. Tampering with budgetTierCap fails on-chain immutability verification
    const tampered = structuredClone(pkg);
    tampered.receipt.budgetTierCapCents = 999_999_99;
    const tamperedResult = verifyAuditPackageAgainstLedger(
      JSON.stringify(tampered),
      ledger,
      DEFAULT_AUDITOR_VIEWING_KEY
    );
    expect(tamperedResult.valid).toBe(false);
  });

  it("proves treasury solvency thresholds and respects governance policy pauses", () => {
    const engine = createSeededProofVaultEngine();

    const okProof = engine.proveTreasurySolvency(200_000_000);
    expect(okProof.ok).toBe(true);
    expect(okProof.attestationDigest).toMatch(/^[0-9a-f]{64}$/);

    const failProof = engine.proveTreasurySolvency(500_000_000);
    expect(failProof.ok).toBe(false);

    // Pause vault and verify settlements are blocked
    const pause = engine.updateGovernancePolicy(15_000_000, 50_000_000, VaultStatus.Paused);
    expect(pause.ok).toBe(true);
    const blocked = engine.settleConfidentialInvoice(SETTLEMENT_PRESETS[0].input);
    expect(blocked.ok).toBe(false);
    expect(blocked.error).toMatch(/paused/i);
  });

  it("registers new compliant jurisdictions dynamically and validates ISO format", () => {
    const engine = createSeededProofVaultEngine();
    const bad = engine.registerApprovedJurisdiction("1234", "Invalid");
    expect(bad.ok).toBe(false);

    const added = engine.registerApprovedJurisdiction("AU", "Australia");
    expect(added.ok).toBe(true);
    expect(engine.getPublicLedger().approvedJurisdictions.some((j) => j.code === "AU")).toBe(true);

    const settledAU = engine.settleConfidentialInvoice({
      ...SETTLEMENT_PRESETS[0].input,
      invoiceReference: "INV-2026-AU-01",
      jurisdictionCode: "AU"
    });
    expect(settledAU.ok).toBe(true);
  });

  it("returns an empty wallet list safely in non-browser Node environments", () => {
    expect(discoverMidnightWallets()).toEqual([]);
  });
});
