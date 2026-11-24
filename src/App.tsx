import { useCallback, useRef, useState } from "react";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import {
  Code2,
  FileCheck2,
  Flame,
  Layers,
  RotateCcw,
  Send,
  Shield,
  Wallet
} from "lucide-react";
import { createSeededProofVaultEngine } from "./midnight/presets";
import {
  executeAdversarialAttack,
  executeAllAdversarialAttacks
} from "./midnight/adversarialLab";
import {
  connectMidnightWallet,
  createDefaultWalletState,
  discoverMidnightWallets,
  dispatchWalletTransaction
} from "./midnight/walletAdapter";
import type {
  AdversarialAttackId,
  AdversarialAttackReport,
  InvoiceSettlementInput,
  InvoiceSettlementResult,
  MidnightNetworkId,
  SolvencyAttestation,
  VaultStatus,
  WalletConnectionState
} from "./midnight/types";
import { OverviewTab } from "./components/OverviewTab";
import { SettleTab } from "./components/SettleTab";
import { BreakerLabTab } from "./components/BreakerLabTab";
import { AuditTab } from "./components/AuditTab";
import { CompactSpecTab } from "./components/CompactSpecTab";

export type ActiveTab = "overview" | "settle" | "breaker" | "audit" | "spec";

export function App() {
  const engineRef = useRef(createSeededProofVaultEngine());
  const connectedApiRef = useRef<ConnectedAPI | undefined>(undefined);
  const [revision, setRevision] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [lastSolvency, setLastSolvency] = useState<SolvencyAttestation | null>(() =>
    engineRef.current.proveTreasurySolvency(200_000_000)
  );
  const [lastSettlement, setLastSettlement] = useState<InvoiceSettlementResult | null>(null);
  const [breakerReports, setBreakerReports] = useState<Record<string, AdversarialAttackReport>>({});
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [walletState, setWalletState] = useState<WalletConnectionState>(() =>
    createDefaultWalletState()
  );
  const [networkId, setNetworkId] = useState<MidnightNetworkId>("preview");
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [dispatchingWallet, setDispatchingWallet] = useState(false);

  // Force clean snapshot read whenever engine state mutates
  void revision;
  const ledger = engineRef.current.getPublicLedger();
  const privateVault = engineRef.current.getPrivateWitnessVault();

  const bump = useCallback(() => setRevision((n) => n + 1), []);

  const handleProveSolvency = useCallback(
    (claimedMinFloorCents: number) => {
      const result = engineRef.current.proveTreasurySolvency(claimedMinFloorCents);
      setLastSolvency(result);
      if (result.ok) bump();
    },
    [bump]
  );

  const handleSettle = useCallback(
    (input: InvoiceSettlementInput) => {
      const result = engineRef.current.settleConfidentialInvoice(input);
      setLastSettlement(result);
      if (result.ok && result.receipt) {
        setSelectedReceiptId(result.receipt.receiptId);
        bump();
      }
    },
    [bump]
  );

  const handleRunAttack = useCallback((attackId: AdversarialAttackId) => {
    const report = executeAdversarialAttack(engineRef.current, attackId);
    setBreakerReports((prev) => ({ ...prev, [attackId]: report }));
    return report;
  }, []);

  const handleRunAllAttacks = useCallback(() => {
    const all = executeAllAdversarialAttacks(engineRef.current);
    const map: Record<string, AdversarialAttackReport> = {};
    for (const r of all) {
      map[r.attackId] = r;
    }
    setBreakerReports(map);
    return all;
  }, []);

  const handleDispatchLastSettlement = useCallback(async () => {
    if (!lastSettlement?.ok || !lastSettlement.receipt || !connectedApiRef.current) {
      return;
    }
    setDispatchingWallet(true);
    try {
      const dispatch = await dispatchWalletTransaction(connectedApiRef.current, {
        circuitName: "settleConfidentialInvoice",
        walletName: walletState.walletName ?? "Midnight Wallet",
        networkId: walletState.networkId,
        proverServerUri: walletState.serviceUris?.proverServerUri,
        commitmentPayloadHex: lastSettlement.receipt.receiptId
      });
      setLastSettlement((prev) => (prev ? { ...prev, walletDispatch: dispatch } : prev));
      setWalletState((prev) => ({ ...prev, lastDispatch: dispatch }));
    } finally {
      setDispatchingWallet(false);
    }
  }, [lastSettlement, walletState]);

  const handleAddJurisdiction = useCallback(
    (code: string, label: string) => {
      const res = engineRef.current.registerApprovedJurisdiction(code, label);
      if (res.ok) bump();
      return res;
    },
    [bump]
  );

  const handleUpdatePolicy = useCallback(
    (maxCents: number, floorCents: number, status: VaultStatus) => {
      const res = engineRef.current.updateGovernancePolicy(maxCents, floorCents, status);
      if (res.ok) bump();
      return res;
    },
    [bump]
  );

  const handleResetDemo = useCallback(() => {
    engineRef.current = createSeededProofVaultEngine();
    setLastSettlement(null);
    setBreakerReports({});
    setSelectedReceiptId(null);
    setLastSolvency(engineRef.current.proveTreasurySolvency(200_000_000));
    bump();
  }, [bump]);

  const handleConnectWallet = useCallback(async () => {
    setConnectingWallet(true);
    try {
      const discovered = discoverMidnightWallets();
      const { state, connectedApi } = await connectMidnightWallet(discovered[0]?.key, networkId);
      connectedApiRef.current = connectedApi;
      setWalletState(state);
    } finally {
      setConnectingWallet(false);
    }
  }, [networkId]);

  const buildExportPackage = useCallback(
    (receiptId: string) => engineRef.current.buildExportedAuditPackage(receiptId),
    []
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">
              <Shield size={19} />
            </div>
            <div>
              <div className="brand-title">
                <span>ProofVault</span>
                <span className="badge cyan">v2.1</span>
              </div>
              <div className="brand-sub">Midnight ZK Treasury</div>
            </div>
          </div>

          <nav className="nav-tabs" aria-label="Primary workspaces">
            <button
              type="button"
              className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Layers size={14} />
              Overview
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === "settle" ? "active" : ""}`}
              onClick={() => setActiveTab("settle")}
            >
              <Send size={14} />
              Settle Invoice
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === "breaker" ? "active" : ""}`}
              onClick={() => setActiveTab("breaker")}
            >
              <Flame size={14} color={activeTab === "breaker" ? "#fb7185" : undefined} />
              Breaker Lab
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === "audit" ? "active" : ""}`}
              onClick={() => setActiveTab("audit")}
            >
              <FileCheck2 size={14} />
              Audit Portal
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === "spec" ? "active" : ""}`}
              onClick={() => setActiveTab("spec")}
            >
              <Code2 size={14} />
              Compact Spec
            </button>
          </nav>

          <div className="wallet-controls">
            <select
              aria-label="Midnight network"
              className="select mono"
              style={{ width: 102, padding: "6px 8px", fontSize: 12 }}
              value={networkId}
              onChange={(e) => setNetworkId(e.target.value as MidnightNetworkId)}
            >
              <option value="preview">preview</option>
              <option value="preprod">preprod</option>
              <option value="mainnet">mainnet</option>
              <option value="undeployed">local-dev</option>
            </select>

            <span className={`mode-pill ${walletState.walletConnected ? "live" : "sim"}`}>
              <span className="dot" />
              {walletState.walletConnected
                ? `${walletState.walletName} (${walletState.networkId})`
                : "SHA-256 Simulator"}
            </span>

            <button
              type="button"
              className="btn sm"
              onClick={handleConnectWallet}
              disabled={connectingWallet}
            >
              <Wallet size={13} />
              {connectingWallet
                ? "Connecting..."
                : walletState.walletConnected
                  ? "Reconnect"
                  : "Connect Lace"}
            </button>

            <button
              type="button"
              className="btn sm ghost"
              onClick={handleResetDemo}
              title="Reset local simulator vault state"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="runtime-clarity-bar">
          <div>
            <strong style={{ color: "#38bdf8" }}>Browser Mode:</strong> SHA-256 Deterministic Circuit Simulator (zero-setup browser sandbox modeling all 24 v2.1 guards).{" "}
            <strong style={{ color: "#34d399" }}>Real Midnight Compact 0.28.0 Circuit:</strong> compiled with <span className="mono">compactc 0.36.1</span> (<span className="mono">persistentCommit</span> / <span className="mono">zkir-3.2.1</span>), tested via <span className="mono">npm test</span>, and live on Midnight Preview (<span className="mono">0x9ae57d40...4228bc8</span>, 6/6 txs).
          </div>
        </div>

        {walletState.error && (
          <div className="wallet-banner warn">
            <span>{walletState.error}</span>
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => setWalletState((prev) => ({ ...prev, error: null }))}
            >
              Dismiss
            </button>
          </div>
        )}

        {walletState.walletConnected && (
          <div className="wallet-banner">
            <span className="mono" style={{ fontSize: 12 }}>
              Connected via @midnight-ntwrk/dapp-connector-api@4.1.0 ({walletState.walletName})
              {walletState.shieldedAddress ? ` · Shielded: ${walletState.shieldedAddress.slice(0, 22)}...` : ""}
              {walletState.serviceUris?.proverServerUri ? ` · Prover: ${walletState.serviceUris.proverServerUri}` : ` · Proving: ${walletState.provingMode}`}
              {walletState.dustBalance !== null ? ` · DUST: ${walletState.dustBalance}` : ""}
            </span>
            <span className="badge emerald">WALLET CONNECTED</span>
          </div>
        )}

        {activeTab === "overview" && (
          <OverviewTab
            ledger={ledger}
            privateVault={privateVault}
            lastSolvency={lastSolvency}
            onProveSolvency={handleProveSolvency}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "settle" && (
          <SettleTab
            ledger={ledger}
            lastResult={lastSettlement}
            walletState={walletState}
            dispatchingWallet={dispatchingWallet}
            onSettle={handleSettle}
            onDispatchWallet={handleDispatchLastSettlement}
            onInspectReceipt={(receiptId) => {
              setSelectedReceiptId(receiptId);
              setActiveTab("audit");
            }}
          />
        )}

        {activeTab === "breaker" && (
          <BreakerLabTab
            ledger={ledger}
            reports={breakerReports}
            onRunAttack={handleRunAttack}
            onRunAllAttacks={handleRunAllAttacks}
          />
        )}

        {activeTab === "audit" && (
          <AuditTab
            ledger={ledger}
            walletState={walletState}
            selectedReceiptId={selectedReceiptId}
            onSelectReceipt={setSelectedReceiptId}
            buildExportPackage={buildExportPackage}
          />
        )}

        {activeTab === "spec" && (
          <CompactSpecTab
            ledger={ledger}
            onAddJurisdiction={handleAddJurisdiction}
            onUpdatePolicy={handleUpdatePolicy}
          />
        )}
      </main>

      <footer className="footer">
        ProofVault v2.1 · Midnight Network (Compact 0.28.0 / compactc 0.36.1 / Ledger 9) · Browser SHA-256 Simulator + Live Preview Indexer GraphQL v4 · Apache-2.0
      </footer>
    </div>
  );
}
export default App;
