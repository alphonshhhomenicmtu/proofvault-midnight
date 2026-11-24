# ProofVault — AKINDO Midnight Buildathon (Wave 3) Technical Specification

## 1. Hackathon & Wave 3 Parameters

- **Event:** Build Privacy-First Apps on Midnight (AKINDO WaveHack)
- **Program URL:** `https://app.akindo.io/wave-hacks/jaMZjqPOBsLXvjdG`
- **Active Wave:** Wave 3 (Final Wave)
- **Wave 3 Submission Deadline:** `2026-11-30 15:00 UTC` (`2026-11-30 23:00 UTC+8`)
- **Wave 3 Judging Period:** `2026-12-01` to `2026-12-15`
- **Reward Pool:** `4,000–5,000 USDT` (Grant Pool `12,500 USDT` total across 3 Waves, distributed proportionally by judge score; top teams also invited to Midnight Build Club)
- **License Requirement (Mandatory):** **Apache License 2.0** for all newly developed Midnight-related code including Compact contracts and evaluation code.
- **GitHub Metadata Requirement (Mandatory):** Public repository tagged with topic/label `midnightntwrk`.

## 2. Official Judging Rubric & Technical Gates

### Mandatory Technical Gate (Auto-Disqualification if Unmet)
1. Public GitHub repository with the `midnightntwrk` topic tag.
2. At least one **Compact smart contract that compiles cleanly** with the official Compact compiler.
3. Apache License 2.0 compliance for all Midnight contract and evaluation code.
4. Clear `README.md` with setup, architecture, Midnight integration, and judge test instructions.
5. Pitch slide deck + demo video / walkthrough script.

### Weighted Evaluation Rubric

| Criterion | Weight | ProofVault Alignment |
| --- | ---: | --- |
| **Engineering & Implementation** | **40%** | Compiles cleanly under `compactc 0.36.1` (Compact language `0.28.0`, Ledger 9 / `zkir-3.2.1`), real `witness` private-state isolation, explicit `disclose()` audit boundary, `HistoricMerkleTree<8, Bytes<32>>` jurisdiction proofs, `persistentCommit` treasury solvency commitments, `Set<Bytes<32>>` nullifier anti-replay, `@midnight-ntwrk/compact-runtime@0.21.0` + `@midnight-ntwrk/dapp-connector-api@4.1.0`. |
| **Quality Assurance & Reliability** | **15%** | Comprehensive Vitest suite executing BOTH the **real compiled Compact contract runtime** (`@midnight-ntwrk/compact-runtime`) and the browser-side deterministic circuit-equivalence engine across positive flows, negative security guards (replay, reserve breach, unauthorized operator, sanctioned jurisdiction, paused vault), and on-chain privacy leakage audits. |
| **Product & Vision** | **15%** | Targets Midnight's #1 flagship enterprise/DAO vertical (*Finance: prove solvency, transaction validity, and compliance without disclosing balances or counterparties*) via Confidential Invoice/Bounty Settlement & Selective-Disclosure Audit Receipts. |
| **User Experience & Design** | **15%** | Dark privacy-terminal React/Vite dApp deployable on GitHub Pages (`base: './'`) featuring dual execution modes: **Lace Wallet (`window.midnight`)** for live Midnight networks AND **Local Proof Engine** so judges can run full cryptographic settlements and verify selective-disclosure receipts immediately with zero wallet setup. |
| **Communication** | **10%** | Clean README with Mermaid dual-ledger ZK dataflow diagram, complete setup & test guide, 2-minute video demo script, pitch deck outline (`docs/PITCH_DECK.md`), and high-resolution Retina screenshots. |
| **Business Development & Viability** | **5%** | Concrete GTM path for DAOs, Web3 treasury ops, institutional B2B contractors, and compliance auditors requiring FATF/OFAC non-sanction attestations without leaking vendor pricing or balance sheets. |

## 3. Verified Midnight Toolchain & SDK Matrix (Ledger 9 Era)

Verified locally on `aarch64-darwin` (`2026-11-24`):

- **Compact CLI (`compact`):** `0.5.3`
- **Compact Compiler (`compactc`):** `0.36.1` (`commit 7fa3a117c`, `2026-11-11`)
- **Compact Language Version:** `0.28.0` (`pragma language_version >= 0.28.0;`)
- **ZKIR Target:** `zkir-3.2.1` (`zkir-v3` binary included in toolchain)
- **Compact Runtime (`@midnight-ntwrk/compact-runtime`):** `0.21.0`
- **DApp Connector API (`@midnight-ntwrk/dapp-connector-api`):** `4.1.0`
- **Midnight.js Contracts (`@midnight-ntwrk/midnight-js-contracts`):** `5.0.1`
- **Lace Wallet Integration Pattern (v4.x):**
  - Dynamic UUID provider discovery over `window.midnight` (`Object.entries(window.midnight ?? {})`), with graceful fallback for `window.midnight.mnLace`.
  - Network-scoped session connection via `initialApi.connect(networkId)` (`'preprod' | 'preview' | 'mainnet' | 'undeployed'`).
  - Provider URI discovery via `connectedApi.getConfiguration()` (`indexerUri`, `indexerWsUri`, `proverServerUri`, `substrateNodeUri`, `networkId`).
  - Address queries via `connectedApi.getShieldedAddresses()`, `getUnshieldedAddress()`, and `getDustAddress()`.

## 4. ProofVault Architecture & Dual-Ledger Privacy Model

### What Remains Strictly Private (Off-Chain Witness State)
- `operatorSecretKey: Bytes<32>` — treasury controller secret key (never exposed on-chain)
- `treasurySecretBalance: Uint<64>` — exact DAO/company treasury balance in USD cents
- `treasuryBlindingFactor` / `nextTreasuryBlindingFactor: Bytes<32>` — cryptographic hiding salts for `persistentCommit`
- `invoiceVendorId: Bytes<32>` — private counterparty / contributor identifier
- `invoiceLineItemsHash: Bytes<32>` — hash of confidential scope of work, deliverables, and line-item pricing
- `invoiceAmount: Uint<64>` — exact payout amount
- `invoiceSalt: Bytes<32>` — invoice commitment blinding factor
- `jurisdictionLeaf: Bytes<32>` & `jurisdictionMerklePath: MerkleTreePath<8, Bytes<32>>` — counterparty's ISO jurisdiction code and Merkle inclusion proof (proves non-sanctioned eligibility without disclosing which country)
- `auditorViewingKeyHash: Bytes<32>` — optional auditor-specific viewing key commitment

### What Is Published On-Chain (Public Midnight Ledger)
- `treasuryAuthority: Bytes<32>` — domain-separated `persistentHash` of the operator key
- `treasuryBalanceCommitment: Bytes<32>` — `persistentCommit<Uint<64>>(balance, salt)`
- `policyMaxSingleSettlement: Uint<64>` & `policyMinReserveFloor: Uint<64>` — public DAO governance guardrails
- `currentEpoch: Uint<64>` & `vaultStatus: VaultStatus` — vault lifecycle state
- `approvedJurisdictions: HistoricMerkleTree<8, Bytes<32>>` — Merkle tree of compliant jurisdictions (supports historical roots for concurrent async transactions)
- `usedInvoiceNullifiers: Set<Bytes<32>>` — deterministic anti-replay nullifiers preventing double settlement
- `auditReceipts: Map<Bytes<32>, AuditReceipt>` — verifiable selective-disclosure compliance receipts
- `settledInvoiceCount: Counter` — write-only monotonic settlement counter

### Exported Compact Circuits (`contracts/proofvault.compact`)
1. `constructor(initOperatorPk, initBalanceCommitment, maxSingleSettlement, minReserveFloor)` — boots the vault with initial governance guardrails and shielded balance commitment.
2. `registerApprovedJurisdiction(jurisdictionDigest)` — operator-authorized insertion into `approvedJurisdictions` `HistoricMerkleTree`.
3. `proveTreasurySolvency(claimedMinFloor)` — generates a verifiable on-chain solvency attestation proving committed balance `>= claimedMinFloor` and `>= policyMinReserveFloor` without revealing the exact balance.
4. `settleConfidentialInvoice(budgetTierCap, tier)` — atomic ZK circuit proving: active vault, operator key ownership, treasury commitment opening, `0 < amount <= budgetTierCap <= policyMaxSingleSettlement`, post-settlement solvency (`balance - amount >= policyMinReserveFloor`), `HistoricMerkleTree` jurisdiction compliance, and unused nullifier; transitions `treasuryBalanceCommitment` and stores a selective-disclosure `AuditReceipt`.
5. `updateGovernancePolicy(newMaxSettlement, newMinReserve, newStatus)` — operator-authenticated governance parameter rotation and circuit breaker toggle.
6. `verifyReceiptOnChain(receiptId)` — public verification circuit returning whether a receipt exists in `auditReceipts`.

## 5. Deliverables Checklist
- [x] `SPEC.md` (this document)
- [x] `LICENSE` (Apache License 2.0)
- [x] `contracts/proofvault.compact` + compiled ZKIR/TS artifacts verified with `compactc 0.36.1` (all 5 circuits compiled with `.zkir`, `.bzkir`, `.prover`, `.verifier`)
- [x] `src/midnight/` — Lace Wallet v4.1 connector (`@midnight-ntwrk/dapp-connector-api@4.1.0`) + deterministic local proof engine matching compiled Compact semantics
- [x] `src/` — Dark privacy-terminal React/Vite frontend (4 views: Overview, Settle Invoice, Audit Portal, Compact Spec)
- [x] `tests/` — Vitest unit, security, privacy-leakage, wallet connector, and real compiled Compact runtime integration tests (16/16 PASS)
- [x] `dist/` — Production static bundle verified for GitHub Pages (`base: './'`)
- [x] `docs/screenshots/` — 4 Retina screenshots (`2880x1800`) visually verified with zero clipping or overflow
- [x] `README.md` + `docs/PITCH_DECK.md` — Mermaid ZK architecture diagram, judge quickstart, 2-minute demo script
