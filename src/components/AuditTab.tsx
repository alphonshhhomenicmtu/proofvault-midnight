import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  Globe,
  KeyRound,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  XCircle
} from "lucide-react";
import {
  DisclosureTier,
  type ExportedAuditPackage,
  type LiveIndexerSnapshot,
  type PublicLedgerSnapshot,
  type WalletConnectionState
} from "../midnight/types";
import {
  deriveDeterministicSaltHex,
  verifyAuditPackageAgainstLedger
} from "../midnight/proofEngine";
import {
  MIDNIGHT_INDEXER_PRESETS,
  fetchLiveIndexerSnapshot
} from "../midnight/indexerClient";
import {
  DEFAULT_AUDITOR_VIEWING_KEY,
  formatUsdFromCents,
  truncateHex
} from "../midnight/presets";

interface AuditTabProps {
  ledger: PublicLedgerSnapshot;
  walletState: WalletConnectionState;
  selectedReceiptId: string | null;
  onSelectReceipt: (receiptId: string) => void;
  buildExportPackage: (receiptId: string) => ExportedAuditPackage | null;
}

export function AuditTab({
  ledger,
  walletState,
  selectedReceiptId,
  onSelectReceipt,
  buildExportPackage
}: AuditTabProps) {
  const activeReceiptId = selectedReceiptId ?? ledger.auditReceipts[0]?.receiptId ?? null;
  const [auditorKeyInput, setAuditorKeyInput] = useState(DEFAULT_AUDITOR_VIEWING_KEY);
  const [rawPackageJson, setRawPackageJson] = useState("");
  const [copied, setCopied] = useState(false);

  // Live Midnight Indexer GraphQL state
  const [indexerNetwork, setIndexerNetwork] = useState<"preview" | "preprod" | "custom">("preview");
  const [customEndpoint, setCustomEndpoint] = useState(
    walletState.serviceUris?.indexerUri ?? MIDNIGHT_INDEXER_PRESETS.preview.graphqlUri
  );
  const [contractQueryInput, setContractQueryInput] = useState(ledger.contractAddress);
  const [blockfrostProjectId, setBlockfrostProjectId] = useState("");
  const [indexerLoading, setIndexerLoading] = useState(false);
  const [liveSnapshot, setLiveSnapshot] = useState<LiveIndexerSnapshot | null>(null);

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

  const handleVerifyLiveOnChain = async () => {
    setIndexerLoading(true);
    try {
      const result = await fetchLiveIndexerSnapshot({
        network: indexerNetwork,
        endpointOverride: indexerNetwork === "custom" ? customEndpoint : undefined,
        contractAddress: contractQueryInput,
        blockfrostProjectId: indexerNetwork === "preprod" ? blockfrostProjectId : undefined
      });
      setLiveSnapshot(result);
    } finally {
      setIndexerLoading(false);
    }
  };

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

  const activeEndpointUrl =
    indexerNetwork === "custom"
      ? customEndpoint
      : MIDNIGHT_INDEXER_PRESETS[indexerNetwork].graphqlUri;

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

      {/* Live Walletless Midnight Indexer GraphQL Reader */}
      <section className="card public-zone" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Radio size={16} color="#38bdf8" />
              Live Midnight Indexer GraphQL State Reader (Walletless)
            </h2>
            <p className="card-subtitle">
              Query the live Midnight Ledger 9 Indexer GraphQL API directly from the browser with zero wallet and zero Docker to verify chain finality, Zswap root, and contract state readback.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan">ZERO-WALLET JUDGE UX</span>
            {liveSnapshot && (
              <span className={`badge ${liveSnapshot.ok ? "emerald" : "rose"}`}>
                {liveSnapshot.ok
                  ? `LIVE SYNCED · #${liveSnapshot.blockHeight?.toLocaleString()}`
                  : "ENDPOINT NOTICE"}
              </span>
            )}
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div className="field">
            <label htmlFor="indexer-network-select">
              <span>Midnight Indexer Target</span>
              <span className="mono" style={{ color: "#38bdf8" }}>GraphQL v4</span>
            </label>
            <select
              id="indexer-network-select"
              className="select"
              value={indexerNetwork}
              onChange={(e) => setIndexerNetwork(e.target.value as "preview" | "preprod" | "custom")}
            >
              <option value="preview">{MIDNIGHT_INDEXER_PRESETS.preview.label}</option>
              <option value="preprod">{MIDNIGHT_INDEXER_PRESETS.preprod.label}</option>
              <option value="custom">Custom / Lace Wallet Indexer URI</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="indexer-contract-input">
              <span>Contract Address to Inspect (Optional Hex)</span>
              <span className="mono" style={{ color: "#94a3b8" }}>contractAction(address)</span>
            </label>
            <input
              id="indexer-contract-input"
              className="input mono"
              value={contractQueryInput}
              onChange={(e) => setContractQueryInput(e.target.value)}
              placeholder="64-hex Midnight contract address (or leave blank for chain head)"
            />
          </div>

          {indexerNetwork === "preprod" && (
            <div className="field full">
              <label htmlFor="blockfrost-token-input">
                <span>Blockfrost Project ID (Required for Midnight Preprod post-2026-10-09 migration)</span>
                <span className="mono" style={{ color: "#f59e0b" }}>project_id header</span>
              </label>
              <input
                id="blockfrost-token-input"
                className="input mono"
                type="password"
                value={blockfrostProjectId}
                onChange={(e) => setBlockfrostProjectId(e.target.value)}
                placeholder="midnight_preprod_... (or switch to Midnight Preview for zero-auth public queries)"
              />
            </div>
          )}

          {indexerNetwork === "custom" && (
            <div className="field full">
              <label htmlFor="custom-endpoint-input">
                <span>Custom GraphQL Indexer Endpoint</span>
                <span className="mono" style={{ color: "#94a3b8" }}>POST /api/v4/graphql</span>
              </label>
              <input
                id="custom-endpoint-input"
                className="input mono"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://indexer.preview.midnight.network/api/v4/graphql"
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn primary"
              onClick={handleVerifyLiveOnChain}
              disabled={indexerLoading}
            >
              <RefreshCw size={14} className={indexerLoading ? "spin" : undefined} />
              {indexerLoading
                ? "Querying Live Midnight Indexer..."
                : "Verify Live On-Chain State (Midnight Indexer GraphQL)"}
            </button>
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => setContractQueryInput(ledger.contractAddress)}
            >
              Use Vault Address
            </button>
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => setContractQueryInput("")}
            >
              Chain Head Only
            </button>
          </div>
          <span className="mono" style={{ fontSize: 11.5, color: "#94a3b8" }}>
            Endpoint: {activeEndpointUrl}
          </span>
        </div>

        {liveSnapshot && (
          <div style={{ marginTop: 14 }}>
            {liveSnapshot.ok ? (
              <>
                <div className="kpi-grid" style={{ marginBottom: 12 }}>
                  <div className="kpi-card" style={{ background: "#080c14" }}>
                    <div className="kpi-label">
                      <span>Live Block Height</span>
                      <Globe size={13} color="#34d399" />
                    </div>
                    <div className="kpi-value" style={{ fontSize: 20, color: "#34d399" }}>
                      #{liveSnapshot.blockHeight?.toLocaleString() ?? "—"}
                    </div>
                    <div className="kpi-foot mono" style={{ fontSize: 11 }}>
                      Latency: {liveSnapshot.latencyMs}ms · Protocol {liveSnapshot.protocolVersion ?? "Ledger 9"}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ background: "#080c14" }}>
                    <div className="kpi-label">
                      <span>Block Hash</span>
                      <CheckCircle2 size={13} color="#38bdf8" />
                    </div>
                    <div className="kpi-value mono" style={{ fontSize: 14, color: "#38bdf8", marginTop: 12 }}>
                      0x{truncateHex(liveSnapshot.blockHash ?? "", 10, 8)}
                    </div>
                    <div className="kpi-foot mono" style={{ fontSize: 11 }}>
                      {liveSnapshot.blockTimestampIso ? liveSnapshot.blockTimestampIso.replace("T", " ").slice(0, 19) + " UTC" : "Live head"}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ background: "#080c14" }}>
                    <div className="kpi-label">
                      <span>Zswap Merkle Root</span>
                      <ShieldCheck size={13} color="#38bdf8" />
                    </div>
                    <div className="kpi-value mono" style={{ fontSize: 14, marginTop: 12 }}>
                      0x{truncateHex(liveSnapshot.zswapMerkleTreeRoot ?? "", 10, 8)}
                    </div>
                    <div className="kpi-foot mono" style={{ fontSize: 11 }}>
                      Verified live via GraphQL v4
                    </div>
                  </div>

                  <div className="kpi-card" style={{ background: "#080c14" }}>
                    <div className="kpi-label">
                      <span>Contract Readback</span>
                      <FileCheck2 size={13} color={liveSnapshot.contractFound ? "#34d399" : "#f59e0b"} />
                    </div>
                    <div
                      className="kpi-value"
                      style={{ fontSize: 16, marginTop: 10, color: liveSnapshot.contractFound ? "#34d399" : "#fbbf24" }}
                    >
                      {liveSnapshot.contractFound
                        ? `${liveSnapshot.contractActionType} (${liveSnapshot.contractStateBytes} B)`
                        : liveSnapshot.queriedContractAddress
                          ? "Local Simulator ID"
                          : "Chain Head Synced"}
                    </div>
                    <div className="kpi-foot" style={{ fontSize: 11 }}>
                      {liveSnapshot.contractFound
                        ? `Block #${liveSnapshot.contractBlockHeight}`
                        : `${ledger.auditReceipts.length} receipts · ${ledger.usedInvoiceNullifiers.length} nullifiers local`}
                    </div>
                  </div>
                </div>

                <div className="status-banner success" style={{ marginBottom: 0 }}>
                  <div style={{ minWidth: 0, fontSize: 12.5, lineHeight: 1.5 }}>
                    {liveSnapshot.contractFound ? (
                      <>
                        <strong>On-Chain Contract State Verified:</strong>{" "}
                        <span className="mono">0x{truncateHex(liveSnapshot.queriedContractAddress ?? "", 14, 10)}</span>{" "}
                        ({liveSnapshot.contractActionType}
                        {liveSnapshot.contractEntryPoint ? ` · ${liveSnapshot.contractEntryPoint}()` : ""}) at block #{liveSnapshot.contractBlockHeight}, tx{" "}
                        <span className="mono">0x{truncateHex(liveSnapshot.contractTxHash ?? "", 12, 8)}</span>.
                      </>
                    ) : (
                      <>
                        <strong>Live Midnight {liveSnapshot.network.toUpperCase()} Chain Verified at Block #{liveSnapshot.blockHeight?.toLocaleString()}:</strong>{" "}
                        {liveSnapshot.queriedContractAddress ? (
                          <>
                            Queried <span className="mono">0x{truncateHex(liveSnapshot.queriedContractAddress, 12, 8)}</span> via <span className="mono">contractAction()</span> — not yet broadcast on-chain (deploy manifest ready in <span className="mono">deploy/preview.json</span>; official faucet uses interactive Cloudflare Turnstile). Local ProofVault ledger state holds <span className="mono">{ledger.settledInvoiceCount}</span> settled receipts &amp; commitment <span className="mono">0x{truncateHex(ledger.treasuryBalanceCommitment, 10, 8)}</span>.
                          </>
                        ) : (
                          <>
                            Paste any deployed Midnight Preview contract address above to inspect its serialized on-chain state, or run <span className="mono">npm run verify:onchain</span> from CLI.
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {liveSnapshot.explorerBaseUrl && (
                    <a
                      href={liveSnapshot.explorerBaseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn sm"
                      style={{ textDecoration: "none", flexShrink: 0 }}
                    >
                      Explorer <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="status-banner error" style={{ marginBottom: 0 }}>
                <div style={{ minWidth: 0, fontSize: 12.5, lineHeight: 1.5 }}>
                  <strong>Indexer Query Notice:</strong> {liveSnapshot.error}
                  {liveSnapshot.migrationNotice && (
                    <div style={{ marginTop: 4, opacity: 0.92 }}>{liveSnapshot.migrationNotice}</div>
                  )}
                </div>
                <XCircle size={17} style={{ flexShrink: 0 }} />
              </div>
            )}
          </div>
        )}
      </section>

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
