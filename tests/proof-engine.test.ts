import { describe, expect, it } from "vitest";
import {
  DEFAULT_AUDITOR_VIEWING_KEY,
  SETTLEMENT_PRESETS,
  createSeededProofVaultEngine
} from "../src/midnight/presets";
import {
  deriveDeterministicSaltHex,
  deriveInvoiceCommitmentHex,
  deriveJurisdictionDigestHex,
  deriveLineItemsHashHex,
  deriveNullifierBlindingSaltHex,
  deriveNullifierHex,
  deriveUnkeyedDictionaryGuessHex,
  deriveVendorIdHex,
  verifyAuditPackageAgainstLedger
} from "../src/midnight/proofEngine";
import {
  ADVERSARIAL_ATTACKS,
  executeAdversarialAttack,
  executeAllAdversarialAttacks
} from "../src/midnight/adversarialLab";
import { DisclosureTier, VaultStatus } from "../src/midnight/types";
import { discoverMidnightWallets } from "../src/midnight/walletAdapter";

describe("ProofVault SHA-256 Deterministic Circuit Simulator & Adversarial Breaker Lab", () => {
  it("boots with seeded ledger commitments, registered auditor commitment, 8 jurisdictions, and 2 receipts", () => {
    const engine = createSeededProofVaultEngine();
    const ledger = engine.getPublicLedger();
    const priv = engine.getPrivateWitnessVault();

    expect(ledger.approvedJurisdictions.length).toBe(8);
    expect(ledger.settledInvoiceCount).toBe(2);
    expect(ledger.auditReceipts.length).toBe(2);
    expect(ledger.usedInvoiceNullifiers.length).toBe(2);
    expect(ledger.authorizedAuditorCommitment).toMatch(/^[0-9a-f]{64}$/);
    expect(priv.treasuryBalanceCents).toBe(239_230_000);
  });

  it("executes all 3 valid tier presets cleanly and rejects all 3 negative guard presets", () => {
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
        expect(res.errorCode).toBeTruthy();
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

    expect(pkg.network).toBe("sha256-browser-simulator");
    expect(rawJson).not.toContain("Helvetia");
    expect(rawJson).not.toContain("3850000");

    const validResult = verifyAuditPackageAgainstLedger(
      rawJson,
      ledger,
      DEFAULT_AUDITOR_VIEWING_KEY
    );
    expect(validResult.valid).toBe(true);
    expect(validResult.auditorScopeMatched).toBe(true);

    const wrongAuditorKey = deriveDeterministicSaltHex("wrong-auditor-key");
    const wrongKeyResult = verifyAuditPackageAgainstLedger(rawJson, ledger, wrongAuditorKey);
    expect(wrongKeyResult.valid).toBe(false);
    expect(wrongKeyResult.auditorScopeMatched).toBe(false);

    const tampered = structuredClone(pkg);
    tampered.receipt.budgetTierCapCents = 999_999_99;
    const tamperedResult = verifyAuditPackageAgainstLedger(
      JSON.stringify(tampered),
      ledger,
      DEFAULT_AUDITOR_VIEWING_KEY
    );
    expect(tamperedResult.valid).toBe(false);
  });

  it("authenticates proveTreasurySolvency, persists state, and respects governance pauses", () => {
    const engine = createSeededProofVaultEngine();

    // Unauthorized caller rejected
    const unauth = engine.proveTreasurySolvency(200_000_000, deriveDeterministicSaltHex("attacker"));
    expect(unauth.ok).toBe(false);
    expect(unauth.errorCode).toBe("ERR_UNAUTHORIZED_OPERATOR");

    const okProof = engine.proveTreasurySolvency(200_000_000);
    expect(okProof.ok).toBe(true);
    expect(okProof.attestationDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(engine.getPublicLedger().lastSolvencyAttestation).toBe(okProof.attestationDigest);
    expect(engine.getPublicLedger().lastSolvencyFloorCents).toBe(200_000_000);
    expect(engine.getPublicLedger().lastSolvencyEpoch).toBe(1);

    const failProof = engine.proveTreasurySolvency(500_000_000);
    expect(failProof.ok).toBe(false);
    expect(failProof.errorCode).toBe("ERR_SOLVENCY_FLOOR_BREACH");

    const pause = engine.updateGovernancePolicy(15_000_000, 50_000_000, VaultStatus.Paused);
    expect(pause.ok).toBe(true);
    const blocked = engine.settleConfidentialInvoice(SETTLEMENT_PRESETS[0].input);
    expect(blocked.ok).toBe(false);
    expect(blocked.errorCode).toBe("ERR_VAULT_PAUSED");
  });

  it("enforces v2.1 secret-keyed nullifiers, bound jurisdiction leaves, strict cap > amount, and tier isolation", () => {
    const engine = createSeededProofVaultEngine();
    const priv = engine.getPrivateWitnessVault();

    // 1. Secret-keyed nullifier differs from unkeyed dictionary guess
    const vHex = deriveVendorIdHex("vendor:ch:helvetia-fv-01");
    const lHex = deriveLineItemsHashHex(
      "INV-2026-041",
      "Compact circuit soundness review + ZKIR constraint audit (120 hrs)"
    );
    const keyed = deriveNullifierHex(deriveNullifierBlindingSaltHex(priv.operatorSecretKeyHex), vHex, lHex);
    const publicGuess = deriveUnkeyedDictionaryGuessHex(vHex, lHex);
    expect(keyed).not.toBe(publicGuess);
    expect(engine.getPublicLedger().usedInvoiceNullifiers).toContain(keyed);
    expect(engine.getPublicLedger().usedInvoiceNullifiers).not.toContain(publicGuess);

    // 2. Jurisdiction leaf bound into invoice commitment
    const salt = deriveDeterministicSaltHex("leaf-bind-test");
    expect(deriveInvoiceCommitmentHex(vHex, lHex, 1_000_000, deriveJurisdictionDigestHex("CH"), salt)).not.toBe(
      deriveInvoiceCommitmentHex(vHex, lHex, 1_000_000, deriveJurisdictionDigestHex("SG"), salt)
    );

    // 3. Strict cap > amount (equality rejected)
    const eqCap = engine.settleConfidentialInvoice({
      ...SETTLEMENT_PRESETS[0].input,
      invoiceReference: "INV-STRICT-EQ",
      amountCents: 50_000_00,
      budgetTierCapCents: 50_000_00
    });
    expect(eqCap.ok).toBe(false);
    expect(eqCap.errorCode).toBe("ERR_STRICT_CAP_BOUND");

    // 4. MinimalSolvency rejects narrow cap
    const badMin = engine.settleConfidentialInvoice({
      ...SETTLEMENT_PRESETS[2].input,
      invoiceReference: "INV-MIN-NARROW",
      budgetTierCapCents: 30_000_00,
      disclosureTier: DisclosureTier.MinimalSolvency
    });
    expect(badMin.ok).toBe(false);
    expect(badMin.errorCode).toBe("ERR_TIER_CAP_POLICY_MISMATCH");

    // 5. ThresholdBand rejects full governance ceiling
    const badBand = engine.settleConfidentialInvoice({
      ...SETTLEMENT_PRESETS[1].input,
      invoiceReference: "INV-BAND-FULL",
      budgetTierCapCents: 150_000_00,
      disclosureTier: DisclosureTier.ThresholdBand
    });
    expect(badBand.ok).toBe(false);
    expect(badBand.errorCode).toBe("ERR_TIER_CAP_POLICY_MISMATCH");

    // 6. AuditorScoped rejects unregistered auditor key
    const badAud = engine.settleConfidentialInvoice({
      ...SETTLEMENT_PRESETS[0].input,
      invoiceReference: "INV-AUD-ROGUE",
      auditorViewingKeyOverride: deriveDeterministicSaltHex("unregistered-auditor")
    });
    expect(badAud.ok).toBe(false);
    expect(badAud.errorCode).toBe("ERR_UNAUTHORIZED_AUDITOR_KEY");
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

  it("rejects all 4 primary Adversarial Breaker Lab attacks + 2 bonus v2.1 attacks with zero state mutation", () => {
    const engine = createSeededProofVaultEngine();
    expect(ADVERSARIAL_ATTACKS).toHaveLength(6);

    const primaryIds = [
      "replay-used-nullifier",
      "forge-unapproved-jurisdiction",
      "exceed-policy-cap",
      "break-solvency-threshold"
    ] as const;

    for (const id of primaryIds) {
      const report = executeAdversarialAttack(engine, id);
      expect(report.rejected, `${id} must be rejected`).toBe(true);
      expect(report.stateUnchanged, `${id} must not mutate public ledger`).toBe(true);
      expect(report.subChecks.every((c) => c.passed), `${id} sub-checks must all pass`).toBe(true);
    }

    const allReports = executeAllAdversarialAttacks(engine);
    expect(allReports).toHaveLength(6);
    expect(allReports.every((r) => r.rejected && r.stateUnchanged)).toBe(true);
    expect(allReports.map((r) => r.errorCode)).toEqual([
      "ERR_NULLIFIER_REPLAY",
      "ERR_UNAPPROVED_JURISDICTION",
      "ERR_POLICY_CAP_EXCEEDED",
      "ERR_SOLVENCY_FLOOR_BREACH",
      "ERR_UNAUTHORIZED_AUDITOR_KEY",
      "ERR_TIER_CAP_POLICY_MISMATCH"
    ]);
  });

  it("returns an empty wallet list safely in non-browser Node environments", () => {
    expect(discoverMidnightWallets()).toEqual([]);
  });
});
