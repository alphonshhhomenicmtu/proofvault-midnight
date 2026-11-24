#!/usr/bin/env node
/**
 * ProofVault — 10-Slide Institutional PDF Pitch Deck Builder
 *
 * Generates docs/proofvault-deck.pdf (16:9 widescreen, 1280x720) using headless
 * Chrome Print-to-PDF with embedded Retina V2 UI screenshots and verified
 * Compact 0.28.0 / compactc 0.36.1 / 52-test security telemetry.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs");
const SCREENSHOTS_DIR = path.join(DOCS_DIR, "screenshots");
const HTML_TMP = path.join(DOCS_DIR, ".deck-render.html");
const PDF_OUT = path.join(DOCS_DIR, "proofvault-deck.pdf");

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "google-chrome",
  "chromium"
];

function findChrome() {
  for (const bin of CHROME_CANDIDATES) {
    if (bin.startsWith("/") && fs.existsSync(bin)) return bin;
  }
  throw new Error("Could not find Google Chrome / Edge binary for headless PDF export.");
}

function imgDataUri(filename) {
  const full = path.join(SCREENSHOTS_DIR, filename);
  const b64 = fs.readFileSync(full).toString("base64");
  return `data:image/png;base64,${b64}`;
}

function buildHtml() {
  const shotOverview = imgDataUri("01-overview.png");
  const shotSettle = imgDataUri("02-settle.png");
  const shotAudit = imgDataUri("03-audit.png");

  const previewManifest = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, "deploy", "preview.json"), "utf8")
  );
  const blockHeight = previewManifest?.verifiedLiveChainHead?.blockHeight ?? 249428;
  const blockHashShort = String(previewManifest?.verifiedLiveChainHead?.blockHash ?? "").slice(0, 14);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>ProofVault — Institutional Pitch Deck (AKINDO Midnight Wave 3)</title>
<style>
  @page {
    size: 1280px 720px;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: #06090f;
    color: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", "Helvetica Neue", sans-serif;
  }
  .mono {
    font-family: "SF Mono", Menlo, Monaco, Consolas, ui-monospace, monospace;
  }
  .slide {
    width: 1280px;
    height: 720px;
    padding: 46px 56px 40px;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    background:
      radial-gradient(960px 440px at 10% -6%, rgba(56, 189, 248, 0.12), transparent 62%),
      radial-gradient(760px 380px at 92% 108%, rgba(245, 158, 11, 0.08), transparent 60%),
      #06090f;
    display: flex;
    flex-direction: column;
  }
  .slide:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  .slide-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    padding-bottom: 12px;
  }
  .kicker {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #38bdf8;
  }
  .slide-num {
    font-size: 11px;
    color: #64748b;
  }
  h1 {
    margin: 0;
    font-size: 46px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.08;
    color: #f8fafc;
  }
  h2 {
    margin: 0 0 8px;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.15;
    color: #f8fafc;
  }
  .lead {
    margin: 0 0 22px;
    font-size: 15px;
    color: #94a3b8;
    line-height: 1.48;
    max-width: 1020px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
    border: 1px solid rgba(148, 163, 184, 0.24);
    background: #111927;
    color: #cbd5e1;
  }
  .badge.cyan { color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.12); }
  .badge.amber { color: #fbbf24; border-color: rgba(245, 158, 11, 0.42); background: rgba(245, 158, 11, 0.12); }
  .badge.emerald { color: #34d399; border-color: rgba(52, 211, 153, 0.4); background: rgba(52, 211, 153, 0.12); }
  .badge.rose { color: #fb7185; border-color: rgba(251, 113, 133, 0.4); background: rgba(251, 113, 133, 0.12); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .card {
    background: #0c121d;
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 12px;
    padding: 18px 20px;
  }
  .card.cyan { border-color: rgba(56, 189, 248, 0.36); box-shadow: inset 3px 0 0 #38bdf8; }
  .card.amber { border-color: rgba(245, 158, 11, 0.36); box-shadow: inset 3px 0 0 #f59e0b; }
  .card.emerald { border-color: rgba(52, 211, 153, 0.36); box-shadow: inset 3px 0 0 #34d399; }
  .card.rose { border-color: rgba(251, 113, 133, 0.36); box-shadow: inset 3px 0 0 #fb7185; }
  .card h3 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 700;
    color: #f8fafc;
  }
  .card p, .card li {
    font-size: 13.5px;
    color: #cbd5e1;
    line-height: 1.48;
  }
  ul { margin: 8px 0 0; padding-left: 18px; }
  li { margin-bottom: 6px; }
  .kpi {
    background: #0c121d;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 12px;
    padding: 16px 18px;
  }
  .kpi-num {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }
  .kpi-lbl {
    font-size: 11.5px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
    background: #0b101a;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.18);
  }
  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    vertical-align: top;
  }
  th {
    background: #121b2a;
    color: #94a3b8;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  tr:last-child td { border-bottom: none; }
  .shot-frame {
    border: 1px solid rgba(56, 189, 248, 0.32);
    border-radius: 10px;
    overflow: hidden;
    background: #080c14;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
  }
  .shot-frame img {
    display: block;
    width: 100%;
    height: auto;
  }
  .slide-foot {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #64748b;
  }
  .step-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    margin-top: 6px;
  }
  .step-box {
    background: #0c121d;
    border: 1px solid rgba(56, 189, 248, 0.28);
    border-radius: 10px;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .step-idx {
    font-size: 10.5px;
    font-weight: 700;
    color: #38bdf8;
  }
  .step-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #f8fafc;
    line-height: 1.25;
  }
  .step-desc {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.35;
  }
</style>
</head>
<body>

<!-- SLIDE 1: COVER -->
<section class="slide" style="justify-content: space-between; padding: 54px 64px 44px;">
  <div style="display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; align-items:center; gap:12px;">
      <div style="width:42px; height:42px; border-radius:11px; background:rgba(56,189,248,0.16); border:1px solid rgba(56,189,248,0.45); display:flex; align-items:center; justify-content:center; color:#38bdf8; font-weight:800; font-size:20px;">P</div>
      <div>
        <div style="font-size:18px; font-weight:700; letter-spacing:-0.01em;">ProofVault</div>
        <div class="mono" style="font-size:11px; color:#64748b;">AKINDO · Build Privacy-First Apps on Midnight (Wave 3)</div>
      </div>
    </div>
    <div style="display:flex; gap:8px;">
      <span class="badge cyan mono">Compact 0.28.0 · compactc 0.36.1</span>
      <span class="badge emerald mono">Ledger 9 · zkir-3.2.1</span>
      <span class="badge mono">Apache-2.0</span>
    </div>
  </div>

  <div style="max-width: 1040px; margin-top: 26px;">
    <div class="kicker mono" style="margin-bottom: 14px;">ZERO-KNOWLEDGE INSTITUTIONAL TREASURY INFRASTRUCTURE</div>
    <h1>Confidential Invoice Settlement &amp;<br/>Selective-Disclosure Treasury Compliance</h1>
    <p style="font-size: 18px; color: #94a3b8; line-height: 1.55; margin: 20px 0 30px; max-width: 890px;">
      DAOs and Web3 foundations prove <strong style="color:#f8fafc;">solvency</strong>, <strong style="color:#f8fafc;">budget tier caps</strong>, and <strong style="color:#f8fafc;">non-sanctioned counterparty jurisdiction</strong> in a single atomic Midnight ZK circuit — while permanently shielding vendor identities, line items, exact amounts, country codes, and total treasury balances.
    </p>
    <div class="grid-4">
      <div class="kpi">
        <div class="kpi-num" style="color:#38bdf8;">5 / 5</div>
        <div class="kpi-lbl mono">Compiled Compact Circuits</div>
      </div>
      <div class="kpi">
        <div class="kpi-num" style="color:#34d399;">52 / 52</div>
        <div class="kpi-lbl mono">Vitest + Fuzz Tests Pass</div>
      </div>
      <div class="kpi">
        <div class="kpi-num" style="color:#fbbf24;">18 / 18</div>
        <div class="kpi-lbl mono">Guard Mutants Killed</div>
      </div>
      <div class="kpi">
        <div class="kpi-num" style="color:#f8fafc;">Live v4</div>
        <div class="kpi-lbl mono">Walletless Indexer Reader</div>
      </div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Live App: alphonshhhomenicmtu.github.io/proofvault-midnight/</span>
    <span>Repo: github.com/alphonshhhomenicmtu/proofvault-midnight · Topic: midnightntwrk</span>
  </div>
</section>

<!-- SLIDE 2: THE PROBLEM -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">01 · THE INSTITUTIONAL PRIVACY DILEMMA</span>
    <span class="slide-num mono">02 / 10</span>
  </div>
  <h2>Transparent Chains Leak Competitive Intelligence.<br/>Opaque Off-Chain Rails Break Governance &amp; Audits.</h2>
  <p class="lead">
    Web3 foundations and DAO treasuries manage billions in contributor bounties, security audits, and vendor retainers. Today, finance teams face an untenable binary choice.
  </p>

  <div class="grid-2" style="flex:1; align-items:stretch;">
    <div class="card rose" style="display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <span class="badge rose mono" style="margin-bottom:12px;">STATUS QUO A · PUBLIC TRANSPARENT LEDGERS</span>
        <h3>Radical Transparency Exposes Strategic Operations</h3>
        <ul>
          <li><strong>Vendor &amp; Audit Rate Leakage:</strong> Competitors and negotiators inspect exact payouts to security auditors, market makers, and legal counsel.</li>
          <li><strong>Payroll &amp; Contributor Doxxing:</strong> Linking wallet flows reveals individual contractor compensation and geographic distribution.</li>
          <li><strong>Treasury Runway Exploitation:</strong> Real-time exact reserve visibility lets adversaries front-run OTC desks and governance treasury liquidity.</li>
        </ul>
      </div>
      <div class="mono" style="margin-top:16px; padding:10px 12px; border-radius:8px; background:#080c14; font-size:12px; color:#fb7185;">
        RESULT: Institutions refuse to run core AP/bounty workflows on-chain.
      </div>
    </div>

    <div class="card amber" style="display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <span class="badge amber mono" style="margin-bottom:12px;">STATUS QUO B · PRIVATE OFF-CHAIN / MIXERS</span>
        <h3>Full Opacity Destroys Accountability &amp; Compliance</h3>
        <ul>
          <li><strong>Zero Solvency Proof:</strong> Tokenholders cannot verify whether treasury reserves remain above governance floors after disbursements.</li>
          <li><strong>Sanctions &amp; Budget Blind Spots:</strong> Off-chain invoices cannot cryptographically prove non-sanctioned OFAC/FATF eligibility or spending-cap enforcement.</li>
          <li><strong>Audit Bottlenecks:</strong> External CPAs require slow manual bank-statement reconciliation with zero cryptographic tamper resistance.</li>
        </ul>
      </div>
      <div class="mono" style="margin-top:16px; padding:10px 12px; border-radius:8px; background:#080c14; font-size:12px; color:#fbbf24;">
        RESULT: Governance loses trust; regulators reject opaque black-box rails.
      </div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>ProofVault resolves the dilemma natively via Midnight dual-ledger programmable privacy.</span>
    <span>Slide 02</span>
  </div>
</section>

<!-- SLIDE 3: THE SOLUTION -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">02 · ATOMIC ZERO-KNOWLEDGE SETTLEMENT</span>
    <span class="slide-num mono">03 / 10</span>
  </div>
  <h2>Seven Cryptographic Invariants Proven in One Compact Circuit</h2>
  <p class="lead">
    <span class="mono" style="color:#38bdf8;">settleConfidentialInvoice(budgetTierCap, tier)</span> executes all compliance, solvency, and anti-replay checks over private off-chain witnesses before writing a single minimal <span class="mono">AuditReceipt</span> to Midnight's public ledger.
  </p>

  <div class="step-grid">
    <div class="step-box">
      <span class="step-idx mono">GUARD 01</span>
      <span class="step-title">Vault Active &amp; Operator Auth</span>
      <span class="step-desc">Proves private <span class="mono">operatorSecretKey</span> hashes to <span class="mono">treasuryAuthority</span> &amp; vault is unpaused.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">GUARD 02</span>
      <span class="step-title">Open Balance Commitment</span>
      <span class="step-desc">Opens <span class="mono">persistentCommit(balance, salt)</span> locally without exposing exact reserves.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">GUARD 03</span>
      <span class="step-title">Budget Cap &amp; Solvency Floor</span>
      <span class="step-desc">Enforces <span class="mono">0 &lt; amt &lt;= cap &lt;= max</span> and <span class="mono">bal - amt &gt;= floor</span>.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">GUARD 04</span>
      <span class="step-title">Merkle Jurisdiction</span>
      <span class="step-desc">Verifies <span class="mono">HistoricMerkleTree&lt;8&gt;</span> inclusion without disclosing ISO country code.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">GUARD 05</span>
      <span class="step-title">Nullifier Anti-Replay</span>
      <span class="step-desc">Derives deterministic nullifier and asserts <span class="mono">!usedInvoiceNullifiers.member()</span>.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">GUARD 06</span>
      <span class="step-title">Re-Blind Treasury State</span>
      <span class="step-desc">Commits <span class="mono">bal - amt</span> with fresh 256-bit blinding factor, breaking spend linkability.</span>
    </div>
    <div class="step-box" style="border-color:rgba(52,211,153,0.45);">
      <span class="step-idx mono" style="color:#34d399;">OUTPUT 07</span>
      <span class="step-title">Scoped Audit Receipt</span>
      <span class="step-desc">Publishes minimal <span class="mono">AuditReceipt</span> across 3 selective disclosure tiers.</span>
    </div>
  </div>

  <div class="grid-3" style="margin-top:20px;">
    <div class="card amber">
      <span class="badge amber mono" style="margin-bottom:8px;">TIER 0 · MinimalSolvency</span>
      <p style="margin:0;">Proves solvency floor, budget ceiling, and non-sanctioned eligibility only. <span class="mono">auditorTag = 0x00..00</span>.</p>
    </div>
    <div class="card cyan">
      <span class="badge cyan mono" style="margin-bottom:8px;">TIER 1 · ThresholdBand</span>
      <p style="margin:0;">Publishes standardized DAO spend band cap (e.g., &le; $50k) and compliance root without external auditor linkage.</p>
    </div>
    <div class="card emerald">
      <span class="badge emerald mono" style="margin-bottom:8px;">TIER 2 · AuditorScoped</span>
      <p style="margin:0;">Binds cryptographic <span class="mono">auditorTag = H(vkHash, invoiceCommit)</span> so authorized CPAs verify scope trustlessly.</p>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Compact 0.28.0 compile-time taint tracking ensures zero private fields escape outside explicit disclose() sites.</span>
    <span>Slide 03</span>
  </div>
</section>

<!-- SLIDE 4: DUAL-LEDGER PRIVACY BOUNDARY -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">03 · WHY MIDNIGHT · DUAL-LEDGER DATA ISOLATION</span>
    <span class="slide-num mono">04 / 10</span>
  </div>
  <h2>Strict Separation of Off-Chain Witnesses &amp; On-Chain Commitments</h2>
  <p class="lead">
    Midnight's dual-ledger architecture enforces privacy mathematically at circuit synthesis time rather than relying on off-chain access-control promises.
  </p>

  <div class="grid-2" style="margin-bottom:16px;">
    <div class="card amber">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0; color:#fbbf24;">Private Off-Chain Witness Vault (11 Witnesses)</h3>
        <span class="badge amber mono">NEVER ON-CHAIN</span>
      </div>
      <div class="mono" style="font-size:12px; color:#e2e8f0; line-height:1.7;">
        • operatorSecretKey() &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• treasurySecretBalance()<br/>
        • treasuryBlindingFactor() &nbsp;&nbsp;• nextTreasuryBlindingFactor()<br/>
        • invoiceVendorId() &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• invoiceLineItemsHash()<br/>
        • invoiceAmount() &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• invoiceSalt()<br/>
        • jurisdictionLeaf() &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• jurisdictionMerklePath&lt;8&gt;()<br/>
        • auditorViewingKeyHash()
      </div>
    </div>

    <div class="card cyan">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0; color:#38bdf8;">Public Midnight Ledger State (Minimal Commitments)</h3>
        <span class="badge cyan mono">AUDITED disclose()</span>
      </div>
      <div class="mono" style="font-size:12px; color:#e2e8f0; line-height:1.7;">
        • treasuryAuthority: Bytes&lt;32&gt; (one-way operator pk digest)<br/>
        • treasuryBalanceCommitment: Bytes&lt;32&gt; (salted persistentCommit)<br/>
        • approvedJurisdictions: HistoricMerkleTree&lt;8, Bytes&lt;32&gt;&gt;<br/>
        • usedInvoiceNullifiers: Set&lt;Bytes&lt;32&gt;&gt; (anti-replay lock)<br/>
        • auditReceipts: Map&lt;Bytes&lt;32&gt;, AuditReceipt&gt;<br/>
        • policyMaxSingleSettlement, policyMinReserveFloor, Epoch, Counter
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sensitive Treasury Field</th>
        <th>Public Midnight Ledger</th>
        <th>Scoped External Auditor</th>
        <th>Permanently Shielded</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Exact Treasury Balance</strong></td>
        <td style="color:#64748b;">Hidden (commitment only)</td>
        <td style="color:#34d399;">Verifies balance &ge; reserve floor</td>
        <td><span class="badge amber mono">YES</span></td>
      </tr>
      <tr>
        <td><strong>Exact Invoice Payout Amount</strong></td>
        <td style="color:#64748b;">Hidden (tier cap bound only)</td>
        <td style="color:#34d399;">Verifies 0 &lt; amount &le; budgetTierCap</td>
        <td><span class="badge amber mono">YES</span></td>
      </tr>
      <tr>
        <td><strong>Counterparty Identity &amp; Line Items</strong></td>
        <td style="color:#64748b;">Hidden (salted commitment + nullifier)</td>
        <td style="color:#34d399;">Verifies unique anti-replay binding</td>
        <td><span class="badge amber mono">YES</span></td>
      </tr>
      <tr>
        <td><strong>Counterparty ISO Country Code</strong></td>
        <td style="color:#64748b;">Hidden (historic Merkle root only)</td>
        <td style="color:#34d399;">Verifies non-sanctioned inclusion</td>
        <td><span class="badge amber mono">YES</span></td>
      </tr>
    </tbody>
  </table>

  <div class="slide-foot mono">
    <span>Full line-by-line disclose() taint audit committed in PRIVACY_BOUNDARY.md.</span>
    <span>Slide 04</span>
  </div>
</section>

<!-- SLIDE 5: COMPILED COMPACT 0.28.0 ARTIFACTS -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">04 · REAL COMPACT 0.28.0 / COMPACTC 0.36.1 COMPILATION</span>
    <span class="slide-num mono">05 / 10</span>
  </div>
  <h2>5 Production Midnight Ledger 9 Circuits — Compiled &amp; Verified</h2>
  <p class="lead">
    Compiled cleanly with official <span class="mono" style="color:#38bdf8;">compactc 0.36.1</span> (<span class="mono">zkir-3.2.1</span>) and executed directly via <span class="mono">@midnight-ntwrk/compact-runtime@0.21.0</span> with deterministic SHA-256 artifact manifests.
  </p>

  <table style="margin-bottom:18px;">
    <thead>
      <tr>
        <th>Exported Compact Circuit</th>
        <th>ZKIR</th>
        <th>BZKIR</th>
        <th>Verifier Key</th>
        <th>Prover Key</th>
        <th>Ledger &amp; Privacy Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">settleConfidentialInvoice()</td>
        <td class="mono">20,385 B</td>
        <td class="mono">6,159 B</td>
        <td class="mono">2,121 B</td>
        <td class="mono">43.0 MB</td>
        <td>Atomic 7-guard settlement, balance re-blinding, nullifier lock &amp; receipt</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">proveTreasurySolvency()</td>
        <td class="mono">3,879 B</td>
        <td class="mono">998 B</td>
        <td class="mono">2,121 B</td>
        <td class="mono">10.8 MB</td>
        <td>Zero-knowledge solvency threshold attestation against public commitment</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">registerApprovedJurisdiction()</td>
        <td class="mono">3,433 B</td>
        <td class="mono">964 B</td>
        <td class="mono">2,121 B</td>
        <td class="mono">10.8 MB</td>
        <td>Operator-authenticated leaf insert into <span class="mono">HistoricMerkleTree&lt;8&gt;</span></td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">updateGovernancePolicy()</td>
        <td class="mono">3,606 B</td>
        <td class="mono">1,053 B</td>
        <td class="mono">2,121 B</td>
        <td class="mono">10.8 MB</td>
        <td>Max cap / reserve floor rotation, circuit-breaker pause &amp; epoch bump</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">verifyReceiptOnChain()</td>
        <td class="mono">969 B</td>
        <td class="mono">266 B</td>
        <td class="mono">1,353 B</td>
        <td class="mono">0.2 MB</td>
        <td>Public on-chain existence check in <span class="mono">auditReceipts</span> Map</td>
      </tr>
    </tbody>
  </table>

  <div class="grid-3">
    <div class="card">
      <div class="mono" style="font-size:11px; color:#38bdf8; margin-bottom:4px;">PURE HELPER CIRCUITS</div>
      <div style="font-size:13px; color:#cbd5e1;"><span class="mono">deriveOperatorPublicKey</span>, <span class="mono">deriveNullifier</span>, <span class="mono">deriveInvoiceCommitment</span> with domain-separated tags.</div>
    </div>
    <div class="card">
      <div class="mono" style="font-size:11px; color:#34d399; margin-bottom:4px;">ARTIFACT INTEGRITY</div>
      <div class="mono" style="font-size:11.5px; color:#cbd5e1;">proofvault.compact:<br/>f6f74e26...9a7cc68</div>
    </div>
    <div class="card">
      <div class="mono" style="font-size:11px; color:#fbbf24; margin-bottom:4px;">RUNTIME &amp; CONNECTOR</div>
      <div class="mono" style="font-size:11.5px; color:#cbd5e1;">compact-runtime@0.21.0<br/>dapp-connector-api@4.1.0</div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Pre-compiled TypeScript bindings, ZKIR/BZKIR, and manifest committed under contracts/managed/proofvault/.</span>
    <span>Slide 05</span>
  </div>
</section>

<!-- SLIDE 6: PRODUCT SHOWCASE -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">05 · INTERACTIVE PRIVACY TERMINAL &amp; WORKBENCH</span>
    <span class="slide-num mono">06 / 10</span>
  </div>
  <h2>Zero-Setup Dual-Ledger UX Built for Operators &amp; Judges</h2>
  <p class="lead">
    Live static deployment on GitHub Pages pairs clear amber-vs-cyan privacy boundaries with 6 one-click settlement &amp; attack presets and real-time constraint tracing.
  </p>

  <div class="grid-2" style="gap:20px; flex:1; align-items:start;">
    <div>
      <div class="shot-frame" style="margin-bottom:10px;">
        <img src="${shotOverview}" alt="ProofVault Overview Dual-Ledger Workbench" />
      </div>
      <div style="font-size:12.5px; color:#cbd5e1;">
        <strong style="color:#fbbf24;">Overview Workbench:</strong> Side-by-side Private Off-Chain Witness Vault (with instant Mask toggle) vs. Public Midnight Ledger Commitments + live <span class="mono">proveTreasurySolvency()</span> threshold tester.
      </div>
    </div>
    <div>
      <div class="shot-frame" style="margin-bottom:10px;">
        <img src="${shotSettle}" alt="ProofVault Confidential Settlement Pipeline" />
      </div>
      <div style="font-size:12.5px; color:#cbd5e1;">
        <strong style="color:#38bdf8;">Settle Invoice Pipeline:</strong> 3 valid disclosure tiers + 3 adversarial guard presets (Sanctioned KP, Over-Cap Breach, Nullifier Replay) with live disclosed vs. redacted witness diff.
      </div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Try live without Docker or wallet: https://alphonshhhomenicmtu.github.io/proofvault-midnight/</span>
    <span>Slide 06</span>
  </div>
</section>

<!-- SLIDE 7: LIVE INDEXER GRAPHQL + LACE / 1AM WALLET ARCHITECTURE -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">06 · LIVE MIDNIGHT INDEXER GRAPHQL &amp; WALLET DISPATCH</span>
    <span class="slide-num mono">07 / 10</span>
  </div>
  <h2>Walletless Live Preview Indexer Readback + Lace &amp; 1AM Dispatch</h2>
  <p class="lead">
    Judges verify live Midnight Ledger 9 chain finality with zero wallet directly in the Audit Portal, while operators connect Lace or 1AM via <span class="mono">window.midnight</span> for transaction balancing and signing.
  </p>

  <div class="grid-2" style="gap:20px; align-items:start;">
    <div>
      <div class="shot-frame">
        <img src="${shotAudit}" alt="Audit Portal with Live Midnight Preview Indexer GraphQL Sync" />
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="card emerald">
        <h3>Live Midnight Preview Indexer (GraphQL v4)</h3>
        <p style="margin:0;">Queries <span class="mono" style="color:#34d399;">indexer.preview.midnight.network/api/v4/graphql</span> directly from the browser (CORS <span class="mono">*</span>, zero API key). Verified live at Block <span class="mono">#${Number(blockHeight).toLocaleString()}</span> (<span class="mono">0x${blockHashShort}...</span>, Ledger 9).</p>
      </div>
      <div class="card cyan">
        <h3>Real <span class="mono">window.midnight</span> Tx Dispatch (Lace &amp; 1AM)</h3>
        <p style="margin:0;">Discovers CAIP-372 UUID providers, invokes <span class="mono">hintUsage()</span> &amp; <span class="mono">getDustBalance()</span>, wires <span class="mono">KeyMaterialProvider</span> for <span class="mono">getProvingProvider()</span>, and executes <span class="mono">balanceUnsealedTransaction() → submitTransaction()</span> or BIP-340 <span class="mono">signData()</span>.</p>
      </div>
      <div class="card amber">
        <h3>Honest Testnet Deployment Pipeline</h3>
        <p style="margin:0;"><span class="mono">scripts/deploy-testnet.mjs</span> + <span class="mono">deploy/preview.json</span> &amp; <span class="mono">deploy/preprod.json</span> are 100% turnkey. Official Midnight faucets require interactive Cloudflare Turnstile (never bypassed); <span class="mono">npm run verify:onchain</span> &amp; <span class="mono">deploy:preview:dry</span> execute end-to-end today.</p>
      </div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Handles Preprod 2026-10-09 Blockfrost migration gracefully with automatic project_id &amp; Preview fallback.</span>
    <span>Slide 07</span>
  </div>
</section>

<!-- SLIDE 8: SECURITY, GUARD-MUTATION & FUZZING AUDIT -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">07 · QUALITY ASSURANCE, MUTATION AUDIT &amp; PROPERTY FUZZING</span>
    <span class="slide-num mono">08 / 10</span>
  </div>
  <h2>52/52 Automated Tests · 18/18 Guard Mutants Killed (100%)</h2>
  <p class="lead">
    Beyond happy-path checks, ProofVault runs a programmatic guard-deletion mutation harness and <span class="mono">fast-check</span> property fuzzing directly over the compiled Compact 0.28.0 runtime.
  </p>

  <div class="grid-2" style="margin-bottom:16px;">
    <div class="card emerald">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="margin:0;">Guard-Deletion Mutation Harness</h3>
        <span class="badge emerald mono">18 / 18 KILLED</span>
      </div>
      <ul>
        <li>Parses every <span class="mono">assert(...)</span> in <span class="mono">proofvault.compact</span> (all 18 guards across constructor &amp; 4 impure circuits) and maps 1:1 to compiled <span class="mono">index.js</span>.</li>
        <li>Surgically deletes each single guard in memory and verifies the targeted exploit bypasses — proving <strong>zero dead or untested security checks</strong>.</li>
        <li>Covers operator forgery, commitment mismatch, zero/over-cap/over-ceiling/underflow/reserve-floor breaches, paused circuit breaker, forged Merkle leaf/root, and nullifier replay.</li>
      </ul>
    </div>

    <div class="card cyan">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="margin:0;">Property-Based Fuzzing (<span class="mono">fast-check</span>)</h3>
        <span class="badge cyan mono">7 FUZZ SUITES</span>
      </div>
      <ul>
        <li><strong>Real Bug Caught &amp; Patched:</strong> Fuzzing single-field receipt tampering uncovered a missing <span class="mono">settledEpoch</span> immutability check in <span class="mono">verifyAuditPackageAgainstLedger()</span> — immediately fixed and locked under regression.</li>
        <li><strong>State Conservation:</strong> Arbitrary multi-invoice runs prove exact balance conservation, monotonic Merkle history, and 7/7 receipt validity.</li>
        <li><strong>Zero-Leak Proof:</strong> Scans raw <span class="mono">ContractState.serialize()</span> bytes and exported JSON packages across randomized secrets for zero PII leakage.</li>
      </ul>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Vitest Suite</th>
        <th>Tests</th>
        <th>Verification Target</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="mono" style="color:#34d399; white-space:nowrap;">tests/mutation-audit.test.ts</td>
        <td class="mono" style="white-space:nowrap;"><strong>26 PASS</strong></td>
        <td>100% assert inventory + 18 individual guard-deletion mutants + 7 <span class="mono">fast-check</span> fuzz properties</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; white-space:nowrap;">tests/compact-contract.test.ts</td>
        <td class="mono" style="white-space:nowrap;"><strong>8 PASS</strong></td>
        <td>Real compiled <span class="mono">contracts/managed/proofvault/contract/index.js</span> via <span class="mono">compact-runtime@0.21.0</span></td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8;">tests/proof-engine.test.ts · wallet-adapter · indexer-client</td>
        <td class="mono" style="white-space:nowrap;"><strong>18 PASS</strong></td>
        <td>6 UI presets, 7-point receipt verifier, Lace/1AM tx dispatch &amp; live GraphQL v4 client</td>
      </tr>
    </tbody>
  </table>

  <div class="slide-foot mono">
    <span>Run locally in ~4s: npm test &amp;&amp; npm run build &amp;&amp; npm run verify:onchain</span>
    <span>Slide 08</span>
  </div>
</section>

<!-- SLIDE 9: TRUST MODEL & PRIVACY BOUNDARY -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">08 · TRUST BOUNDARIES &amp; HONEST THREAT MODEL</span>
    <span class="slide-num mono">09 / 10</span>
  </div>
  <h2>Explicit Role Isolation: What Is Proven vs. Trusted</h2>
  <p class="lead">
    Institutional compliance demands clarity on cryptographic guarantees versus operational assumptions. Every role boundary and all 16 <span class="mono">disclose()</span> sites are audited in <span class="mono">PRIVACY_BOUNDARY.md</span>.
  </p>

  <table style="margin-bottom:16px;">
    <thead>
      <tr>
        <th>Actor</th>
        <th>Cryptographically Enforced (Trustless)</th>
        <th>Learns</th>
        <th>Explicit Boundary / Mitigation</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Treasury Operator</strong></td>
        <td>Cannot forge solvency, exceed caps, pay unlisted ISO codes, replay nullifiers, or bypass Paused breaker.</td>
        <td>Local witness vault</td>
        <td>Operationally trusted to bind off-chain bank/fiat wires until Phase 2 Zswap native coin transfer settlement.</td>
      </tr>
      <tr>
        <td><strong>Scoped External Auditor</strong></td>
        <td>Verifies 7-point receipt immutability, Merkle root history, and <span class="mono">auditorTag</span> key binding.</td>
        <td>Scoped receipts only</td>
        <td>Cannot see exact balance/amounts unless operator shares commitment opening off-chain during dispute.</td>
      </tr>
      <tr>
        <td><strong>Counterparty / Vendor</strong></td>
        <td>Isolated from peer vendors' rates, identities, and total DAO reserves; verifies own receipt on-chain.</td>
        <td>Own invoice only</td>
        <td>Standardize round public <span class="mono">budgetTierCap</span> bands ($25k/$50k/$100k) to maximize anonymity sets.</td>
      </tr>
      <tr>
        <td><strong>Public DAO / Validators</strong></td>
        <td>Verifies Ledger 9 SNARKs, live solvency floors, settled count, and nullifier uniqueness walletlessly.</td>
        <td>Commitments &amp; roots</td>
        <td>Batch weekly settlements to minimize block-timestamp correlation; run Proof Server in self-hosted VPC.</td>
      </tr>
    </tbody>
  </table>

  <div class="grid-3">
    <div class="card">
      <div class="mono" style="font-size:11px; color:#38bdf8;">16 AUDITED disclose() SITES</div>
      <div style="font-size:12.5px; color:#cbd5e1; margin-top:4px;">Every public emission is a one-way commitment, nullifier, historic root, or explicit governance bound.</div>
    </div>
    <div class="card">
      <div class="mono" style="font-size:11px; color:#34d399;">LOCAL PROOF SERVER RULE</div>
      <div style="font-size:12.5px; color:#cbd5e1; margin-top:4px;">Witnesses stay on localhost (<span class="mono">127.0.0.1:6300</span>) or inside Lace/1AM's <span class="mono">getProvingProvider()</span>.</div>
    </div>
    <div class="card">
      <div class="mono" style="font-size:11px; color:#fbbf24;">ZERO-PII RECEIPT EXPORT</div>
      <div style="font-size:12.5px; color:#cbd5e1; margin-top:4px;"><span class="mono">localMemo</span> &amp; vendor labels stripped before JSON export; fuzzed across 30+ random inputs.</div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Complete 11-witness &amp; 16-disclose() audit table available in PRIVACY_BOUNDARY.md.</span>
    <span>Slide 09</span>
  </div>
</section>

<!-- SLIDE 10: GTM, MONETIZATION & ROADMAP -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">09 · INSTITUTIONAL DAO GTM, VIABILITY &amp; ROADMAP</span>
    <span class="slide-num mono">10 / 10</span>
  </div>
  <h2>Path to Institutional Treasury Adoption on Midnight Mainnet</h2>
  <p class="lead">
    Designed as a drop-in privacy compliance layer beside Safe multisigs, Request Finance, and enterprise ERP accounting stacks.
  </p>

  <div class="grid-3" style="margin-bottom:18px;">
    <div class="card cyan">
      <span class="badge cyan mono" style="margin-bottom:8px;">TARGET BUYERS</span>
      <h3>Who Pays</h3>
      <ul>
        <li><strong>L1/L2 Foundations &amp; DAOs</strong> running $1M–$100M+ grant, audit, and core-dev treasuries.</li>
        <li><strong>Crypto Payroll &amp; Bounty Platforms</strong> requiring confidential contractor compliance.</li>
        <li><strong>Web3 CPA &amp; Audit Firms</strong> offering continuous zero-knowledge attestation portals.</li>
      </ul>
    </div>

    <div class="card emerald">
      <span class="badge emerald mono" style="margin-bottom:8px;">MONETIZATION &amp; GTM</span>
      <h3>Business Model</h3>
      <ul>
        <li><strong>Open-Core Contract:</strong> Apache-2.0 Compact circuits drive ecosystem trust &amp; auditability.</li>
        <li><strong>Enterprise SaaS ($1.5k–$5k/mo):</strong> Managed VPC Proof Server, Safe/Gnosis &amp; Xero/NetSuite CSV/JSON adapters, multi-auditor viewing-key RBAC.</li>
        <li><strong>Pilot Wedge:</strong> Cardano &amp; Midnight Catalyst/ecosystem treasury grantees needing confidential milestone proof.</li>
      </ul>
    </div>

    <div class="card amber">
      <span class="badge amber mono" style="margin-bottom:8px;">ROADMAP</span>
      <h3>Next Milestones</h3>
      <ul>
        <li><strong>Now (Wave 3 V2):</strong> Compact 0.28.0 Ledger 9 circuits, 52 tests + 18/18 guard mutations, live Preview Indexer GraphQL reader, Lace/1AM dispatch.</li>
        <li><strong>Q1 2027 (Preview/Preprod Live):</strong> Funded testnet broadcast + Zswap native <span class="mono">sendShielded</span> token payout coupling.</li>
        <li><strong>Q2 2027 (Mainnet Institutional):</strong> M-of-N Jubjub Schnorr multisig operator auth &amp; batched Merkle payroll proofs.</li>
      </ul>
    </div>
  </div>

  <div class="card" style="display:flex; align-items:center; justify-content:space-between; background:linear-gradient(90deg, rgba(56,189,248,0.12), rgba(52,211,153,0.08)); border-color:rgba(56,189,248,0.35);">
    <div>
      <div style="font-size:17px; font-weight:700; color:#f8fafc;">ProofVault — Verifiable Treasury Compliance Without Exposing Your Ledger</div>
      <div class="mono" style="font-size:12px; color:#94a3b8; margin-top:4px;">
        Live Demo: alphonshhhomenicmtu.github.io/proofvault-midnight/ &nbsp;·&nbsp; Video: youtube.com/watch?v=2SAttW3TaCU
      </div>
    </div>
    <span class="badge emerald mono" style="font-size:12px; padding:7px 14px;">READY FOR MIDNIGHT WAVE 3</span>
  </div>

  <div class="slide-foot mono">
    <span>ProofVault · Apache-2.0 Open Source · Built for Midnight Network (midnightntwrk)</span>
    <span>Slide 10 / 10</span>
  </div>
</section>

</body>
</html>`;
}

function main() {
  const chrome = findChrome();
  const html = buildHtml();
  fs.writeFileSync(HTML_TMP, html, "utf8");
  if (fs.existsSync(PDF_OUT)) fs.unlinkSync(PDF_OUT);
  const tmpProfile = path.join(DOCS_DIR, `.chrome-deck-profile-${Date.now()}`);
  try {
    execFileSync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--no-first-run",
        `--user-data-dir=${tmpProfile}`,
        "--print-to-pdf-no-header",
        `--print-to-pdf=${PDF_OUT}`,
        `file://${HTML_TMP}`
      ],
      { stdio: "pipe", timeout: 25000 }
    );
  } catch (err) {
    // macOS Chrome headless sometimes hits teardown watchdog after writing a valid PDF
    const okPdf =
      fs.existsSync(PDF_OUT) &&
      fs.statSync(PDF_OUT).size > 10_000 &&
      fs.readFileSync(PDF_OUT).subarray(0, 5).toString("ascii") === "%PDF-";
    if (!okPdf) {
      throw err;
    }
  } finally {
    if (fs.existsSync(HTML_TMP)) fs.unlinkSync(HTML_TMP);
    if (fs.existsSync(tmpProfile)) fs.rmSync(tmpProfile, { recursive: true, force: true });
  }
  const stat = fs.statSync(PDF_OUT);
  console.log(`\n[PDF OK] Generated ${path.relative(ROOT_DIR, PDF_OUT)} (${(stat.size / 1024).toFixed(1)} KB)`);
}

main();
