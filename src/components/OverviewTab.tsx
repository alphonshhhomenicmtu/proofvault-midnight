import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
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
import type { ActiveTab } from "../App";

interface OverviewTabProps {
  ledger: PublicLedgerSnapshot;
  privateVault: PrivateWitnessVault;
  lastSolvency: SolvencyAttestation | null;
  onProveSolvency: (claimedMinFloorCents: number) => void;
  onNavigateTab: (tab: ActiveTab) => void;
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
            <span>Shielded Treasury (Simulator)</span>
            <Lock size={13} color="#f59e0b" />
          </div>
          <div className="kpi-value" style={{ color: "#fbbf24" }}>
            {revealPrivate ? formatUsdFromCents(privateVault.treasuryBalanceCents) : "$•,•••,•••.••"}
          </div>
          <div className="kpi-foot">Private witness — SHA-256 here; native persistentCommit in Compact</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Public Reserve Floor</span>
            <ShieldCheck size={13} color="#34d399" />
          </div>
          <div className="kpi-value">{formatUsdFromCents(ledger.policyMinReserveFloorCents)}</div>
          <div className="kpi-foot">
            Governance max cap: {formatUsdFromCents(ledger.policyMaxSingleSettlementCents)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Settled Audit Receipts</span>
            <CheckCircle2 size={13} color="#38bdf8" />
          </div>
          <div className="kpi-value">{ledger.settledInvoiceCount}</div>
          <div className="kpi-foot">
            {ledger.usedInvoiceNullifiers.length} secret-keyed nullifiers · Epoch #{ledger.currentEpoch}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Compliant Jurisdictions</span>
            <Globe size={13} color="#38bdf8" />
          </div>
          <div className="kpi-value">{ledger.approvedJurisdictions.length}</div>
          <div className="kpi-foot">
            HistoricMerkleTree&lt;8&gt; · {ledger.approvedJurisdictionsHistory.length} historic roots
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
                Private Off-Chain Witness Vault (Operator View)
              </h2>
              <p className="card-subtitle">
                Private witnesses held on the treasury operator&apos;s device. The operator sees cleartext; Midnight&apos;s Compact compiler blocks these witnesses from public state outside explicit <span className="mono">disclose()</span> sites.
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
              <span className="kv-key">nullifierBlindingSalt (derived)</span>
              <span className="kv-val">
                {revealPrivate ? `0x${truncateHex(privateVault.nullifierBlindingSaltHex, 14, 12)}` : "0x••••••••••••••••••••"}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">auditorViewingKeyHash()</span>
              <span className="kv-val">
                {revealPrivate ? `0x${truncateHex(privateVault.auditorViewingKeyHashHex, 14, 12)}` : "0x••••••••••••••••••••"}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn primary" onClick={() => onNavigateTab("settle")}>
              Settle Confidential Invoice →
            </button>
            <button type="button" className="btn danger" onClick={() => onNavigateTab("breaker")}>
              <Flame size={14} />
              Launch Adversarial Breaker Lab
            </button>
          </div>
        </section>

        {/* Right: Public Ledger State */}
        <section className="card public-zone">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <ShieldCheck size={16} color="#38bdf8" />
                Public Ledger State (Simulator Mirror of v2.1)
              </h2>
              <p className="card-subtitle">
                Public commitments, Merkle root, registered auditor commitment, persisted solvency record, and keyed nullifiers. Use <span className="mono">Audit Portal</span> to read the live Midnight Preview contract.
              </p>
            </div>
            <span className={`badge ${ledger.vaultStatus === VaultStatus.Active ? "emerald" : "rose"}`}>
              {ledger.vaultStatus === VaultStatus.Active ? "VAULT ACTIVE" : "VAULT PAUSED"}
            </span>
          </div>

          <div className="kv-list">
            <div className="kv-row">
              <span className="kv-key">Simulator Contract ID</span>
              <span className="kv-val">0x{truncateHex(ledger.contractAddress, 14, 12)}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">treasuryBalanceCommitment</span>
              <span className="kv-val" style={{ color: "#38bdf8" }}>
                0x{truncateHex(ledger.treasuryBalanceCommitment, 14, 12)}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">authorizedAuditorCommitment</span>
              <span className="kv-val">0x{truncateHex(ledger.authorizedAuditorCommitment, 14, 12)}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">lastSolvencyAttestation</span>
              <span className="kv-val" style={{ color: "#34d399" }}>
                {ledger.lastSolvencyFloorCents > 0
                  ? `>= ${formatUsdFromCents(ledger.lastSolvencyFloorCents)} (Epoch #${ledger.lastSolvencyEpoch})`
                  : "None attested yet"}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">approvedJurisdictions.root()</span>
              <span className="kv-val">0x{truncateHex(ledger.approvedJurisdictionsRoot, 14, 12)}</span>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <span className="badge cyan">Compact {ledger.compactLanguageVersion} · {ledger.zkirVersion}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn sm" onClick={() => onNavigateTab("audit")}>
                Live Preview Indexer
              </button>
              <button type="button" className="btn sm ghost" onClick={() => onNavigateTab("spec")}>
                Compact Source →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Interactive Solvency Proof Panel */}
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <ShieldCheck size={16} color="#34d399" />
              Authenticated Treasury Solvency Attestation — <span className="mono">proveTreasurySolvency()</span>
            </h2>
            <p className="card-subtitle">
              Requires private <span className="mono">operatorSecretKey()</span> witness, verifies committed balance against governance and requested floors, and persists <span className="mono">lastSolvencyAttestation</span> + <span className="mono">lastSolvencyFloor</span> into ledger state.
            </p>
          </div>
          <span className="badge cyan">v2.1 CIRCUIT · 6,400 B ZKIR</span>
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
                      ? `Solvency Attested & Persisted: Balance >= ${formatUsdFromCents(lastSolvency.claimedMinFloorCents)}`
                      : `Proof Rejected (${lastSolvency.errorCode ?? "ERR_SOLVENCY"}): ${lastSolvency.error}`}
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
                    Click any threshold preset on the left to test operator authentication, commitment opening, and solvency floor checks in the SHA-256 simulator.
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
