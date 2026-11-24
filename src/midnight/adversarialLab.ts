import {
  ProofVaultEngine,
  deriveDeterministicSaltHex,
  deriveInvoiceCommitmentHex,
  deriveJurisdictionDigestHex,
  deriveLineItemsHashHex,
  deriveNullifierBlindingSaltHex,
  deriveNullifierHex,
  deriveUnkeyedDictionaryGuessHex,
  deriveVendorIdHex
} from "./proofEngine";
import { DEFAULT_JURISDICTIONS } from "./presets";
import {
  DisclosureTier,
  type AdversarialAttackId,
  type AdversarialAttackReport,
  type AdversarialAttackScenario,
  type AdversarialSubCheck
} from "./types";

export const ADVERSARIAL_ATTACKS: AdversarialAttackScenario[] = [
  {
    id: "replay-used-nullifier",
    code: "ATK-01",
    title: "Replay Used Nullifier",
    primary: true,
    summary:
      "Re-submits already-settled invoice INV-2026-041 with fresh blinding salts and tests whether an unkeyed dictionary attacker can recompute the on-chain nullifier.",
    targetCircuit: "settleConfidentialInvoice",
    expectedErrorCode: "ERR_NULLIFIER_REPLAY",
    compactGuardId: "Guard G20",
    compactAssertion: 'assert(!usedInvoiceNullifiers.member(publicNullifier), "Invoice nullifier already spent");',
    mutationProof:
      "Killed in tests/mutation-audit.test.ts [G20]: deleting this compiled __compactRuntime.assert lets the exact duplicate settlement pass."
  },
  {
    id: "forge-unapproved-jurisdiction",
    code: "ATK-02",
    title: "Forge Unapproved Jurisdiction Leaf",
    primary: true,
    summary:
      "Attempts both (a) an unlisted sanctioned country (KP) and (b) a witness-swap forging KP as jurisdictionLeaf while replaying a valid CH Merkle path.",
    targetCircuit: "settleConfidentialInvoice",
    expectedErrorCode: "ERR_UNAPPROVED_JURISDICTION",
    compactGuardId: "Guards G18 & G19",
    compactAssertion:
      'assert(jPath.leaf == jLeaf, "Jurisdiction leaf does not match Merkle path"); assert(approvedJurisdictions.checkRoot(disclose(computedRoot)), ...);',
    mutationProof:
      "Killed in tests/mutation-audit.test.ts [G18, G19]: deleting either compiled assert permits forged leaf or unlisted country settlement; jLeaf is also bound into deriveInvoiceCommitment."
  },
  {
    id: "exceed-policy-cap",
    code: "ATK-03",
    title: "Exceed Policy Cap",
    primary: true,
    summary:
      "Tests both (a) exceeding the $150,000 public governance ceiling and (b) setting budgetTierCap == invoiceAmount ($50,000 == $50,000) to violate strict cap > amount.",
    targetCircuit: "settleConfidentialInvoice",
    expectedErrorCode: "ERR_POLICY_CAP_EXCEEDED",
    compactGuardId: "Guards G12 & G13",
    compactAssertion:
      'assert(amount < publicCap, "Invoice must be strictly below declared budget tier cap"); assert(publicCap <= policyMaxSingleSettlement, ...);',
    mutationProof:
      "Killed in tests/mutation-audit.test.ts [G12, G13]: deleting either assert allows exact-payout leakage (amount == cap) or governance ceiling overflow."
  },
  {
    id: "break-solvency-threshold",
    code: "ATK-04",
    title: "Break Solvency Threshold",
    primary: true,
    summary:
      "Attempts both (a) forging a $3,000,000 solvency attestation above actual reserves and (b) settling an invoice that drains remaining reserves below policyMinReserveFloor.",
    targetCircuit: "proveTreasurySolvency",
    expectedErrorCode: "ERR_SOLVENCY_FLOOR_BREACH",
    compactGuardId: "Guards G07 & G15",
    compactAssertion:
      'assert(balance >= claimedMinFloor, "Treasury below requested solvency floor"); assert(remainingBalance >= policyMinReserveFloor, ...);',
    mutationProof:
      "Killed in tests/mutation-audit.test.ts [G07, G15]: deleting either assert lets an insolvent vault fabricate solvency proofs or drain past its reserve floor."
  },
  {
    id: "forge-unregistered-auditor",
    code: "ATK-05",
    title: "Forge Unregistered Auditor Key",
    primary: false,
    summary:
      "Attempts to emit an AuditorScoped receipt using an arbitrary unregistered viewing key that does not hash to on-chain authorizedAuditorCommitment.",
    targetCircuit: "settleConfidentialInvoice",
    expectedErrorCode: "ERR_UNAUTHORIZED_AUDITOR_KEY",
    compactGuardId: "Guard G21",
    compactAssertion:
      'assert(publicTier != DisclosureTier.AuditorScoped || derivedAuditorCommitment == authorizedAuditorCommitment, "Auditor viewing key is not authorized for this vault");',
    mutationProof:
      "Killed in tests/mutation-audit.test.ts [G21]: deleting this guard allows arbitrary junk bytes in AuditorScoped receipts."
  },
  {
    id: "break-tier-cap-isolation",
    code: "ATK-06",
    title: "Break MinimalSolvency Cap Isolation",
    primary: false,
    summary:
      "Attempts to leak a narrow $30,000 cap under MinimalSolvency (must equal $150,000 ceiling) and a full $150,000 ceiling under ThresholdBand (must be strictly below ceiling).",
    targetCircuit: "settleConfidentialInvoice",
    expectedErrorCode: "ERR_TIER_CAP_POLICY_MISMATCH",
    compactGuardId: "Guards G16 & G17",
    compactAssertion:
      'assert(publicTier != MinimalSolvency || publicCap == policyMaxSingleSettlement, ...); assert(publicTier != ThresholdBand || publicCap < policyMaxSingleSettlement, ...);',
    mutationProof:
      "Killed in tests/mutation-audit.test.ts [G16, G17]: proves MinimalSolvency and ThresholdBand enforce distinct on-chain disclosure rules rather than cosmetic enum tags."
  }
];

export function executeAdversarialAttack(
  engine: ProofVaultEngine,
  attackId: AdversarialAttackId
): AdversarialAttackReport {
  const startedAt = Date.now();
  const scenario = ADVERSARIAL_ATTACKS.find((a) => a.id === attackId);
  if (!scenario) {
    throw new Error(`Unknown adversarial attack id: ${attackId}`);
  }

  const before = engine.getPublicLedger();
  const priv = engine.getPrivateWitnessVault();
  const subChecks: AdversarialSubCheck[] = [];

  let rejected = false;
  let errorCode = "ERR_UNEXPECTED_PASS";
  let guardMessage = "Attack was not rejected!";
  let steps = [] as AdversarialAttackReport["steps"];

  if (attackId === "replay-used-nullifier") {
    // Live attack against active vault: replay seeded INV-2026-041
    const replayRes = engine.settleConfidentialInvoice({
      vendorLabel: "Helvetia Formal Verification GmbH",
      vendorIdRaw: "vendor:ch:helvetia-fv-01",
      lineItemsSummary: "Compact circuit soundness review + ZKIR constraint audit (120 hrs)",
      invoiceReference: "INV-2026-041",
      amountCents: 38_500_00,
      budgetTierCapCents: 50_000_00,
      jurisdictionCode: "CH",
      disclosureTier: DisclosureTier.AuditorScoped
    });

    rejected = !replayRes.ok;
    errorCode = replayRes.errorCode ?? "ERR_NULLIFIER_REPLAY";
    guardMessage = replayRes.error ?? guardMessage;
    steps = replayRes.steps;

    const vendorHex = deriveVendorIdHex("vendor:ch:helvetia-fv-01");
    const itemsHex = deriveLineItemsHashHex(
      "INV-2026-041",
      "Compact circuit soundness review + ZKIR constraint audit (120 hrs)"
    );
    const keyedNullifier = deriveNullifierHex(
      deriveNullifierBlindingSaltHex(priv.operatorSecretKeyHex),
      vendorHex,
      itemsHex
    );
    const publicGuess = deriveUnkeyedDictionaryGuessHex(vendorHex, itemsHex);
    const dictionaryDefeated = keyedNullifier !== publicGuess && !before.usedInvoiceNullifiers.includes(publicGuess);

    subChecks.push(
      {
        label: "Duplicate invoice replay rejected",
        passed: !replayRes.ok && replayRes.errorCode === "ERR_NULLIFIER_REPLAY",
        detail: `Circuit rejected replay with ${replayRes.errorCode}: "${replayRes.error}"`
      },
      {
        label: "Unkeyed dictionary attack defeated (v2.1 secret blinding salt)",
        passed: dictionaryDefeated,
        detail: `Public guess 0x${publicGuess.slice(0, 12)}... != keyed on-chain nullifier 0x${keyedNullifier.slice(0, 12)}...`
      }
    );
  } else if (attackId === "forge-unapproved-jurisdiction") {
    // Sub-attack A: Unlisted sanctioned jurisdiction (KP)
    const unlistedRes = engine.settleConfidentialInvoice({
      vendorLabel: "Unverified Offshore Entity",
      vendorIdRaw: "vendor:kp:breaker-01",
      lineItemsSummary: "Sanctioned counterparty payout attempt",
      invoiceReference: "INV-BREAKER-KP-01",
      amountCents: 12_000_00,
      budgetTierCapCents: 25_000_00,
      jurisdictionCode: "KP",
      disclosureTier: DisclosureTier.ThresholdBand
    });

    // Sub-attack B: Witness leaf-swap attack (commit KP leaf while presenting valid CH Merkle path)
    const leafSwapRes = engine.settleConfidentialInvoice({
      vendorLabel: "Sanctioned Counterparty Disguised as CH",
      vendorIdRaw: "vendor:kp:breaker-swap-02",
      lineItemsSummary: "Witness leaf swap attempting to open CH path for KP invoice",
      invoiceReference: "INV-BREAKER-SWAP-02",
      amountCents: 12_000_00,
      budgetTierCapCents: 25_000_00,
      jurisdictionCode: "CH",
      jurisdictionLeafOverrideCode: "KP",
      disclosureTier: DisclosureTier.ThresholdBand
    });

    // Sub-check C: Invoice commitment cryptographically changes when jurisdiction leaf changes
    const vHex = deriveVendorIdHex("vendor:bind:check");
    const lHex = deriveLineItemsHashHex("INV-BIND", "Scope");
    const salt = deriveDeterministicSaltHex("bind:salt");
    const commitCH = deriveInvoiceCommitmentHex(vHex, lHex, 1_000_000, deriveJurisdictionDigestHex("CH"), salt);
    const commitKP = deriveInvoiceCommitmentHex(vHex, lHex, 1_000_000, deriveJurisdictionDigestHex("KP"), salt);

    rejected = !unlistedRes.ok && !leafSwapRes.ok;
    errorCode = unlistedRes.errorCode ?? "ERR_UNAPPROVED_JURISDICTION";
    guardMessage = `${unlistedRes.error} | Leaf-swap: ${leafSwapRes.error}`;
    steps = leafSwapRes.steps;

    subChecks.push(
      {
        label: "Unlisted jurisdiction (KP) rejected by HistoricMerkleTree",
        passed: !unlistedRes.ok && unlistedRes.errorCode === "ERR_UNAPPROVED_JURISDICTION",
        detail: `${unlistedRes.errorCode}: "${unlistedRes.error}"`
      },
      {
        label: "Leaf-swap attack (KP witness + CH Merkle path) rejected",
        passed: !leafSwapRes.ok && leafSwapRes.errorCode === "ERR_JURISDICTION_LEAF_MISMATCH",
        detail: `${leafSwapRes.errorCode}: "${leafSwapRes.error}"`
      },
      {
        label: "Jurisdiction leaf cryptographically bound to invoiceCommitment",
        passed: commitCH !== commitKP,
        detail: `commit(CH)=0x${commitCH.slice(0, 10)}... != commit(KP)=0x${commitKP.slice(0, 10)}...`
      }
    );
  } else if (attackId === "exceed-policy-cap") {
    // Sub-attack A: Exceed governance ceiling ($180k > $150k)
    const ceilingRes = engine.settleConfidentialInvoice({
      vendorLabel: "Apex Liquidity Desk",
      vendorIdRaw: "vendor:gb:breaker-cap-01",
      lineItemsSummary: "Over-ceiling disbursement attempt",
      invoiceReference: "INV-BREAKER-CAP-01",
      amountCents: 175_000_00,
      budgetTierCapCents: 180_000_00,
      jurisdictionCode: "GB",
      disclosureTier: DisclosureTier.ThresholdBand
    });

    // Sub-attack B: Violate strict cap > amount (set cap == amount == $50,000 to leak exact payout)
    const equalityRes = engine.settleConfidentialInvoice({
      vendorLabel: "Exact-Amount Leak Attempt",
      vendorIdRaw: "vendor:ch:breaker-eq-02",
      lineItemsSummary: "Setting budgetTierCap == invoiceAmount to leak exact payout",
      invoiceReference: "INV-BREAKER-EQ-02",
      amountCents: 50_000_00,
      budgetTierCapCents: 50_000_00,
      jurisdictionCode: "CH",
      disclosureTier: DisclosureTier.ThresholdBand
    });

    rejected = !ceilingRes.ok && !equalityRes.ok;
    errorCode = ceilingRes.errorCode ?? "ERR_POLICY_CAP_EXCEEDED";
    guardMessage = `${ceilingRes.error} | Strict cap: ${equalityRes.error}`;
    steps = equalityRes.steps;

    subChecks.push(
      {
        label: "Governance ceiling breach ($180k > $150k max) rejected",
        passed: !ceilingRes.ok && ceilingRes.errorCode === "ERR_POLICY_CAP_EXCEEDED",
        detail: `${ceilingRes.errorCode}: "${ceilingRes.error}"`
      },
      {
        label: "Strict cap > amount enforced ($50k == $50k rejected)",
        passed: !equalityRes.ok && equalityRes.errorCode === "ERR_STRICT_CAP_BOUND",
        detail: `${equalityRes.errorCode}: "${equalityRes.error}"`
      }
    );
  } else if (attackId === "break-solvency-threshold") {
    // Sub-attack A: False solvency claim above actual vault balance
    const falseClaimFloor = priv.treasuryBalanceCents + 60_000_000;
    const solvencyRes = engine.proveTreasurySolvency(falseClaimFloor);

    // Sub-attack B: Sandbox mirror positioned right above reserve floor to prove post-settlement floor guard
    const sandbox = new ProofVaultEngine({
      operatorSecretKeyHex: priv.operatorSecretKeyHex,
      initialTreasuryBalanceCents: 51_000_000, // $510,000 balance
      initialBlindingFactorHex: deriveDeterministicSaltHex("breaker:sandbox:salt"),
      auditorViewingKeyHex: priv.auditorViewingKeyHex,
      maxSingleSettlementCents: 15_000_000,
      minReserveFloorCents: 50_000_000, // $500,000 floor -> $20,000 payout leaves $490,000 < floor
      initialJurisdictions: DEFAULT_JURISDICTIONS
    });
    const floorBreachRes = sandbox.settleConfidentialInvoice({
      vendorLabel: "Reserve Drain Attempt",
      vendorIdRaw: "vendor:ch:breaker-floor-01",
      lineItemsSummary: "Payout draining reserves beneath governance floor",
      invoiceReference: "INV-BREAKER-FLOOR-01",
      amountCents: 2_000_000, // $20,000
      budgetTierCapCents: 5_000_000, // $50,000
      jurisdictionCode: "CH",
      disclosureTier: DisclosureTier.ThresholdBand
    });

    rejected = !solvencyRes.ok && !floorBreachRes.ok;
    errorCode = solvencyRes.errorCode ?? "ERR_SOLVENCY_FLOOR_BREACH";
    guardMessage = `${solvencyRes.error} | Settle floor: ${floorBreachRes.error}`;
    steps = solvencyRes.steps;

    subChecks.push(
      {
        label: "False solvency attestation above actual reserves rejected",
        passed: !solvencyRes.ok && solvencyRes.errorCode === "ERR_SOLVENCY_FLOOR_BREACH",
        detail: `${solvencyRes.errorCode}: "${solvencyRes.error}"`
      },
      {
        label: "Post-settlement reserve floor drain ($510k - $20k < $500k) rejected",
        passed: !floorBreachRes.ok && floorBreachRes.errorCode === "ERR_RESERVE_FLOOR_BREACH",
        detail: `${floorBreachRes.errorCode}: "${floorBreachRes.error}"`
      }
    );
  } else if (attackId === "forge-unregistered-auditor") {
    const rogueKey = deriveDeterministicSaltHex("rogue:unregistered:auditor:key");
    const res = engine.settleConfidentialInvoice({
      vendorLabel: "Rogue Auditor Target",
      vendorIdRaw: "vendor:ch:breaker-aud-01",
      lineItemsSummary: "Attempting AuditorScoped tag with unregistered viewing key",
      invoiceReference: "INV-BREAKER-AUD-01",
      amountCents: 15_000_00,
      budgetTierCapCents: 25_000_00,
      jurisdictionCode: "CH",
      disclosureTier: DisclosureTier.AuditorScoped,
      auditorViewingKeyOverride: rogueKey
    });

    rejected = !res.ok;
    errorCode = res.errorCode ?? "ERR_UNAUTHORIZED_AUDITOR_KEY";
    guardMessage = res.error ?? guardMessage;
    steps = res.steps;

    subChecks.push({
      label: "Unregistered auditor viewing key rejected by authorizedAuditorCommitment",
      passed: !res.ok && res.errorCode === "ERR_UNAUTHORIZED_AUDITOR_KEY",
      detail: `${res.errorCode}: "${res.error}"`
    });
  } else if (attackId === "break-tier-cap-isolation") {
    const minimalNarrowRes = engine.settleConfidentialInvoice({
      vendorLabel: "Minimal Tier Narrow Cap Test",
      vendorIdRaw: "vendor:us:breaker-tier-01",
      lineItemsSummary: "Trying narrow $30k cap under MinimalSolvency",
      invoiceReference: "INV-BREAKER-TIER-01",
      amountCents: 20_000_00,
      budgetTierCapCents: 30_000_00,
      jurisdictionCode: "US",
      disclosureTier: DisclosureTier.MinimalSolvency
    });

    const thresholdMaxRes = engine.settleConfidentialInvoice({
      vendorLabel: "Threshold Tier Full Ceiling Test",
      vendorIdRaw: "vendor:sg:breaker-tier-02",
      lineItemsSummary: "Trying full governance ceiling under ThresholdBand",
      invoiceReference: "INV-BREAKER-TIER-02",
      amountCents: 20_000_00,
      budgetTierCapCents: before.policyMaxSingleSettlementCents,
      jurisdictionCode: "SG",
      disclosureTier: DisclosureTier.ThresholdBand
    });

    rejected = !minimalNarrowRes.ok && !thresholdMaxRes.ok;
    errorCode = minimalNarrowRes.errorCode ?? "ERR_TIER_CAP_POLICY_MISMATCH";
    guardMessage = `${minimalNarrowRes.error} | ${thresholdMaxRes.error}`;
    steps = minimalNarrowRes.steps;

    subChecks.push(
      {
        label: "MinimalSolvency rejects narrow custom cap ($30k != $150k ceiling)",
        passed: !minimalNarrowRes.ok && minimalNarrowRes.errorCode === "ERR_TIER_CAP_POLICY_MISMATCH",
        detail: `${minimalNarrowRes.errorCode}: "${minimalNarrowRes.error}"`
      },
      {
        label: "ThresholdBand rejects un-narrowed full ceiling ($150k == $150k ceiling)",
        passed: !thresholdMaxRes.ok && thresholdMaxRes.errorCode === "ERR_TIER_CAP_POLICY_MISMATCH",
        detail: `${thresholdMaxRes.errorCode}: "${thresholdMaxRes.error}"`
      }
    );
  }

  const after = engine.getPublicLedger();
  const stateUnchanged =
    before.treasuryBalanceCommitment === after.treasuryBalanceCommitment &&
    before.settledInvoiceCount === after.settledInvoiceCount &&
    before.usedInvoiceNullifiers.length === after.usedInvoiceNullifiers.length &&
    before.approvedJurisdictionsRoot === after.approvedJurisdictionsRoot;

  subChecks.push({
    label: "Zero public ledger state mutation verified",
    passed: stateUnchanged,
    detail: `treasuryBalanceCommitment (0x${after.treasuryBalanceCommitment.slice(0, 10)}...) and settledInvoiceCount (${after.settledInvoiceCount}) unchanged`
  });

  return {
    attackId: scenario.id,
    code: scenario.code,
    title: scenario.title,
    rejected,
    errorCode,
    guardMessage,
    compactGuardId: scenario.compactGuardId,
    compactAssertion: scenario.compactAssertion,
    mutationProof: scenario.mutationProof,
    stateUnchanged,
    beforeCommitment: before.treasuryBalanceCommitment,
    afterCommitment: after.treasuryBalanceCommitment,
    beforeSettledCount: before.settledInvoiceCount,
    afterSettledCount: after.settledInvoiceCount,
    durationMs: Math.max(2, Date.now() - startedAt),
    executedAtIso: new Date().toISOString(),
    steps,
    subChecks
  };
}

export function executeAllAdversarialAttacks(engine: ProofVaultEngine): AdversarialAttackReport[] {
  return ADVERSARIAL_ATTACKS.map((attack) => executeAdversarialAttack(engine, attack.id));
}
