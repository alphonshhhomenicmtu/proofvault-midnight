import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  XCircle
} from "lucide-react";
import {
  DisclosureTier,
  type ExportedAuditPackage,
  type PublicLedgerSnapshot
} from "../midnight/types";
import {
  deriveDeterministicSaltHex,
  verifyAuditPackageAgainstLedger
} from "../midnight/proofEngine";
import {
  DEFAULT_AUDITOR_VIEWING_KEY,
  formatUsdFromCents,
  truncateHex
} from "../midnight/presets";

interface AuditTabProps {
  ledger: PublicLedgerSnapshot;
  selectedReceiptId: string | null;
  onSelectReceipt: (receiptId: string) => void;
  buildExportPackage: (receiptId: string) => ExportedAuditPackage | null;
}

export function AuditTab({
  ledger,
  selectedReceiptId,
  onSelectReceipt,
  buildExportPackage
}: AuditTabProps) {
  const activeReceiptId = selectedReceiptId ?? ledger.auditReceipts[0]?.receiptId ?? null;
  const [auditorKeyInput, setAuditorKeyInput] = useState(DEFAULT_AUDITOR_VIEWING_KEY);
  const [rawPackageJson, setRawPackageJson] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activeReceiptId) {
      setRawPackageJson("");
      return;
    }
    const pkg = buildExportPackage(activeReceiptId);
    if (pkg) {
      setRawPackageJson(JSON.stringify(pkg, null, 2));
    }
  }, [activeReceiptId, buildExportPackage, ledger.settledInvoiceCount]);

  const verification = useMemo(() => {
    if (!rawPackageJson.trim()) return null;
    return verifyAuditPackageAgainstLedger(rawPackageJson, ledger, auditorKeyInput);
  }, [rawPackageJson, ledger, auditorKeyInput]);

  const handleCopyJson = async () => {
    if (!rawPackageJson) return;
    await navigator.clipboard?.writeText(rawPackageJson).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadJson = () => {
    if (!rawPackageJson || !activeReceiptId) return;
    const blob = new Blob([rawPackageJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofvault-receipt-${activeReceiptId.slice(0, 12)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateTamper = () => {
    try {
      const parsed = JSON.parse(rawPackageJson) as ExportedAuditPackage;
      parsed.receipt.budgetTierCapCents = parsed.receipt.budgetTierCapCents + 5_000_000;
      setRawPackageJson(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore invalid JSON
    }
  };

  const handleRestoreClean = () => {
    if (!activeReceiptId) return;
    const pkg = buildExportPackage(activeReceiptId);
    if (pkg) setRawPackageJson(JSON.stringify(pkg, null, 2));
  };

  return (
    <div>
      {/* 3-Column Selective Disclosure Matrix */}
      <div className="three-col" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="badge cyan" style={{ marginBottom: 8 }}>PUBLIC LEDGER SEES</div>
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
            Receipt ID, budget tier ceiling, HistoricMerkleTree root, spent anti-replay nullifier, epoch, and disclosure tier.
          </div>
        </div>
        <div className="card">
          <div className="badge emerald" style={{ marginBottom: 8 }}>SCOPED AUDITOR VERIFIES</div>
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
            Cryptographic <span className="mono">auditorTag</span> binding proving the receipt belongs to their oversight scope, plus immutable on-chain solvency &amp; jurisdiction checks.
          </div>
        </div>
        <div className="card">
          <div className="badge amber" style={{ marginBottom: 8 }}>PERMANENTLY SHIELDED</div>
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
            Counterparty identity, confidential invoice line items, exact payout amount, exact DAO treasury balance, and exact ISO country code.
          </div>
        </div>
      </div>

      <div className="two-col-weighted">
        {/* Left: On-Chain Receipt Registry */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <FileCheck2 size={16} color="#38bdf8" />
                On-Chain Audit Receipts ({ledger.auditReceipts.length})
              </h2>
              <p className="card-subtitle">
                Indexed directly from <span className="mono">auditReceipts: Map&lt;Bytes&lt;32&gt;, AuditReceipt&gt;</span>. Select a receipt to run independent auditor verification.
              </p>
            </div>
          </div>

          <div className="receipt-list">
            {ledger.auditReceipts.map((r) => {
              const isSelected = r.receiptId === activeReceiptId;
              return (
                <button
                  key={r.receiptId}
                  type="button"
                  className={`receipt-item ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectReceipt(r.receiptId)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "#38bdf8" }}>
                      0x{truncateHex(r.receiptId, 12, 10)}
                    </span>
                    <span
                      className={`badge ${
                        r.disclosureTier === DisclosureTier.AuditorScoped
                          ? "emerald"
                          : r.disclosureTier === DisclosureTier.ThresholdBand
                            ? "cyan"
                            : "amber"
                      }`}
                    >
                      {DisclosureTier[r.disclosureTier]}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12.5, marginBottom: 5 }}>
                    <span style={{ color: "#e2e8f0" }}>
                      Budget Cap &le; <strong>{formatUsdFromCents(r.budgetTierCapCents)}</strong>
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: "#94a3b8" }}>
                      Epoch #{r.settledEpoch}
                    </span>
                  </div>

                  <div className="mono" style={{ fontSize: 11, color: "#64748b" }}>
                    Nullifier: 0x{truncateHex(r.nullifier, 12, 10)}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: Independent Auditor Verification Workbench */}
        <section className="card public-zone">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <ShieldCheck size={16} color="#34d399" />
                Independent Selective-Disclosure Verifier
              </h2>
              <p className="card-subtitle">
                Auditors or DAO delegates paste any exported JSON receipt package to verify zero-knowledge compliance against the public Midnight ledger.
              </p>
            </div>
            {verification && (
              <span className={`badge ${verification.valid ? "emerald" : "rose"}`}>
                {verification.valid ? "7/7 CHECKS PASSED" : "VERIFICATION FAILED"}
              </span>
            )}
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label htmlFor="auditor-key-input">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <KeyRound size={13} color="#34d399" />
                Auditor Viewing Key (Optional — required for AuditorScoped check)
              </span>
            </label>
            <input
              id="auditor-key-input"
              className="input mono"
              value={auditorKeyInput}
              onChange={(e) => setAuditorKeyInput(e.target.value)}
              placeholder="64-character hex viewing key"
            />
            <div className="pill-row" style={{ marginTop: 4 }}>
              <button
                type="button"
                className="btn sm ghost"
                onClick={() => setAuditorKeyInput(DEFAULT_AUDITOR_VIEWING_KEY)}
              >
                Use Authorized Auditor Key
              </button>
              <button
                type="button"
                className="btn sm danger"
                onClick={() => setAuditorKeyInput(deriveDeterministicSaltHex("unauthorized-auditor"))}
              >
                Test Wrong Auditor Key
              </button>
              <button type="button" className="btn sm danger" onClick={handleSimulateTamper}>
                <ShieldAlert size={13} />
                Simulate Tampered Cap
              </button>
              <button type="button" className="btn sm ghost" onClick={handleRestoreClean}>
                Restore Clean Receipt
              </button>
            </div>
          </div>

          {verification && (
            <div className="pipeline-list" style={{ marginBottom: 14 }}>
              {verification.checks.map((chk) => (
                <div key={chk.name} className={`pipeline-step ${chk.passed ? "passed" : "failed"}`}>
                  {chk.passed ? (
                    <CheckCircle2 size={15} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                  ) : (
                    <XCircle size={15} color="#fb7185" style={{ marginTop: 2, flexShrink: 0 }} />
                  )}
                  <div className="step-body">
                    <div className="step-head">{chk.name}</div>
                    <div className="step-detail">{chk.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="field">
            <label htmlFor="receipt-json-editor">
              <span>Exportable Selective-Disclosure Receipt JSON (Zero Private PII)</span>
              <span style={{ display: "inline-flex", gap: 6 }}>
                <button type="button" className="btn sm ghost" onClick={handleCopyJson}>
                  <Copy size={12} />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" className="btn sm" onClick={handleDownloadJson}>
                  <Download size={12} />
                  Export JSON
                </button>
              </span>
            </label>
            <textarea
              id="receipt-json-editor"
              className="textarea"
              rows={11}
              value={rawPackageJson}
              onChange={(e) => setRawPackageJson(e.target.value)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
