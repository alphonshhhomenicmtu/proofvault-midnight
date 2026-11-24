# ProofVault — 10-Slide Institutional Pitch Deck (AKINDO Midnight Wave 3)

> **Compiled Visual PDF Deck:** [`docs/proofvault-deck.pdf`](./proofvault-deck.pdf) (16:9 widescreen, 10 institutional slides, reproducible via `npm run build:deck`).

1. **Slide 1 — Cover:** ProofVault — Zero-Knowledge Selective-Disclosure Treasury Compliance & Confidential Invoice Settlement on Midnight Network (Compact `0.28.0` / `compactc 0.36.1` Ledger 9, 52/52 tests, 18/18 guard mutants killed, Apache-2.0).
2. **Slide 2 — The Institutional Privacy Dilemma:** Transparent chains leak vendor rates, payroll, and runway; opaque off-chain rails destroy governance solvency proofs and OFAC/FATF compliance.
3. **Slide 3 — Atomic ZK Settlement Solution:** Seven cryptographic invariants verified in `settleConfidentialInvoice()` across 3 selective-disclosure tiers (`MinimalSolvency`, `ThresholdBand`, `AuditorScoped`).
4. **Slide 4 — Dual-Ledger Privacy Boundary:** Strict compile-time isolation between the 11 off-chain private witnesses and Midnight's public ledger commitments, `HistoricMerkleTree<8>`, and anti-replay nullifiers.
5. **Slide 5 — Real Compact 0.28.0 / `compactc 0.36.1` Circuits:** Exact ZKIR, BZKIR, Verifier Key, Prover Key metrics and SHA-256 artifact manifests for all 5 compiled Ledger 9 circuits.
6. **Slide 6 — Interactive Privacy Terminal Showcase:** Retina V2 walkthrough of the Dual-Ledger Overview Workbench, `proveTreasurySolvency()`, and 6-Stage Confidential Settlement Pipeline.
7. **Slide 7 — Live Walletless Indexer GraphQL & Wallet Dispatch:** Direct browser verification against `indexer.preview.midnight.network/api/v4/graphql` (zero wallet, zero Docker) + Lace / 1AM `window.midnight` (`dapp-connector-api@4.1.0`) `balanceUnsealedTransaction -> submitTransaction` / `signData` dispatch + turnkey `scripts/deploy-testnet.mjs`.
8. **Slide 8 — Security, Guard-Mutation Audit & Fuzzing Proof:** 52/52 Vitest pass, 18/18 Compact `assert()` guard-deletion mutants killed (100% kill score), 7 `fast-check` fuzz suites (catching a real `settledEpoch` tamper check), and `ContractState.serialize()` zero-leak proof.
9. **Slide 9 — Trust Model & `disclose()` Boundary Audit:** Explicit Trusted vs. Trustless role matrix and exhaustive 16-site `disclose()` justification committed in `PRIVACY_BOUNDARY.md`.
10. **Slide 10 — Institutional DAO GTM, Monetization & Roadmap:** DAO/Foundation target buyers, Safe/ERP adapter monetization, and roadmap to Zswap shielded payouts and M-of-N Jubjub Schnorr multisig.
