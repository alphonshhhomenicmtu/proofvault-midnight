import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  EyeOff,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  XCircle
} from "lucide-react";
import {
  DisclosureTier,
  type InvoiceSettlementInput,
  type InvoiceSettlementResult,
  type PublicLedgerSnapshot,
  type WalletConnectionState
} from "../midnight/types";
import {
  SETTLEMENT_PRESETS,
  formatUsdFromCents,
  truncateHex
} from "../midnight/presets";

interface SettleTabProps {
  ledger: PublicLedgerSnapshot;
  lastResult: InvoiceSettlementResult | null;
  walletState: WalletConnectionState;
  dispatchingWallet: boolean;
  onSettle: (input: InvoiceSettlementInput) => void;
  onDispatchWallet: () => void;
  onInspectReceipt: (receiptId: string) => void;
}

const EXTRA_TEST_JURISDICTIONS = [
  { code: "KP", label: "North Korea (Sanctioned Test)" },
  { code: "IR", label: "Iran (Sanctioned Test)" }
];

export function SettleTab({
  ledger,
  lastResult,
  walletState,
  dispatchingWallet,
  onSettle,
  onDispatchWallet,
  onInspectReceipt
}: SettleTabProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SETTLEMENT_PRESETS[0].id);
  const [vendorLabel, setVendorLabel] = useState(SETTLEMENT_PRESETS[0].input.vendorLabel);
  const [vendorIdRaw, setVendorIdRaw] = useState(SETTLEMENT_PRESETS[0].input.vendorIdRaw);
  const [invoiceReference, setInvoiceReference] = useState(SETTLEMENT_PRESETS[0].input.invoiceReference);
  const [lineItemsSummary, setLineItemsSummary] = useState(SETTLEMENT_PRESETS[0].input.lineItemsSummary);
  const [amountUsd, setAmountUsd] = useState((SETTLEMENT_PRESETS[0].input.amountCents / 100).toString());
  const [budgetTierCapUsd, setBudgetTierCapUsd] = useState(
    (SETTLEMENT_PRESETS[0].input.budgetTierCapCents / 100).toString()
  );
  const [jurisdictionCode, setJurisdictionCode] = useState(SETTLEMENT_PRESETS[0].input.jurisdictionCode);
  const [disclosureTier, setDisclosureTier] = useState<DisclosureTier>(
    SETTLEMENT_PRESETS[0].input.disclosureTier
  );

  const applyPreset = (presetId: string) => {
    const preset = SETTLEMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setVendorLabel(preset.input.vendorLabel);
    setVendorIdRaw(preset.input.vendorIdRaw);
    setInvoiceReference(preset.input.invoiceReference);
    setLineItemsSummary(preset.input.lineItemsSummary);
    setAmountUsd((preset.input.amountCents / 100).toString());
    setBudgetTierCapUsd((preset.input.budgetTierCapCents / 100).toString());
    setJurisdictionCode(preset.input.jurisdictionCode);
    setDisclosureTier(preset.input.disclosureTier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Math.round(Number(amountUsd.replace(/,/g, "")) * 100);
    const cap = Math.round(Number(budgetTierCapUsd.replace(/,/g, "")) * 100);
    onSettle({
      vendorLabel,
      vendorIdRaw,
      invoiceReference,
      lineItemsSummary,
      amountCents: Number.isFinite(amt) ? amt : 0,
      budgetTierCapCents: Number.isFinite(cap) ? cap : 0,
      jurisdictionCode,
      disclosureTier
    });
  };

  const isJurisdictionApproved = ledger.approvedJurisdictions.some(
    (j) => j.code === jurisdictionCode.toUpperCase()
  );

  return (
    <div>
      {/* 1-Click Scenario Selector */}
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
          Quick Scenarios — Valid Confidential Settlements &amp; Live ZK Guard Tests
        </div>
        <span className="mono" style={{ fontSize: 11.5, color: "#64748b" }}>
          Governance Cap: {formatUsdFromCents(ledger.policyMaxSingleSettlementCents)} · Min Floor:{" "}
          {formatUsdFromCents(ledger.policyMinReserveFloorCents)}
        </span>
      </div>

      <div className="preset-grid">
        {SETTLEMENT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`preset-btn ${preset.category === "guard-test" ? "guard" : ""} ${
              selectedPresetId === preset.id ? "selected" : ""
            }`}
            onClick={() => applyPreset(preset.id)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span className="preset-title">{preset.label}</span>
              <span className={`badge ${preset.category === "valid" ? "emerald" : "rose"}`}>
                {preset.badge}
              </span>
            </div>
            <span className="preset-desc">{preset.description}</span>
          </button>
        ))}
      </div>

      {/* Main Settlement Workbench */}
      <div className="two-col-weighted">
        {/* Left: Private Witness Form */}
        <form className="card private-zone" onSubmit={handleSubmit} noValidate>
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Lock size={16} color="#f59e0b" />
                Confidential Invoice &amp; Witness Inputs
              </h2>
              <p className="card-subtitle">
                Private fields execute inside <span className="mono">settleConfidentialInvoice()</span>. Only the commitment, nullifier, Merkle root, and tier cap reach Midnight&apos;s public ledger.
              </p>
            </div>
            <span className="badge amber">PRIVATE WITNESSES</span>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="vendor-label">
                <span>Counterparty Display Name</span>
                <span className="mono" style={{ color: "#f59e0b" }}>local only</span>
              </label>
              <input
                id="vendor-label"
                className="input"
                value={vendorLabel}
                onChange={(e) => setVendorLabel(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="vendor-id">
                <span>Counterparty Private ID</span>
                <span className="mono" style={{ color: "#f59e0b" }}>witness</span>
              </label>
              <input
                id="vendor-id"
                className="input mono"
                value={vendorIdRaw}
                onChange={(e) => setVendorIdRaw(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="invoice-ref">
                <span>Invoice / Bounty Reference</span>
                <span className="mono" style={{ color: "#f59e0b" }}>witness</span>
              </label>
              <input
                id="invoice-ref"
                className="input mono"
                value={invoiceReference}
                onChange={(e) => setInvoiceReference(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="jurisdiction-select">
                <span>Counterparty Jurisdiction</span>
                <span className={`mono`} style={{ color: isJurisdictionApproved ? "#34d399" : "#fb7185" }}>
                  {isJurisdictionApproved ? "in Merkle tree" : "unlisted / blocked"}
                </span>
              </label>
              <select
                id="jurisdiction-select"
                className="select"
                value={jurisdictionCode}
                onChange={(e) => setJurisdictionCode(e.target.value)}
              >
                <optgroup label="Approved Non-Sanctioned Tree Leaves">
                  {ledger.approvedJurisdictions.map((j) => (
                    <option key={j.code} value={j.code}>
                      {j.code} — {j.label} (Leaf #{j.leafIndex})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Negative Guard Tests (Not in Merkle Tree)">
                  {EXTRA_TEST_JURISDICTIONS.map((j) => (
                    <option key={j.code} value={j.code}>
                      {j.code} — {j.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="field full">
              <label htmlFor="line-items">
                <span>Confidential Line Items / Deliverable Scope</span>
                <span className="mono" style={{ color: "#f59e0b" }}>hashed off-chain</span>
              </label>
              <input
                id="line-items"
                className="input"
                value={lineItemsSummary}
                onChange={(e) => setLineItemsSummary(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="invoice-amount">
                <span>Exact Payout Amount (USD)</span>
                <span className="mono" style={{ color: "#f59e0b" }}>private witness</span>
              </label>
              <input
                id="invoice-amount"
                className="input mono"
                type="number"
                step="any"
                min="0"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="budget-cap">
                <span>Public Budget Tier Cap (USD)</span>
                <span className="mono" style={{ color: "#38bdf8" }}>public bound</span>
              </label>
              <input
                id="budget-cap"
                className="input mono"
                type="number"
                step="any"
                min="0"
                value={budgetTierCapUsd}
                onChange={(e) => setBudgetTierCapUsd(e.target.value)}
                required
              />
            </div>

            <div className="field full">
              <label>
                <span>Selective-Disclosure Receipt Tier</span>
                <span className="mono" style={{ color: "#38bdf8" }}>enum DisclosureTier</span>
              </label>
              <div className="tier-group">
                {[
                  {
                    tier: DisclosureTier.MinimalSolvency,
                    title: "MinimalSolvency",
                    hint: "Zero auditor tag · Solvency + cap only"
                  },
                  {
                    tier: DisclosureTier.ThresholdBand,
                    title: "ThresholdBand",
                    hint: "DAO budget band + compliance root"
                  },
                  {
                    tier: DisclosureTier.AuditorScoped,
                    title: "AuditorScoped",
                    hint: "Binds external auditor viewing key tag"
                  }
                ].map((opt) => (
                  <button
                    key={opt.tier}
                    type="button"
                    className={`tier-option ${disclosureTier === opt.tier ? "active" : ""}`}
                    onClick={() => setDisclosureTier(opt.tier)}
                  >
                    <span className="tier-name">{opt.title}</span>
                    <span className="tier-hint">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <EyeOff size={14} color="#f59e0b" />
              Counterparty, line items, country &amp; exact amount remain shielded
            </span>
            <button type="submit" className="btn primary">
              <Cpu size={15} />
              Execute ZK Settlement Circuit
            </button>
          </div>
        </form>

        {/* Right: 6-Stage ZK Proving Pipeline & Payload Inspector */}
        <section className="card public-zone">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <ShieldCheck size={16} color="#38bdf8" />
                ZK Circuit Execution &amp; On-Chain Disclosure Diff
              </h2>
              <p className="card-subtitle">
                Deterministic constraint trace mirroring <span className="mono">settleConfidentialInvoice.zkir</span> (20,385 B).
              </p>
            </div>
            {lastResult && (
              <span className={`badge ${lastResult.ok ? "emerald" : "rose"}`}>
                {lastResult.ok ? `VERIFIED · ${lastResult.proofTimeMs}ms` : "CIRCUIT REJECTED"}
              </span>
            )}
          </div>

          {!lastResult ? (
            <div className="pipeline-step">
              <AlertTriangle size={16} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
              <div className="step-body">
                <div className="step-head">Select a scenario and click &ldquo;Execute ZK Settlement Circuit&rdquo;</div>
                <div className="step-detail">
                  Run either a compliant settlement or one of the 3 negative guard tests (Sanctioned Jurisdiction, Governance Cap Breach, or Nullifier Replay) to observe live Midnight circuit assertions.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`status-banner ${lastResult.ok ? "success" : "error"}`}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>
                    {lastResult.ok
                      ? "Zero-Knowledge Proof Verified & Committed to Midnight Ledger"
                      : `ZK Proof Aborted: ${lastResult.error}`}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 3 }}>
                    {lastResult.ok
                      ? `Receipt 0x${truncateHex(lastResult.receipt!.receiptId, 14, 10)} stored in auditReceipts Map; treasury balance re-blinded.`
                      : "Public ledger state unchanged. No nullifier consumed and zero private witness values leaked."}
                  </div>
                </div>
                {lastResult.ok && lastResult.receipt && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    {walletState.walletConnected && (
                      <button
                        type="button"
                        className="btn sm primary"
                        onClick={onDispatchWallet}
                        disabled={dispatchingWallet}
                      >
                        <Wallet size={13} />
                        {dispatchingWallet ? "Dispatching..." : `Sign / Dispatch (${walletState.walletName})`}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => onInspectReceipt(lastResult.receipt!.receiptId)}
                    >
                      Audit Receipt <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>

              {lastResult.walletDispatch && (
                <div
                  className={`status-banner ${lastResult.walletDispatch.ok ? "success" : "error"}`}
                  style={{ marginBottom: 14, fontSize: 12 }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>
                      {lastResult.walletDispatch.walletName} Dispatch ({lastResult.walletDispatch.dispatchPath})
                    </div>
                    <div style={{ opacity: 0.92, marginTop: 2 }}>{lastResult.walletDispatch.detail}</div>
                    {lastResult.walletDispatch.signatureHex && (
                      <div className="mono" style={{ marginTop: 4, fontSize: 11 }}>
                        Sig ({lastResult.walletDispatch.signatureScheme}): 0x{truncateHex(lastResult.walletDispatch.signatureHex, 14, 10)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pipeline-list" style={{ marginBottom: 14 }}>
                {lastResult.steps.map((step) => (
                  <div key={step.id} className={`pipeline-step ${step.status}`}>
                    {step.status === "passed" ? (
                      <CheckCircle2 size={15} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                    ) : (
                      <XCircle size={15} color="#fb7185" style={{ marginTop: 2, flexShrink: 0 }} />
                    )}
                    <div className="step-body">
                      <div className="step-head">
                        <span>{step.stage}</span>
                        <span className="mono" style={{ fontSize: 11, color: "#94a3b8" }}>
                          {step.durationMs}ms
                        </span>
                      </div>
                      <div className="step-constraint">{step.circuitConstraint}</div>
                      <div className="step-detail">{step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {lastResult.payloadPreview && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 8 }}>
                    Disclosed On-Chain Ledger Writes (Public)
                  </div>
                  <div className="kv-list" style={{ marginBottom: 12 }}>
                    <div className="kv-row">
                      <span className="kv-key">receiptId</span>
                      <span className="kv-val">0x{truncateHex(lastResult.payloadPreview.disclosedOutputs.receiptId, 14, 12)}</span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">nullifier</span>
                      <span className="kv-val">0x{truncateHex(lastResult.payloadPreview.disclosedOutputs.nullifier, 14, 12)}</span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">invoiceCommitment</span>
                      <span className="kv-val">0x{truncateHex(lastResult.payloadPreview.disclosedOutputs.invoiceCommitment, 14, 12)}</span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">nextTreasuryCommitment</span>
                      <span className="kv-val">0x{truncateHex(lastResult.payloadPreview.disclosedOutputs.nextTreasuryBalanceCommitment, 14, 12)}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldAlert size={14} />
                    Redacted Off-Chain Witnesses (Never Written On-Chain)
                  </div>
                  <div className="pill-row">
                    {lastResult.payloadPreview.shieldedWitnessFieldsRedacted.map((field) => (
                      <span key={field} className="badge amber">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
