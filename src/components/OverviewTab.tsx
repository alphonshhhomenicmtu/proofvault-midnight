import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  ShieldCheck,
  XCircle
} from "lucide-react";
import {
  VaultStatus,
  type PrivateWitnessVault,
  type PublicLedgerSnapshot,
  type SolvencyAttestation
} from "../midnight/types";
import { formatUsdFromCents, truncateHex } from "../midnight/presets";

interface OverviewTabProps {
  ledger: PublicLedgerSnapshot;
  privateVault: PrivateWitnessVault;
  lastSolvency: SolvencyAttestation | null;
  onProveSolvency: (claimedMinFloorCents: number) => void;
  onNavigateTab: (tab: "overview" | "settle" | "audit" | "spec") => void;
}

export function OverviewTab({
  ledger,
  privateVault,
  lastSolvency,
  onProveSolvency,
  onNavigateTab
}: OverviewTabProps) {
  const [revealPrivate, setRevealPrivate] = useState(true);
  const [claimedFloorUsd, setClaimedFloorUsd] = useState("2000000");

  const handleRunSolvency = () => {
    const parsed = Number(claimedFloorUsd.replace(/,/g, ""));
    const cents = Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
    onProveSolvency(cents);
  };

  return (
    <div>
      {/* KPI Overview Strip */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Shielded Treasury (Local)</span>
            <Lock size={13} color="#f59e0b" />
          </div>
          <div className="kpi-value" style={{ color: "#fbbf24" }}>
            {revealPrivate ? formatUsdFromCents(privateVault.treasuryBalanceCents) : "$•,•••,•••.••"}
          </div>
          <div className="kpi-foot">Private witness only — committed on-chain via SHA-256</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Public Reserve Floor</span>
            <ShieldCheck size={13} color="#34d399" />
          </div>
          <div className="kpi-value">{formatUsdFromCents(ledger.policyMinReserveFloorCents)}</div>
          <div className="kpi-foot">
            Max single cap: {formatUsdFromCents(ledger.policyMaxSingleSettlementCents)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Settled ZK Receipts</span>
            <CheckCircle2 size={13} color="#38bdf8" />
          </div>
          <div className="kpi-value">{ledger.settledInvoiceCount}</div>
          <div className="kpi-foot">
            {ledger.usedInvoiceNullifiers.length} anti-replay nullifiers locked · Epoch #{ledger.currentEpoch}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Compliant Jurisdictions</span>
            <Globe size={13} color="#38bdf8" />
          </div>
          <div className="kpi-value">{ledger.approvedJurisdictions.length}</div>
          <div className="kpi-foot">
            HistoricMerkleTree&lt;8&gt; · {ledger.approvedJurisdictionsHistory.length} valid roots
          </div>
        </div>
      </div>

      {/* Dual-Ledger Split View */}
      <div className="two-col" style={{ marginBottom: 18 }}>
        {/* Left: Private Off-Chain Witness Vault */}
        <section className="card private-zone">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <KeyRound size={16} color="#f59e0b" />
                Private Off-Chain Witness Vault
              </h2>
              <p className="card-subtitle">
                Held strictly inside the treasury operator&apos;s local Midnight witness state. Zero plaintext fields are ever broadcast on-chain.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge amber">OFF-CHAIN WITNESS</span>
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => setRevealPrivate((v) => !v)}
                title="Toggle local secret visibility"
              >
                {revealPrivate ? <EyeOff size={13} /> : <Eye size={13} />}
                {revealPrivate ? "Mask" : "Reveal"}
              </button>
            </div>
          </div>

          <div className="kv-list">
            <div className="kv-row">
              <span className="kv-key">treasurySecretBalance()</span>
              <span className="kv-val" style={{ color: "#fbbf24", fontWeight: 600 }}>
                {revealPrivate
                  ? `${formatUsdFromCents(privateVault.treasuryBalanceCents)} (${privateVault.treasuryBalanceCents.toLocaleString()} cents)`
                  : "••••••••••••••••"}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">treasuryBlindingFactor()</span>
              <span className="kv-val">
                {revealPrivate ? `0x${truncateHex(privateVault.treasuryBlindingFactorHex, 14, 12)}` : "0x••••••••••••••••••••"}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">operatorSecretKey()</span>
              <span className="kv-val">
                {revealPrivate ? `0x${truncateHex(privateVault.operatorSecretKeyHex, 14, 12)}` : "0x••••••••••••••••••••"}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">auditorViewingKeyHash()</span>
              <span className="kv-val">
                {revealPrivate ? `0x${truncateHex(privateVault.auditorViewingKeyHashHex, 14, 12)}` : "0x••••••••••••••••••••"}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Confidential Counterparties</span>
              <span className="kv-val" style={{ color: "#34d399" }}>
                Shielded in local memory · Redacted from ledger
              </span>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn primary" onClick={() => onNavigateTab("settle")}>
              Launch Confidential Settlement →
            </button>
            <button type="button" className="btn" onClick={() => onNavigateTab("audit")}>
              Open Selective-Disclosure Portal
            </button>
          </div>
        </section>

        {/* Right: Public Midnight On-Chain Ledger */}
        <section className="card public-zone">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <ShieldCheck size={16} color="#38bdf8" />
                Public Midnight Ledger State
              </h2>
              <p className="card-subtitle">
                Verifiable on-chain commitments, Merkle roots, governance limits, and anti-replay nullifiers published by <span className="mono">proofvault.compact</span>.
              </p>
            </div>
            <span className={`badge ${ledger.vaultStatus === VaultStatus.Active ? "emerald" : "rose"}`}>
              {ledger.vaultStatus === VaultStatus.Active ? "VAULT ACTIVE" : "VAULT PAUSED"}
            </span>
          </div>

          <div className="kv-list">
            <div className="kv-row">
              <span className="kv-key">Contract Address</span>
              <span className="kv-val">0x{truncateHex(ledger.contractAddress, 14, 12)}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">treasuryBalanceCommitment</span>
              <span className="kv-val" style={{ color: "#38bdf8" }}>
                0x{truncateHex(ledger.treasuryBalanceCommitment, 14, 12)}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">treasuryAuthority (pk)</span>
              <span className="kv-val">0x{truncateHex(ledger.treasuryAuthority, 14, 12)}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">approvedJurisdictions.root()</span>
              <span className="kv-val">0x{truncateHex(ledger.approvedJurisdictionsRoot, 14, 12)}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Governance Policy (Epoch #{ledger.currentEpoch})</span>
              <span className="kv-val">
                Max {formatUsdFromCents(ledger.policyMaxSingleSettlementCents)} · Floor{" "}
                {formatUsdFromCents(ledger.policyMinReserveFloorCents)}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <span className="badge cyan">Compact {ledger.compactLanguageVersion} · {ledger.zkirVersion}</span>
            <button type="button" className="btn sm" onClick={() => onNavigateTab("spec")}>
              Inspect Compiled Circuits &amp; Merkle Tree →
            </button>
          </div>
        </section>
      </div>

      {/* Interactive Solvency Proof Panel */}
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <ShieldCheck size={16} color="#34d399" />
              Zero-Knowledge Treasury Solvency Attestation — <span className="mono">proveTreasurySolvency()</span>
            </h2>
            <p className="card-subtitle">
              Prove to DAO governance, lenders, or institutional auditors that shielded treasury reserves exceed any chosen floor without revealing the actual balance.
            </p>
          </div>
          <span className="badge cyan">ZK CIRCUIT · 3,879 B ZKIR</span>
        </div>

        <div className="two-col-weighted">
          <div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="solvency-floor-input">
                <span>Requested Solvency Floor to Prove (USD)</span>
                <span className="mono" style={{ color: "#94a3b8" }}>public circuit input: claimedMinFloor</span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="solvency-floor-input"
                  className="input mono"
                  type="text"
                  value={claimedFloorUsd}
                  onChange={(e) => setClaimedFloorUsd(e.target.value)}
                  placeholder="2000000"
                />
                <button type="button" className="btn primary" onClick={handleRunSolvency}>
                  Prove Solvency
                </button>
              </div>
            </div>

            <div className="pill-row">
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => {
                  setClaimedFloorUsd("1000000");
                  onProveSolvency(100_000_000);
                }}
              >
                Prove &ge; $1,000,000
              </button>
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => {
                  setClaimedFloorUsd("2000000");
                  onProveSolvency(200_000_000);
                }}
              >
                Prove &ge; $2,000,000
              </button>
              <button
                type="button"
                className="btn sm danger"
                onClick={() => {
                  setClaimedFloorUsd("3000000");
                  onProveSolvency(300_000_000);
                }}
              >
                Test False Claim (&ge; $3,000,000)
              </button>
            </div>

            {lastSolvency && (
              <div
                className={`status-banner ${lastSolvency.ok ? "success" : "error"}`}
                style={{ marginTop: 14, marginBottom: 0 }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {lastSolvency.ok
                      ? `ZK Solvency Proven: Shielded Balance >= ${formatUsdFromCents(lastSolvency.claimedMinFloorCents)}`
                      : `ZK Proof Rejected: ${lastSolvency.error}`}
                  </div>
                  {lastSolvency.attestationDigest && (
                    <div className="mono-wrap" style={{ fontSize: 11.5, opacity: 0.92 }}>
                      Attestation Digest: 0x{lastSolvency.attestationDigest}
                    </div>
                  )}
                </div>
                {lastSolvency.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </div>
            )}
          </div>

          <div className="pipeline-list">
            {(lastSolvency?.steps ?? []).length === 0 ? (
              <div className="pipeline-step">
                <div className="step-body">
                  <div className="step-head">Ready to Execute proveTreasurySolvency</div>
                  <div className="step-detail">
                    Click any threshold preset on the left to open the shielded balance commitment locally and verify solvency constraints in zero knowledge.
                  </div>
                </div>
              </div>
            ) : (
              lastSolvency!.steps.map((step) => (
                <div key={step.id} className={`pipeline-step ${step.status}`}>
                  {step.status === "passed" ? (
                    <CheckCircle2 size={16} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                  ) : (
                    <XCircle size={16} color="#fb7185" style={{ marginTop: 2, flexShrink: 0 }} />
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
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
