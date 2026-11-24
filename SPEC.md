# ProofVault v2.1 — AKINDO Midnight Buildathon (Wave 3) Technical Specification

## 1. Hackathon & Wave 3 Parameters

- **Event:** Build Privacy-First Apps on Midnight (AKINDO WaveHack)
- **Program URL:** `https://app.akindo.io/wave-hacks/jaMZjqPOBsLXvjdG`
- **Active Wave:** Wave 3 (Final Wave)
- **Wave 3 Submission Deadline:** `2026-11-30 15:00 UTC` (`2026-11-30 23:00 UTC+8`)
- **Wave 3 Judging Period:** `2026-12-01` to `2026-12-15`
- **Wave 3 Prize Pool:** `US$5,000` (top teams invited to Midnight Build Club)
- **License Requirement (Mandatory):** **Apache License 2.0** for all Midnight Compact contracts and evaluation code.
- **GitHub Metadata Requirement (Mandatory):** Public repository tagged with `midnightntwrk`.

## 2. Official Technical Gates & Rubric Dimensions

### Mandatory Gates
1. Public GitHub repository with topic `midnightntwrk`.
2. At least one **Compact smart contract that compiles cleanly** with the official Compact compiler (`compactc 0.36.1`, language `0.28.0`).
3. Apache License 2.0 compliance.
4. Clear `README.md` with exact compile command, compiler output, disclosed vs. witness-kept split, architecture, and verification steps.
5. Pitch slide deck (`docs/proofvault-deck.pdf`) and narrated demo video (`https://www.youtube.com/watch?v=2SAttW3TaCU`).

### Evaluation Dimensions (AKINDO Wave Page)

| Dimension | ProofVault v2.1 Implementation |
| --- | --- |
| **Engineering & Implementation** | Compiles cleanly with `compactc 0.36.1` (`pragma language_version >= 0.28.0`, `zkir-3.2.1`). Uses 11 private witnesses, 21 audited `disclose()` sites, secret-keyed anti-replay nullifiers (`H(H(opSk), vendorId, lineItemsHash)`), jurisdiction-bound invoice commitments, strict `amount < budgetTierCap`, circuit-enforced `MinimalSolvency` / `ThresholdBand` / `AuditorScoped` differentiation, registered `authorizedAuditorCommitment`, authenticated persisted `proveTreasurySolvency`, and `nextSalt != currentSalt` freshness. Live v2.0 contract verified on Midnight Preview (`0x9ae57d40...4228bc8`, 6/6 `SucceedEntirely` txs). |
| **Quality Assurance & Reliability** | **62/62 automated Vitest tests** across 5 suites: real compiled `@midnight-ntwrk/compact-runtime@0.21.0` execution, **24/24 compiled JS guard-deletion mutants killed** (`tests/mutation-audit.test.ts`), 7 `fast-check` property-based fuzz suites, serialized `ContractState` witness & raw `Uint<64>` zero-leak audits, and full Adversarial Breaker Lab test coverage. |
| **Product & Vision** | Confidential DAO / foundation invoice and bounty settlement with selective-disclosure audit receipts across three concrete audience tiers (`MinimalSolvency`, `ThresholdBand`, `AuditorScoped`). |
| **User Experience & Design** | Dark privacy-terminal React/Vite app on GitHub Pages (`base: './'`) featuring explicit runtime labeling (Browser SHA-256 Deterministic Circuit Simulator vs. compiled Compact runtime), 1-click **Adversarial Breaker Lab** (`Breaker Lab` tab), walletless live Midnight Preview Indexer GraphQL v4 reader, and Lace/1AM `@midnight-ntwrk/dapp-connector-api@4.1.0` support. |
| **Communication** | De-slopped README with exact compile command/output, Mermaid dual-ledger diagram, line-by-line [`PRIVACY_BOUNDARY.md`](./PRIVACY_BOUNDARY.md) threat model and limitations, 10-slide PDF pitch deck, and 1080p narrated demo video. |
| **Business Development & Viability** | Open-core Apache-2.0 contract paired with self-hosted VPC Proof Server & Safe/ERP adapters for DAOs, foundations, and Web3 audit firms. |

## 3. Verified Midnight Toolchain Matrix (Ledger 9)

Verified locally on `aarch64-darwin` (`2026-11-24`):

- **Compact CLI (`compact`):** `0.5.3`
- **Compact Compiler (`compactc`):** `0.36.1` (`commit 7fa3a117c`, `2026-11-11`)
- **Compact Language Version:** `0.28.0` (`pragma language_version >= 0.28.0;`)
- **ZKIR Target:** `zkir-3.2.1`
- **Compact Runtime (`@midnight-ntwrk/compact-runtime`):** `0.21.0`
- **DApp Connector API (`@midnight-ntwrk/dapp-connector-api`):** `4.1.0`
- **Midnight Preview Proof Server (used for live Preview txs):** `9.0.2`

## 4. Exported Compact Circuits (`contracts/proofvault.compact` v2.1)

1. `constructor(initOperatorPk, initBalanceCommitment, initAuditorCommitment, maxSingleSettlement, minReserveFloor)` — initializes operator authority digest, registered auditor commitment, initial shielded balance commitment, and public governance limits.
2. `registerApprovedJurisdiction(jurisdictionDigest)` — operator-authorized append to `approvedJurisdictions: HistoricMerkleTree<8, Bytes<32>>`.
3. `proveTreasurySolvency(claimedMinFloor)` — operator-authenticated solvency proof opening `treasuryBalanceCommitment`, asserting `balance >= max(policyMinReserveFloor, claimedMinFloor)`, and persisting `lastSolvencyAttestation`, `lastSolvencyFloor`, and `lastSolvencyEpoch` in ledger state.
4. `settleConfidentialInvoice(budgetTierCap, tier)` — atomic settlement proving active vault, operator key, balance opening, strict `0 < amount < budgetTierCap <= policyMaxSingleSettlement`, post-settlement reserve floor, tier-specific cap constraints, bound Merkle jurisdiction (`jPath.leaf == jLeaf` + `jLeaf` inside `deriveInvoiceCommitment`), unused secret-keyed nullifier, registered auditor commitment (under `AuditorScoped`), and fresh `nextTreasuryBlindingFactor != treasuryBlindingFactor`.
5. `updateGovernancePolicy(newMaxSettlement, newMinReserve, newStatus)` — operator-authenticated policy update, pause/resume toggle, and epoch bump.
6. `verifyReceiptOnChain(receiptId)` — public map membership helper on `auditReceipts`.

## 5. Deliverables Checklist
- [x] `SPEC.md` & `PRIVACY_BOUNDARY.md` (11 witnesses, 21 `disclose()` call sites, honest threat model)
- [x] `LICENSE` (Apache License 2.0)
- [x] `contracts/proofvault.compact` (v2.1, 24 audited guards) + `compactc 0.36.1` compiled outputs (`contracts/managed/proofvault/`)
- [x] Live Midnight Preview deployment (`0x9ae57d40331df50a9a30340d2f2a612f7e6cf8fa99112d11e630c7b3f4228bc8`, 6/6 `SucceedEntirely` txs, [`deploy/preview.json`](./deploy/preview.json))
- [x] `src/midnight/adversarialLab.ts` & `src/components/BreakerLabTab.tsx` — interactive 1-click Adversarial Breaker Lab
- [x] `tests/` — 62/62 Vitest tests passing (including 24/24 compiled JS guard-deletion mutants killed + 7 `fast-check` fuzz suites)
- [x] `dist/` — Production static bundle verified on GitHub Pages (`https://alphonshhhomenicmtu.github.io/proofvault-midnight/`)
- [x] `docs/proofvault-deck.pdf` — 10-slide widescreen visual pitch deck
