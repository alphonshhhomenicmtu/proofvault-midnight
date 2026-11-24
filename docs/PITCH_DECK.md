# ProofVault v2.1 — 10-Slide Pitch Deck (AKINDO Midnight Wave 3)

> **Compiled Visual PDF Deck:** [`docs/proofvault-deck.pdf`](./proofvault-deck.pdf) (16:9 widescreen, 10 slides, reproducible via `npm run build:deck`).

1. **Slide 1 — Cover:** ProofVault v2.1 — Confidential Invoice & Bounty Settlement with Selective-Disclosure Audit Receipts on Midnight Network (Compact `0.28.0` / `compactc 0.36.1` Ledger 9, 62/62 Vitest, 24/24 compiled JS guards killed, Apache-2.0).
2. **Slide 2 — Problem:** Public chains expose vendor rates, contractor compensation, and treasury runway; private off-chain wires break governance solvency and sanctions verification.
3. **Slide 3 — Hardened v2.1 Atomic Circuit:** `settleConfidentialInvoice()` enforces strict `amount < budgetTierCap`, secret-keyed nullifiers, jurisdiction-bound commitments, fresh blinding salts, and distinct `MinimalSolvency` / `ThresholdBand` / `AuditorScoped` tier rules.
4. **Slide 4 — Dual-Ledger Privacy Boundary:** Line-by-line split between 11 off-chain witnesses and 21 audited `disclose(...)` call sites in `contracts/proofvault.compact` v2.1.
5. **Slide 5 — Real Compact 0.28.0 / `compactc 0.36.1` Artifacts:** Exact compile command, ZKIR/BZKIR/verifier/prover sizes (`24,040 B` settle, `6,400 B` solvency), and SHA-256 manifests for all 5 compiled Ledger 9 circuits.
6. **Slide 6 — Interactive Workbench & Adversarial Breaker Lab:** Live screenshots of the Dual-Ledger Overview and the 1-click **Adversarial Breaker Lab** (Replay Used Nullifier, Forge Unapproved Jurisdiction Leaf, Exceed Policy Cap, Break Solvency Threshold).
7. **Slide 7 — Live Midnight Preview Deployment & Walletless Indexer:** Verified live Preview v2.0 contract `0x9ae57d40...4228bc8` (6/6 `SucceedEntirely` txs, blocks `#250,802`–`#250,861`, `11,697 B` state) + walletless GraphQL v4 reader + Lace/1AM `dapp-connector-api@4.1.0`.
8. **Slide 8 — Verification, Guard-Mutation Audit & Fuzzing:** 62/62 Vitest passing, 24/24 compiled JS guard-deletion mutants killed (`tests/mutation-audit.test.ts`), 7 `fast-check` fuzz suites, and serialized `ContractState` zero-leak checks.
9. **Slide 9 — Honest Threat Model & Open Boundaries:** Explicit separation between Browser SHA-256 Simulator vs. compiled Compact runtime, operator cleartext scope, append-only `HistoricMerkleTree`, and Preview 1-of-2 vs. simulator 1-of-8 leaf set.
10. **Slide 10 — Target Users, Open-Core Model & v3 Roadmap:** DAO/foundation finance teams, self-hosted VPC Proof Server & ERP adapters, and v3 roadmap to Zswap native shielded transfers, revocable jurisdiction accumulator, and M-of-N threshold operator auth.
