import { useState } from "react";
import {
  CheckCircle2,
  Code2,
  Copy,
  Globe,
  PauseCircle,
  PlayCircle,
  Plus,
  Settings2,
  ShieldCheck
} from "lucide-react";
import {
  COMPACT_COMPILER_METADATA,
  COMPACT_CONTRACT_SOURCE,
  COMPILED_CIRCUIT_STATS
} from "../midnight/compactSource";
import { VaultStatus, type PublicLedgerSnapshot } from "../midnight/types";
import { formatUsdFromCents, truncateHex } from "../midnight/presets";

interface CompactSpecTabProps {
  ledger: PublicLedgerSnapshot;
  onAddJurisdiction: (code: string, label: string) => { ok: boolean; error?: string };
  onUpdatePolicy: (
    maxSettlementCents: number,
    minReserveFloorCents: number,
    status: VaultStatus
  ) => { ok: boolean; error?: string };
}

export function CompactSpecTab({
  ledger,
  onAddJurisdiction,
  onUpdatePolicy
}: CompactSpecTabProps) {
  const [newCode, setNewCode] = useState("FR");
  const [newLabel, setNewLabel] = useState("France");
  const [jurisdictionFeedback, setJurisdictionFeedback] = useState<string | null>(null);
  const [maxUsd, setMaxUsd] = useState((ledger.policyMaxSingleSettlementCents / 100).toString());
  const [floorUsd, setFloorUsd] = useState((ledger.policyMinReserveFloorCents / 100).toString());
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);
  const [copiedSource, setCopiedSource] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onAddJurisdiction(newCode, newLabel);
    if (res.ok) {
      setJurisdictionFeedback(`Registered ${newCode.toUpperCase()} into HistoricMerkleTree<8>. Root updated.`);
      setNewCode("");
      setNewLabel("");
    } else {
      setJurisdictionFeedback(res.error ?? "Failed to register jurisdiction.");
    }
  };

  const handleSavePolicy = (targetStatus: VaultStatus) => {
    const maxCents = Math.round(Number(maxUsd.replace(/,/g, "")) * 100);
    const floorCents = Math.round(Number(floorUsd.replace(/,/g, "")) * 100);
    const res = onUpdatePolicy(maxCents, floorCents, targetStatus);
    if (res.ok) {
      setPolicyFeedback(
        `Policy rotated to Epoch #${ledger.currentEpoch + 1} (${VaultStatus[targetStatus]}).`
      );
    } else {
      setPolicyFeedback(res.error ?? "Policy update rejected.");
    }
  };

  const handleCopyContract = async () => {
    await navigator.clipboard?.writeText(COMPACT_CONTRACT_SOURCE).catch(() => {});
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 1800);
  };

  return (
    <div>
      {/* Compiled Toolchain Verification Strip */}
      <section className="card public-zone" style={{ marginBottom: 18 }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <div>
            <h2 className="card-title">
              <ShieldCheck size={16} color="#34d399" />
              Compiled Compact 0.28.0 v2.1 Contract &amp; ZKIR Artifacts
            </h2>
            <p className="card-subtitle">
              Compiled with <span className="mono">compactc 0.36.1</span> (<span className="mono">compact compile contracts/proofvault.compact contracts/managed/proofvault</span>). Exercised directly via <span className="mono">@midnight-ntwrk/compact-runtime@0.21.0</span> in <span className="mono">npm test</span>.
            </p>
          </div>
          <span className="badge emerald">
            <CheckCircle2 size={12} />
            5/5 CIRCUITS · {COMPACT_COMPILER_METADATA.auditedAssertGuards} GUARDS
          </span>
        </div>

        <div className="pill-row" style={{ marginBottom: 14 }}>
          <span className="badge cyan">compactc {COMPACT_COMPILER_METADATA.compilerVersion}</span>
          <span className="badge cyan">language_version {COMPACT_COMPILER_METADATA.languageVersion}</span>
          <span className="badge cyan">{COMPACT_COMPILER_METADATA.ledgerTarget}</span>
          <span className="badge">{COMPACT_COMPILER_METADATA.runtimePackage}</span>
          <span className="badge">{COMPACT_COMPILER_METADATA.connectorPackage}</span>
          <span className="badge emerald">License: {COMPACT_COMPILER_METADATA.license}</span>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exported Circuit</th>
                <th>ZKIR / BZKIR</th>
                <th>Verifier Key</th>
                <th>Prover Key</th>
                <th>Privacy &amp; Ledger Responsibility</th>
              </tr>
            </thead>
            <tbody>
              {COMPILED_CIRCUIT_STATS.map((c) => (
                <tr key={c.name}>
                  <td className="mono" style={{ color: "#38bdf8", fontWeight: 600 }}>
                    {c.name}()
                  </td>
                  <td className="mono" style={{ whiteSpace: "nowrap" }}>
                    {c.zkirBytes.toLocaleString()} B / {c.bzkirBytes.toLocaleString()} B
                  </td>
                  <td className="mono" style={{ whiteSpace: "nowrap" }}>
                    {c.verifierKeyBytes.toLocaleString()} B
                  </td>
                  <td className="mono" style={{ whiteSpace: "nowrap" }}>
                    {c.proverKeyMb}
                  </td>
                  <td style={{ color: "#cbd5e1", lineHeight: 1.45 }}>{c.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Governance & HistoricMerkleTree Controls */}
      <div className="two-col" style={{ marginBottom: 18 }}>
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Globe size={16} color="#38bdf8" />
                Compliance Merkle Registry (Simulator)
              </h2>
              <p className="card-subtitle">
                Circuit <span className="mono">registerApprovedJurisdiction()</span> appends compliant ISO digests to <span className="mono">HistoricMerkleTree&lt;8, Bytes&lt;32&gt;&gt;</span> (append-only in v2.1; historical roots remain valid for async proving).
              </p>
            </div>
            <span className="badge cyan">{ledger.approvedJurisdictions.length} / 256 LEAVES</span>
          </div>

          <div className="pill-row" style={{ marginBottom: 14 }}>
            {ledger.approvedJurisdictions.map((j) => (
              <div key={j.code} className="jurisdiction-chip">
                <strong className="mono" style={{ color: "#34d399" }}>
                  {j.code}
                </strong>
                <span style={{ color: "#cbd5e1" }}>{j.label}</span>
                <span className="mono" style={{ fontSize: 11, color: "#64748b" }}>
                  #{j.leafIndex}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="input mono"
              style={{ width: 92 }}
              placeholder="ISO (FR)"
              maxLength={3}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              required
            />
            <input
              className="input"
              style={{ flex: 1, minWidth: 160 }}
              placeholder="Country / Jurisdiction name"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              required
            />
            <button type="submit" className="btn primary">
              <Plus size={14} />
              Insert Leaf
            </button>
          </form>

          {jurisdictionFeedback && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#38bdf8" }} className="mono">
              {jurisdictionFeedback}
            </div>
          )}

          <div className="kv-row" style={{ marginTop: 12 }}>
            <span className="kv-key">Current Merkle Root</span>
            <span className="kv-val">0x{truncateHex(ledger.approvedJurisdictionsRoot, 16, 12)}</span>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Settings2 size={16} color="#f59e0b" />
                Governance Policy &amp; Circuit Breaker
              </h2>
              <p className="card-subtitle">
                Circuit <span className="mono">updateGovernancePolicy()</span> requires private <span className="mono">operatorSecretKey()</span> witness and increments <span className="mono">currentEpoch</span>.
              </p>
            </div>
            <span className={`badge ${ledger.vaultStatus === VaultStatus.Active ? "emerald" : "rose"}`}>
              Epoch #{ledger.currentEpoch} · {VaultStatus[ledger.vaultStatus]}
            </span>
          </div>

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label htmlFor="gov-max">Max Single Settlement (USD)</label>
              <input
                id="gov-max"
                className="input mono"
                type="number"
                value={maxUsd}
                onChange={(e) => setMaxUsd(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="gov-floor">Minimum Reserve Floor (USD)</label>
              <input
                id="gov-floor"
                className="input mono"
                type="number"
                value={floorUsd}
                onChange={(e) => setFloorUsd(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn primary"
              onClick={() => handleSavePolicy(ledger.vaultStatus)}
            >
              Rotate Policy Limits
            </button>
            {ledger.vaultStatus === VaultStatus.Active ? (
              <button
                type="button"
                className="btn danger"
                onClick={() => handleSavePolicy(VaultStatus.Paused)}
              >
                <PauseCircle size={15} />
                Pause Vault (Circuit Breaker)
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => handleSavePolicy(VaultStatus.Active)}
              >
                <PlayCircle size={15} />
                Resume Vault
              </button>
            )}
          </div>

          {policyFeedback && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#34d399" }} className="mono">
              {policyFeedback}
            </div>
          )}

          <div className="kv-row" style={{ marginTop: 12 }}>
            <span className="kv-key">Active Guardrails</span>
            <span className="kv-val">
              Ceiling {formatUsdFromCents(ledger.policyMaxSingleSettlementCents)} · Floor{" "}
              {formatUsdFromCents(ledger.policyMinReserveFloorCents)}
            </span>
          </div>
        </section>
      </div>

      {/* Compact Source Code Viewer */}
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Code2 size={16} color="#38bdf8" />
              contracts/proofvault.compact (v2.1 · SHA-256 {COMPACT_COMPILER_METADATA.sourceSha256.slice(0, 12)}...)
            </h2>
            <p className="card-subtitle">
              Hardened Compact 0.28.0 contract source compiled with <span className="mono">compactc 0.36.1</span> and tested directly on <span className="mono">@midnight-ntwrk/compact-runtime@0.21.0</span>.
            </p>
          </div>
          <button type="button" className="btn sm" onClick={handleCopyContract}>
            <Copy size={13} />
            {copiedSource ? "Copied Source" : "Copy Compact Source"}
          </button>
        </div>

        <pre className="code-box">{COMPACT_CONTRACT_SOURCE}</pre>
      </section>
    </div>
  );
}
