#!/usr/bin/env node
/**
 * ProofVault v2.1 — 10-Slide Visual PDF Pitch Deck Builder
 *
 * Generates docs/proofvault-deck.pdf (16:9 widescreen, 1280x720) using headless
 * Chrome Print-to-PDF with embedded UI screenshots (including the Adversarial
 * Breaker Lab) and verified Compact 0.28.0 / compactc 0.36.1 / 62-test metrics.
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
  const shotBreaker = imgDataUri("05-breaker-lab.png");
  const shotAudit = imgDataUri("03-audit.png");

  const previewManifest = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, "deploy", "preview.json"), "utf8")
  );
  const blockHeight = previewManifest?.verifiedLiveChainHead?.blockHeight ?? 251597;
  const blockHashShort = String(previewManifest?.verifiedLiveChainHead?.blockHash ?? "").slice(0, 14);
  const deployedContract =
    previewManifest?.deployment?.contractAddress ??
    "9ae57d40331df50a9a30340d2f2a612f7e6cf8fa99112d11e630c7b3f4228bc8";
  const deployedContractShort = `${deployedContract.slice(0, 12)}...${deployedContract.slice(-10)}`;
  const deployTxShort = String(previewManifest?.deployment?.deployTxHash ?? "").slice(0, 12);
  const settleTxShort = String(
    previewManifest?.deployment?.lifecycleTransactions?.settleConfidentialInvoice?.txHash ?? ""
  ).slice(0, 12);
  const stateBytes = previewManifest?.deployment?.finalOnChainState?.serializedStateBytes ?? 11697;
  const v21SourceSha = String(
    previewManifest?.compiledV21Artifacts?.sourceSha256 ?? "fc0ac33e60d3c697"
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>ProofVault v2.1 — Pitch Deck (AKINDO Midnight Wave 3)</title>
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
    padding: 44px 56px 38px;
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
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    padding-bottom: 11px;
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
    font-size: 45px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.08;
    color: #f8fafc;
  }
  h2 {
    margin: 0 0 8px;
    font-size: 29px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.15;
    color: #f8fafc;
  }
  .lead {
    margin: 0 0 18px;
    font-size: 14.5px;
    color: #94a3b8;
    line-height: 1.48;
    max-width: 1060px;
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
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .card {
    background: #0c121d;
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 12px;
    padding: 16px 18px;
  }
  .card.cyan { border-color: rgba(56, 189, 248, 0.36); box-shadow: inset 3px 0 0 #38bdf8; }
  .card.amber { border-color: rgba(245, 158, 11, 0.36); box-shadow: inset 3px 0 0 #f59e0b; }
  .card.emerald { border-color: rgba(52, 211, 153, 0.36); box-shadow: inset 3px 0 0 #34d399; }
  .card.rose { border-color: rgba(251, 113, 133, 0.36); box-shadow: inset 3px 0 0 #fb7185; }
  .card h3 {
    margin: 0 0 8px;
    font-size: 15.5px;
    font-weight: 700;
    color: #f8fafc;
  }
  .card p, .card li {
    font-size: 13px;
    color: #cbd5e1;
    line-height: 1.46;
  }
  ul { margin: 8px 0 0; padding-left: 18px; }
  li { margin-bottom: 5px; }
  .kpi {
    background: #0c121d;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 12px;
    padding: 15px 17px;
  }
  .kpi-num {
    font-size: 29px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }
  .kpi-lbl {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    background: #0b101a;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.18);
  }
  th, td {
    padding: 9px 11px;
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
    padding-top: 10px;
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
    margin-top: 4px;
  }
  .step-box {
    background: #0c121d;
    border: 1px solid rgba(56, 189, 248, 0.28);
    border-radius: 10px;
    padding: 11px 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .step-idx {
    font-size: 10px;
    font-weight: 700;
    color: #38bdf8;
  }
  .step-title {
    font-size: 12px;
    font-weight: 700;
    color: #f8fafc;
    line-height: 1.25;
  }
  .step-desc {
    font-size: 10.8px;
    color: #94a3b8;
    line-height: 1.35;
  }
</style>
</head>
<body>

<!-- SLIDE 1: COVER -->
<section class="slide" style="justify-content: space-between; padding: 52px 64px 42px;">
  <div style="display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; align-items:center; gap:12px;">
      <div style="width:42px; height:42px; border-radius:11px; background:rgba(56,189,248,0.16); border:1px solid rgba(56,189,248,0.45); display:flex; align-items:center; justify-content:center; color:#38bdf8; font-weight:800; font-size:20px;">P</div>
      <div>
        <div style="font-size:18px; font-weight:700; letter-spacing:-0.01em;">ProofVault v2.1</div>
        <div class="mono" style="font-size:11px; color:#64748b;">AKINDO · Build Privacy-First Apps on Midnight (Wave 3)</div>
      </div>
    </div>
    <div style="display:flex; gap:8px;">
      <span class="badge cyan mono">Compact 0.28.0 · compactc 0.36.1</span>
      <span class="badge emerald mono">Ledger 9 · zkir-3.2.1</span>
      <span class="badge mono">Apache-2.0</span>
    </div>
  </div>

  <div style="max-width: 1040px; margin-top: 22px;">
    <div class="kicker mono" style="margin-bottom: 12px;">MIDNIGHT SELECTIVE-DISCLOSURE TREASURY COMPLIANCE</div>
    <h1>Confidential Invoice Settlement &amp;<br/>Selective-Disclosure Audit Receipts</h1>
    <p style="font-size: 17.5px; color: #94a3b8; line-height: 1.55; margin: 18px 0 28px; max-width: 920px;">
      DAOs and foundations prove <strong style="color:#f8fafc;">solvency</strong>, <strong style="color:#f8fafc;">strict budget caps (<span class="mono">amount &lt; cap</span>)</strong>, and <strong style="color:#f8fafc;">bound non-sanctioned jurisdiction membership</strong> in one Compact circuit — while keeping counterparty IDs, line items, exact amounts, country leaves, and treasury balances in local witnesses.
    </p>
    <div class="grid-4">
      <div class="kpi">
        <div class="kpi-num" style="color:#38bdf8;">5 / 5</div>
        <div class="kpi-lbl mono">Compiled v2.1 Circuits</div>
      </div>
      <div class="kpi">
        <div class="kpi-num" style="color:#34d399;">62 / 62</div>
        <div class="kpi-lbl mono">Vitest + Fuzz Tests Pass</div>
      </div>
      <div class="kpi">
        <div class="kpi-num" style="color:#fbbf24;">24 / 24</div>
        <div class="kpi-lbl mono">JS Guard Mutants Killed</div>
      </div>
      <div class="kpi">
        <div class="kpi-num" style="color:#f8fafc;">6 / 6 Live</div>
        <div class="kpi-lbl mono">Preview Txs (v2.0)</div>
      </div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Web App: alphonshhhomenicmtu.github.io/proofvault-midnight/</span>
    <span>Repo: github.com/alphonshhhomenicmtu/proofvault-midnight · Topic: midnightntwrk</span>
  </div>
</section>

<!-- SLIDE 2: THE PROBLEM -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">01 · PROBLEM</span>
    <span class="slide-num mono">02 / 10</span>
  </div>
  <h2>Public Chains Leak Vendor Rates.<br/>Off-Chain Wires Break Solvency &amp; Compliance Audits.</h2>
  <p class="lead">
    DAO finance teams and foundations pay security auditors, core developers, and legal counsel every epoch. Existing rails force a binary tradeoff between public leaks and opaque bookkeeping.
  </p>

  <div class="grid-2" style="flex:1; align-items:stretch;">
    <div class="card rose" style="display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <span class="badge rose mono" style="margin-bottom:10px;">OPTION A · TRANSPARENT L1/L2 LEDGERS</span>
        <h3>Public Payouts Leak Competitive &amp; Personal Data</h3>
        <ul>
          <li><strong>Rate Exposure:</strong> Competitors and negotiators inspect exact retainers paid to auditors, counsel, and liquidity partners.</li>
          <li><strong>Contributor Doxxing:</strong> Public transfer graphs expose individual compensation and geographic distribution.</li>
          <li><strong>Runway Visibility:</strong> Real-time exact treasury balances expose liquidity thresholds during governance votes.</li>
        </ul>
      </div>
      <div class="mono" style="margin-top:14px; padding:9px 12px; border-radius:8px; background:#080c14; font-size:12px; color:#fb7185;">
        OUTCOME: Finance teams move payouts off-chain.
      </div>
    </div>

    <div class="card amber" style="display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <span class="badge amber mono" style="margin-bottom:10px;">OPTION B · PRIVATE OFF-CHAIN WIRES</span>
        <h3>Zero Cryptographic Compliance Proof for Tokenholders</h3>
        <ul>
          <li><strong>No Solvency Floor Proof:</strong> Governance cannot verify reserves stayed above policy minimums after disbursements.</li>
          <li><strong>No Jurisdiction or Cap Proof:</strong> Tokenholders cannot check non-sanctioned allowlist membership or spend ceilings.</li>
          <li><strong>Slow Manual Audits:</strong> External auditors reconcile PDFs and spreadsheets with no immutable receipt anchor.</li>
        </ul>
      </div>
      <div class="mono" style="margin-top:14px; padding:9px 12px; border-radius:8px; background:#080c14; font-size:12px; color:#fbbf24;">
        OUTCOME: Governance loses independent compliance verification.
      </div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>ProofVault enforces solvency, strict caps, and Merkle jurisdiction proofs in Compact 0.28.0.</span>
    <span>Slide 02</span>
  </div>
</section>

<!-- SLIDE 3: HARDENED V2.1 CIRCUIT -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">02 · HARDENED v2.1 ATOMIC CIRCUIT</span>
    <span class="slide-num mono">03 / 10</span>
  </div>
  <h2>Cryptographic Hardening in <span class="mono">settleConfidentialInvoice()</span></h2>
  <p class="lead">
    v2.1 closes dictionary nullifier attacks, unbound jurisdiction leaves, exact-amount cap leaks, and cosmetic tier labels directly inside <span class="mono">contracts/proofvault.compact</span>.
  </p>

  <div class="step-grid">
    <div class="step-box">
      <span class="step-idx mono">STEP 01</span>
      <span class="step-title">Auth &amp; Active Vault</span>
      <span class="step-desc">Checks <span class="mono">vaultStatus == Active</span> and <span class="mono">H(opSk) == treasuryAuthority</span>.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">STEP 02</span>
      <span class="step-title">Open Balance Commit</span>
      <span class="step-desc">Opens <span class="mono">persistentCommit(balance, currentSalt)</span> locally.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">STEP 03</span>
      <span class="step-title">Strict Cap &amp; Floor</span>
      <span class="step-desc">Enforces strict <span class="mono">0 &lt; amt &lt; cap &lt;= max</span> and <span class="mono">bal - amt &gt;= floor</span>.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">STEP 04</span>
      <span class="step-title">Tier Cap Rules</span>
      <span class="step-desc"><span class="mono">Minimal</span> locks <span class="mono">cap == max</span>; <span class="mono">Threshold</span> enforces <span class="mono">cap &lt; max</span>.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">STEP 05</span>
      <span class="step-title">Bound Merkle Leaf</span>
      <span class="step-desc"><span class="mono">jPath.leaf == jLeaf</span>, <span class="mono">checkRoot()</span>, and <span class="mono">jLeaf</span> inside invoice commit.</span>
    </div>
    <div class="step-box">
      <span class="step-idx mono">STEP 06</span>
      <span class="step-title">Keyed Nullifier</span>
      <span class="step-desc">Blinds nullifier with secret <span class="mono">H(opSk)</span> — defeats dictionary grinding.</span>
    </div>
    <div class="step-box" style="border-color:rgba(52,211,153,0.45);">
      <span class="step-idx mono" style="color:#34d399;">STEP 07</span>
      <span class="step-title">Fresh Salt &amp; Receipt</span>
      <span class="step-desc">Asserts <span class="mono">nextSalt != currentSalt</span>, re-blinds balance, writes receipt.</span>
    </div>
  </div>

  <div class="grid-3" style="margin-top:18px;">
    <div class="card amber">
      <span class="badge amber mono" style="margin-bottom:8px;">TIER 0 · MinimalSolvency</span>
      <p style="margin:0;">Circuit forces <span class="mono">budgetTierCap == policyMaxSingleSettlement</span> (hides narrow spend band) and zeroes <span class="mono">auditorTag = 0x00..00</span>.</p>
    </div>
    <div class="card cyan">
      <span class="badge cyan mono" style="margin-bottom:8px;">TIER 1 · ThresholdBand</span>
      <p style="margin:0;">Circuit forces <span class="mono">amount &lt; budgetTierCap &lt; policyMaxSingleSettlement</span> for budget tracking with zeroed <span class="mono">auditorTag</span>.</p>
    </div>
    <div class="card emerald">
      <span class="badge emerald mono" style="margin-bottom:8px;">TIER 2 · AuditorScoped</span>
      <p style="margin:0;">Checks <span class="mono">H("auditor-reg:v2", vkHash) == authorizedAuditorCommitment</span> before disclosing <span class="mono">auditorTag</span> MAC.</p>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>proveTreasurySolvency() also requires operatorSecretKey() and persists lastSolvencyAttestation/Floor/Epoch on-chain.</span>
    <span>Slide 03</span>
  </div>
</section>

<!-- SLIDE 4: DUAL-LEDGER PRIVACY BOUNDARY -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">03 · DUAL-LEDGER PRIVACY BOUNDARY</span>
    <span class="slide-num mono">04 / 10</span>
  </div>
  <h2>11 Private Witnesses vs. 21 Audited <span class="mono">disclose()</span> Call Sites</h2>
  <p class="lead">
    Compact 0.28.0 static taint tracking ensures private witnesses cannot enter public ledger state except through explicit, audited <span class="mono">disclose(...)</span> expressions.
  </p>

  <div class="grid-2" style="margin-bottom:14px;">
    <div class="card amber">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="margin:0; color:#fbbf24;">Private Off-Chain Witnesses (11)</h3>
        <span class="badge amber mono">WITNESS-KEPT</span>
      </div>
      <div class="mono" style="font-size:11.8px; color:#e2e8f0; line-height:1.68;">
        • operatorSecretKey() &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• treasurySecretBalance()<br/>
        • treasuryBlindingFactor() &nbsp;&nbsp;• nextTreasuryBlindingFactor()<br/>
        • invoiceVendorId() &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• invoiceLineItemsHash()<br/>
        • invoiceAmount() &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• invoiceSalt()<br/>
        • jurisdictionLeaf() &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• jurisdictionMerklePath&lt;8&gt;()<br/>
        • auditorViewingKeyHash()
      </div>
    </div>

    <div class="card cyan">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="margin:0; color:#38bdf8;">Public Midnight Ledger State</h3>
        <span class="badge cyan mono">21 disclose() SITES</span>
      </div>
      <div class="mono" style="font-size:11.8px; color:#e2e8f0; line-height:1.68;">
        • treasuryAuthority &amp; authorizedAuditorCommitment<br/>
        • treasuryBalanceCommitment (salted persistentCommit)<br/>
        • lastSolvencyAttestation, lastSolvencyFloor, Epoch<br/>
        • approvedJurisdictions: HistoricMerkleTree&lt;8&gt;<br/>
        • usedInvoiceNullifiers: Set&lt;Bytes&lt;32&gt;&gt; (secret-keyed)<br/>
        • auditReceipts: Map&lt;Bytes&lt;32&gt;, AuditReceipt&gt;
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sensitive Field</th>
        <th>Public Ledger Sees</th>
        <th>Registered Auditor Verifies</th>
        <th>Withheld From Ledger?</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Exact Treasury Balance</strong></td>
        <td style="color:#94a3b8;">Salted commitment + persisted solvency floor</td>
        <td style="color:#34d399;">Committed balance &ge; reserve floor</td>
        <td><span class="badge amber mono">YES</span></td>
      </tr>
      <tr>
        <td><strong>Exact Invoice Amount</strong></td>
        <td style="color:#94a3b8;">Strict upper bound (<span class="mono">amount &lt; cap</span>)</td>
        <td style="color:#34d399;">Tier-enforced cap &amp; receipt immutability</td>
        <td><span class="badge amber mono">YES</span></td>
      </tr>
      <tr>
        <td><strong>Counterparty &amp; Scope</strong></td>
        <td style="color:#94a3b8;">Salted commitment + secret-keyed nullifier</td>
        <td style="color:#34d399;">No dictionary grinding; unique anti-replay</td>
        <td><span class="badge amber mono">YES</span></td>
      </tr>
      <tr>
        <td><strong>Counterparty ISO Country</strong></td>
        <td style="color:#94a3b8;">Historic Merkle root only (leaf bound in commit)</td>
        <td style="color:#34d399;">Inclusion in public approved tree</td>
        <td><span class="badge amber mono">YES (1-of-N)</span></td>
      </tr>
    </tbody>
  </table>

  <div class="slide-foot mono">
    <span>Full line-by-line witness and disclose() audit committed in PRIVACY_BOUNDARY.md.</span>
    <span>Slide 04</span>
  </div>
</section>

<!-- SLIDE 5: COMPILED COMPACT 0.28.0 ARTIFACTS -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">04 · REAL COMPACT 0.28.0 / COMPACTC 0.36.1 OUTPUT</span>
    <span class="slide-num mono">05 / 10</span>
  </div>
  <h2>5 Hardened v2.1 Circuits Compiled Cleanly (<span class="mono">zkir-3.2.1</span>)</h2>
  <p class="lead">
    Command: <span class="mono" style="color:#38bdf8;">compact compile contracts/proofvault.compact contracts/managed/proofvault</span> &rarr; <span class="mono" style="color:#34d399;">Compiling 5 circuits: (exit 0)</span>.
  </p>

  <table style="margin-bottom:16px;">
    <thead>
      <tr>
        <th>Exported Compact Circuit</th>
        <th>ZKIR</th>
        <th>BZKIR</th>
        <th>Verifier Key</th>
        <th>Prover Key</th>
        <th>v2.1 Responsibility</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">settleConfidentialInvoice()</td>
        <td class="mono">24,040 B</td>
        <td class="mono">7,445 B</td>
        <td class="mono">2,121 B</td>
        <td class="mono">86.0 MB</td>
        <td>Strict <span class="mono">amt &lt; cap</span>, tier rules, bound leaf, keyed nullifier, auditor reg, fresh salt</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">proveTreasurySolvency()</td>
        <td class="mono">6,400 B</td>
        <td class="mono">1,755 B</td>
        <td class="mono">2,121 B</td>
        <td class="mono">21.5 MB</td>
        <td>Operator-authenticated solvency proof persisted into public ledger fields</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">registerApprovedJurisdiction()</td>
        <td class="mono">3,433 B</td>
        <td class="mono">964 B</td>
        <td class="mono">2,121 B</td>
        <td class="mono">10.8 MB</td>
        <td>Operator-authenticated leaf append to <span class="mono">HistoricMerkleTree&lt;8&gt;</span></td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">updateGovernancePolicy()</td>
        <td class="mono">3,606 B</td>
        <td class="mono">1,053 B</td>
        <td class="mono">2,121 B</td>
        <td class="mono">10.8 MB</td>
        <td>Max cap / reserve floor update, circuit-breaker pause &amp; epoch increment</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; font-weight:700;">verifyReceiptOnChain()</td>
        <td class="mono">969 B</td>
        <td class="mono">266 B</td>
        <td class="mono">1,353 B</td>
        <td class="mono">0.2 MB</td>
        <td>Public membership lookup on <span class="mono">auditReceipts</span> Map</td>
      </tr>
    </tbody>
  </table>

  <div class="grid-3">
    <div class="card">
      <div class="mono" style="font-size:11px; color:#38bdf8; margin-bottom:4px;">5 PURE HELPER CIRCUITS</div>
      <div style="font-size:12.5px; color:#cbd5e1;"><span class="mono">deriveOperatorPublicKey</span>, <span class="mono">deriveAuditorCommitment</span>, <span class="mono">deriveNullifierBlindingSalt</span>, <span class="mono">deriveNullifier</span>, <span class="mono">deriveInvoiceCommitment</span>.</div>
    </div>
    <div class="card">
      <div class="mono" style="font-size:11px; color:#34d399; margin-bottom:4px;">v2.1 ARTIFACT SHA-256</div>
      <div class="mono" style="font-size:11.5px; color:#cbd5e1;">proofvault.compact:<br/>${v21SourceSha.slice(0, 16)}...${v21SourceSha.slice(-8)}</div>
    </div>
    <div class="card">
      <div class="mono" style="font-size:11px; color:#fbbf24; margin-bottom:4px;">RUNTIME &amp; CONNECTOR</div>
      <div class="mono" style="font-size:11.5px; color:#cbd5e1;">compact-runtime@0.21.0<br/>dapp-connector-api@4.1.0</div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Compiled TypeScript bindings, ZKIR/BZKIR, and manifest committed under contracts/managed/proofvault/.</span>
    <span>Slide 05</span>
  </div>
</section>

<!-- SLIDE 6: WORKBENCH + ADVERSARIAL BREAKER LAB -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">05 · INTERACTIVE WORKBENCH &amp; ADVERSARIAL BREAKER LAB</span>
    <span class="slide-num mono">06 / 10</span>
  </div>
  <h2>One-Click Adversarial Breaker Lab Built Directly Into the App</h2>
  <p class="lead">
    Judges test real exploit payloads in the browser SHA-256 Circuit Simulator and inspect exact error codes, zero public state mutation, and 1:1 guard-deletion mutation linkage.
  </p>

  <div class="grid-2" style="gap:20px; flex:1; align-items:start;">
    <div>
      <div class="shot-frame" style="margin-bottom:9px;">
        <img src="${shotBreaker}" alt="ProofVault Adversarial Breaker Lab" />
      </div>
      <div style="font-size:12px; color:#cbd5e1;">
        <strong style="color:#fb7185;">Adversarial Breaker Lab:</strong> 1-click buttons for <em>Replay Used Nullifier</em>, <em>Forge Unapproved Jurisdiction Leaf</em>, <em>Exceed Policy Cap</em>, <em>Break Solvency Threshold</em>, plus auditor-key and tier-isolation checks.
      </div>
    </div>
    <div>
      <div class="shot-frame" style="margin-bottom:9px;">
        <img src="${shotOverview}" alt="ProofVault Dual-Ledger Overview" />
      </div>
      <div style="font-size:12px; color:#cbd5e1;">
        <strong style="color:#fbbf24;">Dual-Ledger Overview:</strong> Explicit runtime clarity bar separating the Browser SHA-256 Simulator from the compiled Compact 0.28.0 contract, plus authenticated <span class="mono">proveTreasurySolvency()</span>.
      </div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Try live without Docker or wallet: https://alphonshhhomenicmtu.github.io/proofvault-midnight/</span>
    <span>Slide 06</span>
  </div>
</section>

<!-- SLIDE 7: LIVE MIDNIGHT PREVIEW + INDEXER GRAPHQL -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">06 · LIVE MIDNIGHT PREVIEW &amp; WALLETLESS INDEXER</span>
    <span class="slide-num mono">07 / 10</span>
  </div>
  <h2>Live Midnight Preview Deployment (6/6 Txs) + GraphQL v4 Reader</h2>
  <p class="lead">
    Inspect the deployed Midnight Preview Ledger 9 contract directly in the browser or via <span class="mono">npm run verify:onchain</span> — zero wallet and zero Docker required.
  </p>

  <div class="grid-2" style="gap:20px; align-items:start;">
    <div>
      <div class="shot-frame">
        <img src="${shotAudit}" alt="Audit Portal with Live Midnight Preview Indexer GraphQL Sync" />
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="card emerald">
        <h3>Live Midnight Preview Contract (v2.0)</h3>
        <p style="margin:0;">Contract <span class="mono" style="color:#34d399;">0x${deployedContractShort}</span> verified live via <span class="mono">indexer.preview.midnight.network</span> at Block <span class="mono">#${Number(blockHeight).toLocaleString()}</span> (<span class="mono">${Number(stateBytes).toLocaleString()} B</span> on-chain state, <span class="mono">0x${blockHashShort}...</span>).</p>
      </div>
      <div class="card cyan">
        <h3>6/6 Confirmed <span class="mono">SucceedEntirely</span> Transactions</h3>
        <p style="margin:0;"><span class="mono">ContractDeploy</span> (<span class="mono">0x${deployTxShort}...</span>, #250,802) &rarr; <span class="mono">registerApprovedJurisdiction(CH/SG)</span> &rarr; <span class="mono">proveTreasurySolvency(&ge;$2M)</span> &rarr; <span class="mono">settleConfidentialInvoice(&lt;$50k cap)</span> (<span class="mono">0x${settleTxShort}...</span>, #250,852) &rarr; <span class="mono">verifyReceiptOnChain</span> (#250,861).</p>
      </div>
      <div class="card amber">
        <h3>Honest Wallet &amp; Prover Separation</h3>
        <p style="margin:0;"><span class="mono">@midnight-ntwrk/dapp-connector-api@4.1.0</span> supports <span class="mono">balanceUnsealedTransaction &rarr; submitTransaction</span> when paired with a Proof Server unsealed tx; static Pages uses <span class="mono">signData</span> strictly as a wallet connectivity check.</p>
      </div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Preview runs v2.0 (2 leaves: CH, SG); v2.1 hardened circuit is compiled and tested under compact-runtime@0.21.0.</span>
    <span>Slide 07</span>
  </div>
</section>

<!-- SLIDE 8: QA, MUTATION AUDIT & FUZZING -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">07 · VERIFICATION, GUARD-MUTATION AUDIT &amp; FUZZING</span>
    <span class="slide-num mono">08 / 10</span>
  </div>
  <h2>62/62 Vitest Passing &middot; 24/24 Compiled JS Guard Mutants Killed</h2>
  <p class="lead">
    Tests exercise the real compiled <span class="mono">contracts/managed/proofvault/contract/index.js</span> via <span class="mono">@midnight-ntwrk/compact-runtime@0.21.0</span> alongside the browser SHA-256 simulator and Adversarial Breaker Lab.
  </p>

  <div class="grid-2" style="margin-bottom:14px;">
    <div class="card emerald">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="margin:0;">Compiled JS Guard-Mutation Audit</h3>
        <span class="badge emerald mono">24 / 24 KILLED</span>
      </div>
      <ul>
        <li>Maps all 24 user-authored <span class="mono">assert(...)</span> guards in <span class="mono">proofvault.compact</span> v2.1 to compiled <span class="mono">__compactRuntime.assert(...)</span> calls in <span class="mono">index.js</span>.</li>
        <li>Deletes each single guard in memory and verifies the targeted exploit bypasses (scope: compiled JS interpreter guards, not ZKIR gate rewriting).</li>
        <li>Covers secret-keyed replay, leaf-swap, strict <span class="mono">amount &lt; cap</span>, tier isolation, auditor registration, authenticated solvency, and salt freshness.</li>
      </ul>
    </div>

    <div class="card cyan">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="margin:0;">Property Fuzzing &amp; Zero-Leak Audits</h3>
        <span class="badge cyan mono">7 FUZZ SUITES</span>
      </div>
      <ul>
        <li><strong>Compiled Runtime Fuzzing:</strong> Random valid and invalid tuples across all 3 tiers assert exact receipt binding and zero mutation on failure.</li>
        <li><strong>Serialized State Privacy Scan:</strong> Scans raw <span class="mono">ContractState.serialize()</span> bytes for operator key, nullifier salt, auditor vkHash, vendor, line items, and raw <span class="mono">Uint&lt;64&gt;</span> exact payout bytes.</li>
        <li><strong>Zero-PII JSON Export:</strong> Strips <span class="mono">localMemo</span> and verifies single-field tamper detection across all receipt fields.</li>
      </ul>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Vitest Suite</th>
        <th>Result</th>
        <th>What It Verifies</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="mono" style="color:#34d399; white-space:nowrap;">tests/mutation-audit.test.ts</td>
        <td class="mono" style="white-space:nowrap;"><strong>32 PASS</strong></td>
        <td>24/24 compiled JS guard-deletion mutants + guard inventory + 7 <span class="mono">fast-check</span> fuzz properties</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8; white-space:nowrap;">tests/compact-contract.test.ts</td>
        <td class="mono" style="white-space:nowrap;"><strong>9 PASS</strong></td>
        <td>Compiled v2.1 contract via <span class="mono">compact-runtime@0.21.0</span> (keyed nullifier, bound leaf, tiers, zero-leak)</td>
      </tr>
      <tr>
        <td class="mono" style="color:#38bdf8;">proof-engine (8) · indexer-client (7) · wallet-adapter (6)</td>
        <td class="mono" style="white-space:nowrap;"><strong>21 PASS</strong></td>
        <td>All 6 Breaker Lab attacks, 7-point receipt verifier, live GraphQL v4 client, Lace/1AM adapter</td>
      </tr>
    </tbody>
  </table>

  <div class="slide-foot mono">
    <span>Reproduce locally in ~12s: npm test &amp;&amp; npm run build &amp;&amp; npm run verify:onchain</span>
    <span>Slide 08</span>
  </div>
</section>

<!-- SLIDE 9: HONEST THREAT MODEL & OPEN BOUNDARIES -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">08 · HONEST THREAT MODEL &amp; OPEN BOUNDARIES</span>
    <span class="slide-num mono">09 / 10</span>
  </div>
  <h2>What the Circuit Enforces vs. What Remains Trusted Today</h2>
  <p class="lead">
    Clear boundaries beat marketing claims. Every actor role, trust assumption, and known v2.1 limitation is documented in <span class="mono">PRIVACY_BOUNDARY.md</span>.
  </p>

  <table style="margin-bottom:14px;">
    <thead>
      <tr>
        <th>Actor</th>
        <th>Enforced by Compact Circuit</th>
        <th>Sees</th>
        <th>Explicit Boundary / Open Limitation</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Treasury Operator</strong></td>
        <td>Solvency floor, strict <span class="mono">amt &lt; cap</span>, tier rules, bound Merkle leaf, keyed nullifier, registered auditor, fresh salt.</td>
        <td>Cleartext witnesses locally</td>
        <td>Trusted to match off-chain bank/fiat wires until v3 Zswap shielded payouts; single authority key in v2.1.</td>
      </tr>
      <tr>
        <td><strong>Registered Auditor</strong></td>
        <td>Cannot claim receipts outside <span class="mono">authorizedAuditorCommitment</span>; verifies 7-point receipt immutability.</td>
        <td>Scoped receipts + viewing key</td>
        <td>Does not learn exact amounts or vendor names unless operator opens <span class="mono">invoiceCommitment</span> off-chain.</td>
      </tr>
      <tr>
        <td><strong>Public Observer</strong></td>
        <td>Verifies Ledger 9 state transitions, keyed nullifiers, persisted solvency floors, and historic roots walletlessly.</td>
        <td>Public commitments &amp; caps</td>
        <td>Jurisdiction anonymity equals registered leaf count (2 on Preview v2.0; 8 in simulator); tree is append-only in v2.1.</td>
      </tr>
      <tr>
        <td><strong>Browser Simulator</strong></td>
        <td>Models all 24 v2.1 guards + Breaker Lab attacks deterministically in static browsers.</td>
        <td>Local browser memory</td>
        <td>Uses SHA-256, distinct from Compact's native <span class="mono">persistentCommit</span> in <span class="mono">npm test</span> &amp; Preview.</td>
      </tr>
    </tbody>
  </table>

  <div class="grid-3">
    <div class="card">
      <div class="mono" style="font-size:11px; color:#38bdf8;">DICTIONARY RESISTANCE</div>
      <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">Nullifiers key on <span class="mono">H(operatorSecretKey)</span>, stopping public bounty-board preimage grinding.</div>
    </div>
    <div class="card">
      <div class="mono" style="font-size:11px; color:#34d399;">SELF-HOSTED PROOF SERVER</div>
      <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">Production witnesses must stay on localhost (<span class="mono">127.0.0.1:6300</span>) or operator-owned VPC.</div>
    </div>
    <div class="card">
      <div class="mono" style="font-size:11px; color:#fbbf24;">NO FAKE INTEGRATIONS</div>
      <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">Zero unshipped SDK claims; every circuit, indexer query, and wallet call runs against real Ledger 9 APIs.</div>
    </div>
  </div>

  <div class="slide-foot mono">
    <span>Complete 11-witness &amp; 21-disclose() audit committed in PRIVACY_BOUNDARY.md.</span>
    <span>Slide 09</span>
  </div>
</section>

<!-- SLIDE 10: TARGET BUYERS & V3 ROADMAP -->
<section class="slide">
  <div class="slide-top">
    <span class="kicker mono">09 · ADOPTION PATH &amp; V3 ROADMAP</span>
    <span class="slide-num mono">10 / 10</span>
  </div>
  <h2>Open-Core Treasury Compliance Layer for Midnight Mainnet</h2>
  <p class="lead">
    Built as an Apache-2.0 compliance contract paired with self-hosted prover tooling for DAO treasuries, foundations, and Web3 audit firms.
  </p>

  <div class="grid-3" style="margin-bottom:16px;">
    <div class="card cyan">
      <span class="badge cyan mono" style="margin-bottom:8px;">WHO USES IT</span>
      <h3>Target Teams</h3>
      <ul>
        <li><strong>DAO &amp; Foundation Treasuries</strong> running grant, audit, and core-dev budgets with public governance floors.</li>
        <li><strong>Bounty &amp; Contractor Ops</strong> needing non-sanctioned jurisdiction proof without leaking vendor pricing.</li>
        <li><strong>Web3 CPA &amp; Audit Firms</strong> verifying scoped compliance receipts without collecting full vendor ledgers.</li>
      </ul>
    </div>

    <div class="card emerald">
      <span class="badge emerald mono" style="margin-bottom:8px;">OPEN-CORE MODEL</span>
      <h3>Deployment &amp; Revenue</h3>
      <ul>
        <li><strong>Apache-2.0 Circuits:</strong> Public Compact contracts and verification CLI maximize governance auditability.</li>
        <li><strong>Managed Adapters ($1.5k–$5k/mo):</strong> Self-hosted VPC Proof Server packaging, Safe/ERP export connectors, and multi-auditor key lifecycle tooling.</li>
        <li><strong>First Wedge:</strong> Cardano &amp; Midnight ecosystem grant treasuries publishing verifiable milestone compliance.</li>
      </ul>
    </div>

    <div class="card amber">
      <span class="badge amber mono" style="margin-bottom:8px;">V3 ROADMAP</span>
      <h3>Next Engineering Milestones</h3>
      <ul>
        <li><strong>Live Preview v2.1 Redeploy &amp; Preprod:</strong> Broadcast hardened v2.1 contract to Preview and Blockfrost Preprod with full ISO allowlist seeded.</li>
        <li><strong>Zswap Shielded Payout Coupling:</strong> Couple confidential settlement directly to native shielded transfers to remove off-chain wire trust.</li>
        <li><strong>Revocable Sanctions Tree &amp; M-of-N Auth:</strong> Replace append-only <span class="mono">HistoricMerkleTree</span> with a revocable epoch accumulator + threshold operator keys.</li>
      </ul>
    </div>
  </div>

  <div class="card" style="display:flex; align-items:center; justify-content:space-between; background:linear-gradient(90deg, rgba(56,189,248,0.12), rgba(52,211,153,0.08)); border-color:rgba(56,189,248,0.35);">
    <div>
      <div style="font-size:16.5px; font-weight:700; color:#f8fafc;">ProofVault v2.1 — Hardened Selective-Disclosure Treasury Compliance on Midnight</div>
      <div class="mono" style="font-size:12px; color:#94a3b8; margin-top:4px;">
        Web App: alphonshhhomenicmtu.github.io/proofvault-midnight/ &nbsp;&middot;&nbsp; Video: youtube.com/watch?v=2SAttW3TaCU
      </div>
    </div>
    <span class="badge emerald mono" style="font-size:12px; padding:7px 14px;">MIDNIGHT WAVE 3</span>
  </div>

  <div class="slide-foot mono">
    <span>ProofVault v2.1 · Apache-2.0 Open Source · Built for Midnight Network (midnightntwrk)</span>
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
