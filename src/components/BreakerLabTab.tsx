import { useState } from "react";
import {
  CheckCircle2,
  Flame,
  Play,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  XCircle
} from "lucide-react";
import { ADVERSARIAL_ATTACKS } from "../midnight/adversarialLab";
import { truncateHex } from "../midnight/presets";
import type {
  AdversarialAttackId,
  AdversarialAttackReport,
  PublicLedgerSnapshot
} from "../midnight/types";

interface BreakerLabTabProps {
  ledger: PublicLedgerSnapshot;
  reports: Record<string, AdversarialAttackReport>;
  onRunAttack: (attackId: AdversarialAttackId) => AdversarialAttackReport;
  onRunAllAttacks: () => AdversarialAttackReport[];
}

export function BreakerLabTab({
  ledger,
  reports,
  onRunAttack,
  onRunAllAttacks
}: BreakerLabTabProps) {
  const [selectedId, setSelectedId] = useState<AdversarialAttackId>("replay-used-nullifier");

  const executedCount = Object.keys(reports).length;
  const blockedCount = Object.values(reports).filter((r) => r.rejected && r.stateUnchanged).length;
  const activeReport = reports[selectedId] ?? null;
  const activeScenario = ADVERSARIAL_ATTACKS.find((a) => a.id === selectedId) ?? ADVERSARIAL_ATTACKS[0];

  const handleClickAttack = (attackId: AdversarialAttackId) => {
    setSelectedId(attackId);
    onRunAttack(attackId);
  };

  const handleRunSweep = () => {
    const all = onRunAllAttacks();
    if (all.length > 0) {
      setSelectedId(all[0].attackId);
    }
  };

  return (
    <div>
      {/* Header & Honesty Note */}
      <section className="card public-zone" style={{ marginBottom: 18 }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <div>
            <h2 className="card-title">
              <Flame size={17} color="#fb7185" />
              Adversarial Breaker Lab — Live Invariant &amp; Guard-Mutation Verifier
            </h2>
            <p className="card-subtitle">
              Fire live exploit payloads against the active vault to watch each circuit guard reject the attack with exact error codes, zero public state mutation, and 1:1 guard-deletion mutation linkage to <span className="mono">contracts/proofvault.compact</span>.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="badge emerald">
              {executedCount > 0 ? `${blockedCount}/${executedCount} ATTACKS BLOCKED` : "24/24 COMPACT GUARDS"}
            </span>
            <button type="button" className="btn primary" onClick={handleRunSweep}>
              <Play size={14} />
              Run All 6 Attacks
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "9px 12px",
            borderRadius: 8,
            background: "#080c14",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            fontSize: 12,
            color: "#94a3b8",
            lineHeight: 1.5
          }}
        >
          <strong style={{ color: "#e2e8f0" }}>Execution Scope:</strong> Click-to-attack runs live in your browser against the <span className="mono" style={{ color: "#38bdf8" }}>SHA-256 Deterministic Circuit Simulator</span> mirroring all 24 assertions of <span className="mono">proofvault.compact</span> v2.1. The companion <span className="mono">tests/mutation-audit.test.ts</span> suite deletes each compiled <span className="mono">__compactRuntime.assert(...)</span> in <span className="mono">contracts/managed/proofvault/contract/index.js</span> one by one under <span className="mono">@midnight-ntwrk/compact-runtime@0.21.0</span> (JS runtime guard coverage, not ZKIR gate-level rewriting).
        </div>
      </section>

      {/* Primary 4 1-Click Attack Buttons + 2 v2.1 Hardening Attacks */}
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
          One-Click Exploit Payloads (Click Any Card to Execute Live)
        </div>
        <span className="mono" style={{ fontSize: 11.5, color: "#64748b" }}>
          Active Commitment: 0x{truncateHex(ledger.treasuryBalanceCommitment, 10, 8)} · Receipts: {ledger.settledInvoiceCount}
        </span>
      </div>

      <div className="breaker-grid" style={{ marginBottom: 18 }}>
        {ADVERSARIAL_ATTACKS.map((attack) => {
          const rep = reports[attack.id];
          const isSelected = selectedId === attack.id;
          return (
            <button
              key={attack.id}
              type="button"
              className={`breaker-card ${isSelected ? "selected" : ""} ${rep?.rejected ? "blocked" : ""}`}
              onClick={() => handleClickAttack(attack.id)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: "#fb7185", fontWeight: 600 }}>
                  {attack.code} · {attack.compactGuardId}
                </span>
                {rep ? (
                  <span className={`badge ${rep.rejected && rep.stateUnchanged ? "emerald" : "rose"}`}>
                    {rep.rejected && rep.stateUnchanged ? "REJECTED · 0 LEAK" : "UNBLOCKED"}
                  </span>
                ) : (
                  <span className={`badge ${attack.primary ? "rose" : "amber"}`}>
                    {attack.primary ? "1-CLICK ATTACK" : "V2.1 GUARD"}
                  </span>
                )}
              </div>

              <div className="breaker-title">{attack.title}</div>
              <div className="breaker-desc">{attack.summary}</div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto", paddingTop: 6 }}>
                <span className="mono" style={{ fontSize: 11, color: "#38bdf8" }}>
                  {rep ? rep.errorCode : attack.expectedErrorCode}
                </span>
                <span className="mono" style={{ fontSize: 11, color: "#94a3b8" }}>
                  {rep ? `${rep.durationMs}ms · click to re-run` : "Launch attack →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Forensic Inspection Panel */}
      <div className="two-col-weighted">
        {/* Left: Live Rejection Telemetry & Sub-Checks */}
        <section className="card public-zone">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <ShieldAlert size={16} color="#fb7185" />
                {activeScenario.code}: {activeScenario.title}
              </h2>
              <p className="card-subtitle">
                Target circuit: <span className="mono">{activeScenario.targetCircuit}()</span> · Guard: <span className="mono">{activeScenario.compactGuardId}</span>
              </p>
            </div>
            {activeReport && (
              <span className={`badge ${activeReport.rejected && activeReport.stateUnchanged ? "emerald" : "rose"}`}>
                {activeReport.rejected ? `DEFENDED · ${activeReport.errorCode}` : "BREACH"}
              </span>
            )}
          </div>

          {!activeReport ? (
            <div className="pipeline-step">
              <Terminal size={16} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
              <div className="step-body">
                <div className="step-head">Ready to fire {activeScenario.code}</div>
                <div className="step-detail">
                  Click the <strong>{activeScenario.title}</strong> card above (or &ldquo;Run All 6 Attacks&rdquo;) to watch the circuit reject this payload live and verify zero public state mutation.
                </div>
                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn sm danger"
                    onClick={() => handleClickAttack(activeScenario.id)}
                  >
                    <Flame size={13} />
                    Execute {activeScenario.title}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`status-banner ${activeReport.rejected && activeReport.stateUnchanged ? "success" : "error"}`}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>
                    Attack Rejected Live — <span className="mono">{activeReport.errorCode}</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.92, marginTop: 3 }}>
                    {activeReport.guardMessage}
                  </div>
                </div>
                {activeReport.rejected ? <ShieldCheck size={18} style={{ flexShrink: 0 }} /> : <XCircle size={18} style={{ flexShrink: 0 }} />}
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: "#34d399", marginBottom: 8 }}>
                Live Invariant &amp; Cryptographic Defense Checks
              </div>
              <div className="pipeline-list" style={{ marginBottom: 14 }}>
                {activeReport.subChecks.map((chk) => (
                  <div key={chk.label} className={`pipeline-step ${chk.passed ? "passed" : "failed"}`}>
                    {chk.passed ? (
                      <CheckCircle2 size={15} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                    ) : (
                      <XCircle size={15} color="#fb7185" style={{ marginTop: 2, flexShrink: 0 }} />
                    )}
                    <div className="step-body">
                      <div className="step-head">{chk.label}</div>
                      <div className="step-detail mono" style={{ fontSize: 11.5 }}>
                        {chk.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 8 }}>
                Pre-Attack vs. Post-Attack Public Ledger Fingerprint
              </div>
              <div className="kv-list">
                <div className="kv-row">
                  <span className="kv-key">Before Commitment</span>
                  <span className="kv-val">0x{truncateHex(activeReport.beforeCommitment, 14, 12)}</span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">After Commitment</span>
                  <span className="kv-val" style={{ color: activeReport.stateUnchanged ? "#34d399" : "#fb7185" }}>
                    0x{truncateHex(activeReport.afterCommitment, 14, 12)} ({activeReport.stateUnchanged ? "IDENTICAL" : "MUTATED"})
                  </span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">Settled Receipt Count</span>
                  <span className="kv-val">
                    {activeReport.beforeSettledCount} → {activeReport.afterSettledCount}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Right: Exact Compact Circuit Guard + Mutation Proof + Step Trace */}
        <section className="card private-zone">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Terminal size={16} color="#f59e0b" />
                Compact Guard &amp; Mutation-Test Proof
              </h2>
              <p className="card-subtitle">
                Exact <span className="mono">contracts/proofvault.compact</span> v2.1 assertion and compiled guard-deletion proof.
              </p>
            </div>
            <span className="badge amber">{activeScenario.compactGuardId}</span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginBottom: 6 }} className="mono">
              COMPACT 0.28.0 ASSERTION (contracts/proofvault.compact)
            </div>
            <pre className="code-box" style={{ maxHeight: 110, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {activeScenario.compactAssertion}
            </pre>
          </div>

          <div
            style={{
              padding: "11px 13px",
              borderRadius: 9,
              background: "rgba(52, 211, 153, 0.08)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              marginBottom: 14
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "#34d399", marginBottom: 4 }}>
              Compiled Runtime Guard-Mutation Proof (tests/mutation-audit.test.ts)
            </div>
            <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>
              {activeScenario.mutationProof}
            </div>
          </div>

          {activeReport && activeReport.steps.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", marginBottom: 8 }}>
                Live Circuit Constraint Execution Trace
              </div>
              <div className="pipeline-list">
                {activeReport.steps.map((step) => (
                  <div key={`${step.id}-${step.status}`} className={`pipeline-step ${step.status}`}>
                    {step.status === "passed" ? (
                      <CheckCircle2 size={14} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                    ) : (
                      <XCircle size={14} color="#fb7185" style={{ marginTop: 2, flexShrink: 0 }} />
                    )}
                    <div className="step-body">
                      <div className="step-head">
                        <span>{step.stage}</span>
                        <span className="mono" style={{ fontSize: 11, color: "#94a3b8" }}>
                          {step.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="step-constraint">{step.circuitConstraint}</div>
                      <div className="step-detail">{step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
