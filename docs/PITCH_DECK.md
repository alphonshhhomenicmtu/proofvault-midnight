# ProofVault — Pitch Deck Outline (AKINDO Midnight Buildathon Wave 3)

## Slide 1 — Title
**ProofVault**
Zero-Knowledge Selective-Disclosure Treasury Compliance & Confidential Invoice Settlement on Midnight Network
- Compact `0.28.0` (`compactc 0.36.1`, Ledger 9 / `zkir-3.2.1`)
- Apache-2.0 Open Source · GitHub Topic: `midnightntwrk`

## Slide 2 — The Problem: Transparent Treasuries Leak Strategic Intelligence
- DAOs, protocol foundations, and Web3 enterprises disburse millions in contributor bounties, security audits, and institutional retainers on public chains.
- Publishing transactions on transparent ledgers exposes **exact vendor pricing**, **counterparty identities**, **treasury runway**, and **payroll structures** to competitors and attackers.
- Going completely opaque breaks **DAO governance oversight**, **OFAC/FATF sanctions screening**, and **external financial audits**.

## Slide 3 — The Solution: Programmable Privacy & Selective Disclosure on Midnight
- **ProofVault** leverages Midnight's dual-ledger architecture to prove **7 compliance and solvency invariants** in one atomic zero-knowledge circuit while keeping all business-sensitive data off-chain:
  1. Treasury operator authorization without exposing the signing key
  2. Shielded treasury balance opening (`persistentCommit<Uint<64>>`)
  3. Private payout within public DAO budget tier cap & governance ceiling
  4. Post-settlement solvency maintained above public reserve floor
  5. Non-sanctioned counterparty jurisdiction via `HistoricMerkleTree<8, Bytes<32>>`
  6. Deterministic anti-replay nullifier recorded in `usedInvoiceNullifiers`
  7. Immutable selective-disclosure `AuditReceipt` (`MinimalSolvency` / `ThresholdBand` / `AuditorScoped`)

## Slide 4 — Architecture & Dual-Ledger Data Boundary
- **Off-Chain Private Witness Vault**: exact balance, blinding salts, operator secret key, vendor ID, line items, exact payout amount, exact country code & Merkle path, auditor viewing key.
- **Public Midnight Ledger**: `treasuryBalanceCommitment`, `treasuryAuthority`, `approvedJurisdictions` (`HistoricMerkleTree<8>`), `usedInvoiceNullifiers` (`Set`), `auditReceipts` (`Map`), `settledInvoiceCount` (`Counter`), governance bounds & epoch.

## Slide 5 — Compiled Compact 0.28.0 Circuits (Real ZKIR + Keygen Verified)
| Circuit | ZKIR | BZKIR | Verifier Key | Role |
| --- | ---: | ---: | ---: | --- |
| `settleConfidentialInvoice` | 20,385 B | 6,159 B | 2,121 B | 7-guard atomic confidential settlement |
| `proveTreasurySolvency` | 3,879 B | 998 B | 2,121 B | Zero-knowledge reserve threshold attestation |
| `registerApprovedJurisdiction` | 3,433 B | 964 B | 2,121 B | Compliant ISO jurisdiction tree insertion |
| `updateGovernancePolicy` | 3,606 B | 1,053 B | 2,121 B | Ceiling, floor & circuit-breaker governance |
| `verifyReceiptOnChain` | 969 B | 266 B | 1,353 B | Public on-chain receipt lookup |

## Slide 6 — Quality Assurance, Negative Security Tests & Privacy Audits
- Automated Vitest suite executes the **real compiled Compact 0.28.0 contract** directly on `@midnight-ntwrk/compact-runtime@0.21.0`, plus full parity tests on the browser cryptographic engine.
- Covers happy-path settlements across all 3 disclosure tiers AND negative security proofs: unauthorized operator, over-cap breach, reserve floor violation, sanctioned jurisdiction rejection, double-settlement nullifier replay, paused vault circuit breaker, tampered receipt JSON, wrong auditor key, and **serialized public state privacy-leakage inspection**.

## Slide 7 — Frictionless Judge & User Experience
- **Dual-Mode Frontend** (deployable as static build on GitHub Pages):
  - **Lace Wallet Mode**: `@midnight-ntwrk/dapp-connector-api@4.1.0` (`window.midnight` dynamic UUID discovery + `connect(networkId)` for `preprod` / `preview` / `mainnet`).
  - **Local Proof Engine Mode**: Zero-setup deterministic cryptographic SHA-256 + depth-8 Merkle + nullifier + receipt verifier so any judge or DAO delegate can step through live settlements and verify exported JSON receipts directly in the browser.

## Slide 8 — Market, Target Users & Viability
- **Primary Customers**: Web3 DAO treasuries (Arbitrum, Optimism, Cardano/Midnight foundations), institutional crypto payroll/bounty platforms, security audit firms, and compliance teams.
- **Integration Path**: Drop-in TypeScript SDK adapter + JSON selective-disclosure audit receipts consumable by existing ERP/accounting and DAO governance dashboards.
- **Monetization**: Enterprise multi-sig treasury compliance seats, auditor portal integrations, and managed Midnight proof-server infrastructure.

## Slide 9 — Wave 3 Roadmap & Next Milestones
- **Completed (Wave 3)**: Production `proofvault.compact` compiled on `compactc 0.36.1` (Ledger 9), full Vitest compiled-runtime + privacy audit suite, Lace v4.1 connector, interactive 4-view Privacy Terminal & Audit Verifier.
- **Next (Post-Wave 3)**: Live Midnight Preprod deployment with Lace shielded coin settlement (`receiveShielded` / `sendShielded` Zswap integration), M-of-N threshold operator signatures (`jubjubSchnorrVerify`), and batch payroll Merkle disbursements.
