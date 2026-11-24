# ProofVault v2.1 Privacy Boundary & Disclosure Audit (`contracts/proofvault.compact`)

> **Toolchain:** Compact `0.28.0` / `compactc 0.36.1` (`zkir-3.2.1`) / Midnight Ledger 9 / `@midnight-ntwrk/compact-runtime@0.21.0`
> **Contract SHA-256 (v2.1):** `fc0ac33e60d3c69769b9d501a5a5eee178fcd49ed44360675b87a852625f4a2a`
> **Compiled `index.js` SHA-256:** `b32e86c309610e9fd16804a2fdd1465b22218b24790acf17ab0baea83f3e46fc`
> **License:** Apache-2.0

This audit maps every private `witness`, every `disclose(...)` call site, every trust assumption, and every open limitation of `contracts/proofvault.compact` v2.1.

---

## 1. Private Off-Chain Witness Inventory (11 Witnesses — Never Passed Directly to `disclose()`)

All 11 Compact `witness` functions execute locally in the operator's proving environment. None of their cleartext values are written to public ledger state.

| # | Witness Declaration | Compact Type | Cryptographic Transform Inside Circuit | Plaintext On-Chain? |
|---:|---|---|---|---|
| 1 | `operatorSecretKey()` | `Bytes<32>` | Verified against `treasuryAuthority = H("proofvault:operator:v1", sk)`; also derives secret `nullifierSalt = H("proofvault:nullifier-salt:v2", sk)` | Never |
| 2 | `treasurySecretBalance()` | `Uint<64>` | Opened against `persistentCommit<Uint<64>>(balance, salt)` and range-checked against reserve floor and invoice amount | Never |
| 3 | `treasuryBlindingFactor()` | `Bytes<32>` | Opening randomness for current `treasuryBalanceCommitment`; asserted distinct from `nextTreasuryBlindingFactor()` | Never |
| 4 | `nextTreasuryBlindingFactor()` | `Bytes<32>` | Fresh 256-bit blinding randomness for post-settlement `persistentCommit` (`nextSalt != currentSalt`) | Never |
| 5 | `invoiceVendorId()` | `Bytes<32>` | Absorbed into secret-keyed `deriveNullifier` and salted `deriveInvoiceCommitment` | Never |
| 6 | `invoiceLineItemsHash()` | `Bytes<32>` | Absorbed into secret-keyed `deriveNullifier` and salted `deriveInvoiceCommitment` | Never |
| 7 | `invoiceAmount()` | `Uint<64>` | Strictly range-checked (`0 < amount < publicCap <= policyMaxSingleSettlement` and `balance - amount >= policyMinReserveFloor`), hashed into `deriveInvoiceCommitment` | Never |
| 8 | `invoiceSalt()` | `Bytes<32>` | Blinding factor for `persistentCommit` inside `deriveInvoiceCommitment` | Never |
| 9 | `jurisdictionLeaf()` | `Bytes<32>` | Asserted equal to `jPath.leaf`, checked against `approvedJurisdictions`, **and bound directly into `deriveInvoiceCommitment`** | Never |
| 10 | `jurisdictionMerklePath()` | `MerkleTreePath<8, Bytes<32>>` | Evaluated via `merkleTreePathRoot<8, Bytes<32>>(jPath)`; only the resulting historic root is checked on-chain | Never |
| 11 | `auditorViewingKeyHash()` | `Bytes<32>` | Verified against `authorizedAuditorCommitment = H("proofvault:auditor-reg:v2", vkHash)` when `AuditorScoped`; used as secret MAC key for `auditorTag` | Never |

---

## 2. Circuit-by-Circuit `disclose(...)` Inventory (21 Call Sites)

Compact `0.28.0` enforces compile-time taint tracking (`compactc 0.36.1`). Every `disclose(...)` call in `contracts/proofvault.compact` v2.1 is accounted for below:

| Circuit | Line | Disclosed Expression | Ledger Sink | Leakage & Justification |
|---|---:|---|---|---|
| `constructor` | 134 | `disclose(initOperatorPk)` | `treasuryAuthority` | One-way 32-byte digest of `operatorSecretKey`. Anchor for private operator proofs. |
| `constructor` | 135 | `disclose(initAuditorCommitment)` | `authorizedAuditorCommitment` | Second-level digest `H("proofvault:auditor-reg:v2", auditorVkHash)`. Prevents operators from tagging `AuditorScoped` receipts with arbitrary unregistered keys while keeping `auditorVkHash` secret so public observers cannot recompute `auditorTag`. |
| `constructor` | 136 | `disclose(initBalanceCommitment)` | `treasuryBalanceCommitment` | Hiding `persistentCommit<Uint<64>>(balance, salt)`. Note: constructor does not open the commitment; opening occurs on the first `proveTreasurySolvency` or `settleConfidentialInvoice` call. |
| `constructor` | 137 | `disclose(maxSingleSettlement)` | `policyMaxSingleSettlement` | Public governance spending ceiling (`Uint<64>`). |
| `constructor` | 138 | `disclose(minReserveFloor)` | `policyMinReserveFloor` | Public governance solvency floor (`Uint<64>`). |
| `registerApprovedJurisdiction` | 153 | `disclose(jurisdictionDigest)` | `approvedJurisdictions.insert(...)` | Approved jurisdiction allowlist is intentionally public policy. Which leaf matched a settlement stays private within the registered tree. |
| `proveTreasurySolvency` | 177 | `disclose(attestation)` | `lastSolvencyAttestation` + return | Operator-authenticated digest `H("proofvault:solvency:v1", commitment, H(claimedMinFloor))`. Persisted in ledger state so indexers can verify past solvency claims. |
| `proveTreasurySolvency` | 179 | `disclose(claimedMinFloor)` | `lastSolvencyFloor` | Public threshold proved by the operator (`balance >= claimedMinFloor`). Exact balance and margin above floor stay hidden. |
| `settleConfidentialInvoice` | 207 | `disclose(tier)` | `AuditReceipt.disclosureTier` | 2-bit enum (`0`, `1`, or `2`). Enforces distinct cap and auditor-tag rules on-chain. |
| `settleConfidentialInvoice` | 208 | `disclose(budgetTierCap)` | `AuditReceipt.budgetTierCap` | Public upper bound (`amount < budgetTierCap` strictly). Under `MinimalSolvency`, forced equal to `policyMaxSingleSettlement`; under `ThresholdBand`, forced strictly below `policyMaxSingleSettlement`. |
| `settleConfidentialInvoice` | 233 | `disclose(computedRoot)` | `approvedJurisdictions.checkRoot(...)` | Already-public root of `approvedJurisdictions`; reveals which tree snapshot was active, not which leaf matched. |
| `settleConfidentialInvoice` | 244 | `disclose(nullifier)` | `usedInvoiceNullifiers` + `AuditReceipt.nullifier` | Secret-keyed 32-byte PRF output `H("proofvault:nullifier:v2", H("proofvault:nullifier-salt:v2", opSk), vendorId, lineItemsHash)`. Prevents double-settlement without allowing offline dictionary attacks over vendor names or cross-vault correlation. |
| `settleConfidentialInvoice` | 254 | `disclose(invoiceCommitment)` | `AuditReceipt.invoiceCommitment` | Salted `persistentCommit` binding `(vendorId, lineItemsHash, H(amount), jLeaf)` under 256-bit `invoiceSalt`. Binding `jLeaf` prevents opening an approved leaf while committing a different country. |
| `settleConfidentialInvoice` | 257 | `disclose(computedRoot.field)` | Hashed into `AuditReceipt.jurisdictionRoot` | Public historic tree root field bound to the receipt. |
| `settleConfidentialInvoice` | 275 | `disclose(rawAuditorTag)` | `AuditReceipt.auditorTag` (`AuditorScoped` only) | Secret-keyed MAC `H("proofvault:auditor:v1", vkHash, invoiceCommitment)` where `vkHash` is proven to hash to `authorizedAuditorCommitment`. Zeroed (`0x00..00`) under `MinimalSolvency` and `ThresholdBand`. |
| `settleConfidentialInvoice` | 278 | `disclose(receiptId)` | `auditReceipts` map key + return | Deterministic hash of `(tag, publicInvoiceCommitment, publicNullifier)`. Derived strictly from already-public commitments. |
| `settleConfidentialInvoice` | 290 | `disclose(nextCommitment)` | `treasuryBalanceCommitment` | Re-blinded `persistentCommit` of `balance - amount` under a fresh `nextTreasuryBlindingFactor != treasuryBlindingFactor`. |
| `updateGovernancePolicy` | 323–325 | `disclose(newMaxSettlement)`, `disclose(newMinReserve)`, `disclose(newStatus)` | Governance ledger fields | Public policy limits and pause flag; `operatorSecretKey` stays private. |
| `verifyReceiptOnChain` | 334 | `disclose(receiptId)` | `auditReceipts.member(...)` | Convenience public membership check on an already-public map key. |

---

## 3. Selective-Disclosure Tiers (Circuit-Enforced Rules in v2.1)

| Disclosure Tier | Circuit Rule on `budgetTierCap` | Circuit Rule on `auditorTag` | What an Observer Learns |
|---|---|---|---|
| `MinimalSolvency` (`0`) | Must equal `policyMaxSingleSettlement` (cannot leak a narrow custom cap); `amount < publicCap` strictly | Deterministically zeroed (`0x00..00`) | Payout was below the global vault ceiling, reserves stayed above floor, and counterparty belongs to an approved jurisdiction |
| `ThresholdBand` (`1`) | Must satisfy `amount < publicCap < policyMaxSingleSettlement` strictly | Deterministically zeroed (`0x00..00`) | Payout fell strictly below a narrower budget band cap (e.g., `< $25k`, `< $50k`, `< $100k`), with zero auditor linkage |
| `AuditorScoped` (`2`) | Must satisfy `amount < publicCap <= policyMaxSingleSettlement` strictly | `H("proofvault:auditor:v1", vkHash, invoiceCommitment)` with `deriveAuditorCommitment(vkHash) == authorizedAuditorCommitment` | Same compliance invariants plus a verifiable MAC bound to the vault's registered external auditor |

---

## 4. Actor Threat Model (What Is Enforced vs. What Is Trusted)

| Actor | What They See | What the Circuit Enforces | Explicit Operational Trust Assumption |
|---|---|---|---|
| **Treasury Operator** | All 11 private witnesses in cleartext locally | Cannot forge solvency above committed balance, cannot pay `>= budgetTierCap`, cannot exceed `policyMaxSingleSettlement`, cannot drain below `policyMinReserveFloor`, cannot swap `jurisdictionLeaf` vs Merkle path, cannot settle an unlisted country, cannot replay a nullifier, cannot forge an unregistered auditor key under `AuditorScoped`, and cannot reuse `treasuryBlindingFactor`. | **Operator sees cleartext** and is trusted to match off-chain fiat/bank wires (or external transfers) to the committed `invoiceAmount` and to back up `nextTreasuryBlindingFactor` safely (losing the salt blocks future commitment openings). Native Zswap shielded payouts are planned for v3. |
| **Registered External Auditor** | Public ledger state, exported receipt JSON, and `auditorViewingKey` | Verifies `deriveAuditorCommitment(vkHash) == authorizedAuditorCommitment`, `auditorTag`, receipt field immutability, keyed nullifier membership, and Merkle root history. | Does not see exact amounts, vendor identities, or line items unless the operator selectively opens `invoiceCommitment` off-chain during a dispute. |
| **Counterparty / Vendor** | Their own invoice and receipt ID | Isolated from peer vendor payouts, peer countries, and total treasury reserves; cannot grind other vendors' nullifiers without `operatorSecretKey`. | Can verify receipt existence via `verifyReceiptOnChain(receiptId)` or the Midnight Indexer GraphQL API. |
| **Public Observer / DAO Delegate** | Commitments, keyed nullifiers, historic Merkle root, tier-enforced caps, persisted solvency records, epoch, and pause status | Verifies Ledger 9 SNARK state transitions directly via Midnight Indexer GraphQL (`Audit Portal` or `npm run verify:onchain`) without a wallet. | Does not learn exact balance, exact payout, vendor identity, scope, or country code (within the anonymity set of registered leaves). |
| **Midnight Proof Server** | Receives private witnesses during proof generation | N/A (executes ZKIR prover locally) | Operators must run Proof Server `9.0.2` locally (`127.0.0.1:6300`) or inside their own VPC — never submit production witnesses to an untrusted remote prover. |

---

## 5. Known Limitations & Honest Boundaries (v2.1)

1. **Append-Only Jurisdiction Tree (`HistoricMerkleTree<8, Bytes<32>>`):** `approvedJurisdictions` supports historical roots for concurrent async proof generation, and leaves are not revocable in v2.1. If a jurisdiction is later sanctioned, an older root remains accepted by `checkRoot`. Production v3 will replace `checkRoot` with a revocable current-epoch accumulator.
2. **Anonymity Set Size on Live Preview vs. Simulator:** The live Midnight Preview v2.0 deployment (`0x9ae57d40...4228bc8`) has 2 registered leaves (`iso:CH`, `iso:SG`), which is a 1-of-2 jurisdiction anonymity set. The browser simulator seeds 8 leaves (1-of-8). Production deployments should seed the full non-sanctioned ISO-3166 allowlist before settling invoices.
3. **Single Operator Authority Key:** `treasuryAuthority` is a single `Bytes<32>` key hash in v2.1 without on-chain key rotation or M-of-N threshold approval. Multi-party governance currently relies on holding `operatorSecretKey` inside an HSM/MPC quorum; native M-of-N Jubjub Schnorr threshold circuits are scoped for v3.
4. **Browser Demo vs. Compiled Compact Runtime:** The static GitHub Pages web app runs a **SHA-256 Deterministic Circuit Simulator** (`src/midnight/proofEngine.ts`) to make all 24 invariants and the Adversarial Breaker Lab interactive with zero Docker or wallet setup. Midnight's actual Compact circuit (`contracts/managed/proofvault/`) uses Compact's native `persistentHash`/`persistentCommit` builtins (`@midnight-ntwrk/compact-runtime@0.21.0`) and is exercised in `npm test` and live on Midnight Preview.
5. **Scope of Guard-Mutation Testing:** `tests/mutation-audit.test.ts` deletes all 24 user-authored `__compactRuntime.assert(...)` calls one by one inside the compiled JS runtime (`contracts/managed/proofvault/contract/index.js`) and confirms 24/24 targeted exploits succeed when their guard is removed. This proves 100% guard coverage at the compiled JS runtime level; it does not mutate ZKIR gate constraints directly.
