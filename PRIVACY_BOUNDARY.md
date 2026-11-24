# ProofVault Privacy Boundary & Disclosure Audit (`contracts/proofvault.compact`)

> **Toolchain:** Compact `0.28.0` / `compactc 0.36.1` (`zkir-3.2.1`) / Midnight Ledger 9 / `@midnight-ntwrk/compact-runtime@0.21.0`
> **Contract SHA-256:** `f6f74e26e7a0871970a821ce99b53936b45c4ceb5525b81654b34992c9a7cc68`
> **License:** Apache-2.0

This document provides a formal, line-by-line privacy boundary audit of `contracts/proofvault.compact`. Every `witness` input, every `disclose(...)` call site, and every trust boundary across actors is documented explicitly so security reviewers and DAO governance teams can verify that ProofVault achieves **minimal necessary disclosure** without accidental bit-leaks.

---

## 1. Private Off-Chain Witness Inventory (Never Disclosed in Plaintext)

All 11 Compact `witness` functions execute exclusively inside the operator's local proving environment (`PrivateWitnessVault`). None of these values are ever passed directly to `disclose()`.

| # | Witness Declaration | Compact Type | Cryptographic Transform Inside Circuit | Plaintext Ever On-Chain? |
|---:|---|---|---|---|
| 1 | `operatorSecretKey()` | `Bytes<32>` | Domain-separated hash `deriveOperatorPublicKey(sk) == treasuryAuthority` | **Never** |
| 2 | `treasurySecretBalance()` | `Uint<64>` | Opened against `persistentCommit<Uint<64>>(balance, salt)` and compared against bounds | **Never** |
| 3 | `treasuryBlindingFactor()` | `Bytes<32>` | Consumed as randomness in `persistentCommit` opening | **Never** |
| 4 | `nextTreasuryBlindingFactor()` | `Bytes<32>` | Consumed as fresh blinding randomness in post-settlement `persistentCommit` | **Never** |
| 5 | `invoiceVendorId()` | `Bytes<32>` | Absorbed into `deriveNullifier` and `deriveInvoiceCommitment` | **Never** |
| 6 | `invoiceLineItemsHash()` | `Bytes<32>` | Absorbed into `deriveNullifier` and `deriveInvoiceCommitment` | **Never** |
| 7 | `invoiceAmount()` | `Uint<64>` | Range-checked (`0 < amt <= cap <= max` and `bal - amt >= floor`), hashed into `deriveInvoiceCommitment` | **Never** |
| 8 | `invoiceSalt()` | `Bytes<32>` | Blinding factor for `persistentCommit` in `deriveInvoiceCommitment` | **Never** |
| 9 | `jurisdictionLeaf()` | `Bytes<32>` | Verified equal to `jPath.leaf`; hashed upward along Merkle path | **Never** |
| 10 | `jurisdictionMerklePath()` | `MerkleTreePath<8, Bytes<32>>` | Evaluated via `merkleTreePathRoot<8, Bytes<32>>(jPath)`; only root checked against `HistoricMerkleTree` | **Never** |
| 11 | `auditorViewingKeyHash()` | `Bytes<32>` | Combined with `invoiceCommitment` under `"proofvault:auditor:v1"` tag (only when `AuditorScoped`) | **Never** |

---

## 2. Exhaustive Circuit-by-Circuit `disclose()` Justification Matrix

Every `disclose(...)` invocation in `contracts/proofvault.compact` is audited below. Compact enforces static information-flow taint tracking at compile time (`compactc 0.36.1`), meaning **no other private value can reach public ledger state** outside these exact lines.

| Circuit | Line | Disclosed Expression | Ledger Sink | Information-Theoretic Leakage | Justification |
|---|---:|---|---|---|---|
| `constructor` | 107 | `disclose(initOperatorPk)` | `treasuryAuthority` | Public operator key digest (32 B) | Required anchor for private operator authorization proofs. Derived via one-way `persistentHash`; reveals zero bits of `operatorSecretKey`. |
| `constructor` | 108 | `disclose(initBalanceCommitment)` | `treasuryBalanceCommitment` | Hiding commitment (32 B) | Cryptographically hides initial treasury balance under 256-bit `treasuryBlindingFactor`. |
| `constructor` | 109 | `disclose(maxSingleSettlement)` | `policyMaxSingleSettlement` | Public DAO ceiling (`Uint<64>`) | Governance guardrail explicitly intended to be publicly auditable by tokenholders. |
| `constructor` | 110 | `disclose(minReserveFloor)` | `policyMinReserveFloor` | Public solvency floor (`Uint<64>`) | Public reserve threshold required for meaningful external solvency proofs. |
| `registerApprovedJurisdiction` | 122 | `disclose(jurisdictionDigest)` | `approvedJurisdictions.insert(...)` | Approved jurisdiction leaf digest | Governance allowlist (non-sanctioned ISO codes) is intentionally public policy; individual counterparty selection remains private during settlement. |
| `proveTreasurySolvency` | 143 | `disclose(attestation)` | Return value (`Bytes<32>`) | Binding digest of `(tag, commitment, hash(claimedMinFloor))` | Proves `balance >= max(policyMinReserveFloor, claimedMinFloor)` without leaking exact balance or margin above floor. |
| `settleConfidentialInvoice` | 181 | `disclose(computedRoot)` | `approvedJurisdictions.checkRoot(...)` | Historic Merkle root (publicly known) | Root is already public state in `approvedJurisdictions`; reveals **which policy snapshot** was used, never which leaf/country matched. |
| `settleConfidentialInvoice` | 191 | `disclose(nullifier)` | `usedInvoiceNullifiers` + `AuditReceipt.nullifier` | Pseudorandom 32 B tag `H("proofvault:nullifier:v1", vendorId, lineItemsHash)` | Prevents double-settlement of the same invoice. Reveals zero bits of vendor identity or scope provided `vendorId` and `lineItemsHash` have high entropy. |
| `settleConfidentialInvoice` | 195 | `disclose(invoiceCommitment)` | `AuditReceipt.invoiceCommitment` | Salted `persistentCommit` (32 B) | Cryptographically binds amount, vendor, and line items for optional off-chain dispute opening; computationally hiding under 256-bit `invoiceSalt`. |
| `settleConfidentialInvoice` | 198 | `disclose(tier)` | `AuditReceipt.disclosureTier` | 2-bit enum (`0`, `1`, or `2`) | Necessary so independent verifiers know whether `auditorTag` must be verified or zeroed. |
| `settleConfidentialInvoice` | 199 | `disclose(budgetTierCap)` | `AuditReceipt.budgetTierCap` | Public budget band ceiling (`Uint<64>`) | Intentional selective disclosure: proves payout `<= budgetTierCap` without revealing the exact invoice amount inside `(0, budgetTierCap]`. |
| `settleConfidentialInvoice` | 200 | `disclose(computedRoot.field)` | Hashed into `AuditReceipt.jurisdictionRoot` | Public historic tree root field | Permanently binds the receipt to a valid compliance allowlist root without revealing the counterparty's ISO country code. |
| `settleConfidentialInvoice` | 210 | `disclose(rawAuditorTag)` | `AuditReceipt.auditorTag` (only if `AuditorScoped`) | Key-bound 32 B MAC `H("proofvault:auditor:v1", vkHash, invoiceCommitment)` | Enables a designated external auditor holding `auditorViewingKey` to confirm oversight scope. Under `MinimalSolvency` and `ThresholdBand`, `auditorTag` is deterministically `0x00...00` (zero bits disclosed). |
| `settleConfidentialInvoice` | 213 | `disclose(receiptId)` | `auditReceipts` map key + return value | Deterministic hash of `(tag, publicInvoiceCommitment, publicNullifier)` | Derived strictly from already-disclosed commitments; reveals zero additional private information. |
| `settleConfidentialInvoice` | 224 | `disclose(nextCommitment)` | `treasuryBalanceCommitment` | Re-blinded hiding commitment (32 B) | Updates committed balance to `balance - amount` with fresh 256-bit `nextTreasuryBlindingFactor`, breaking linkability across settlements. |
| `updateGovernancePolicy` | 257–259 | `disclose(newMaxSettlement)`, `disclose(newMinReserve)`, `disclose(newStatus)` | Governance ledger fields | Public policy parameters & circuit-breaker flag | Governance parameters are public invariants by design; `operatorSecretKey` remains strictly private. |
| `verifyReceiptOnChain` | 268 | `disclose(receiptId)` | `auditReceipts.member(...)` | Boolean membership result | Read-only public lookup against an already-public map key. |

---

## 3. Selective-Disclosure Tier Comparison

| Disclosure Tier | `budgetTierCap` | `jurisdictionRoot` | `auditorTag` | Intended Consumer |
|---|:---:|:---:|:---:|---|
| `MinimalSolvency` (`0`) | Public ceiling | Public historic root | `0x00...00` (zeroed) | Public DAO tokenholders verifying solvency & non-sanctioned compliance only |
| `ThresholdBand` (`1`) | Public band cap | Public historic root | `0x00...00` (zeroed) | Budget committees tracking spend bands without vendor correlation |
| `AuditorScoped` (`2`) | Public band cap | Public historic root | `H("proofvault:auditor:v1", vkHash, commit)` | External CPA / regulatory auditors proving receipt scope via viewing key |

---

## 4. Trusted vs. Trustless Role Matrix (Honest Threat Model)

| Actor | What They Learn | What Remains Hidden From Them | Trust Assumptions & Cryptographic Guarantees |
|---|---|---|---|
| **Treasury Operator** (DAO multisig / finance lead) | All private witnesses (`operatorSecretKey`, exact balance, vendor IDs, line items, amounts, country codes) | Nothing within their own vault | **Cryptographically constrained** by ZK circuits: cannot forge solvency, cannot exceed `policyMaxSingleSettlement`, cannot settle to unlisted jurisdictions, cannot double-spend a nullifier, and cannot bypass a `Paused` circuit breaker. **Operationally trusted** to bind off-chain fiat/bank wires or external token rails to the exact `invoiceAmount` committed on-chain until Phase 2 Zswap native shielded transfers are enabled. |
| **External Scoped Auditor** | Public ledger state + exported JSON receipt + knowledge of `auditorViewingKey` | Exact treasury balance, exact invoice amounts, vendor identities, line items, and country codes (unless selectively shared off-chain to open `invoiceCommitment`) | **Trustless verification** via `verifyAuditPackageAgainstLedger()` and Midnight Indexer GraphQL state readback. Cannot forge receipts, cannot claim oversight of receipts scoped to a different viewing key, and cannot alter `budgetTierCap` without failing on-chain immutability checks. |
| **Counterparty / Vendor** | Their own invoice details and receipt reference | Treasury's total balance, other vendors' payouts, other vendors' jurisdictions, and operator secret key | **Trustless privacy isolation** from peer vendors. Can independently verify that their settlement receipt was anchored on Midnight via `verifyReceiptOnChain(receiptId)` without seeing sibling vendor pricing. |
| **Public Observer / DAO Delegate** | Commitments, roots, nullifiers, `budgetTierCap`, `settledInvoiceCount`, `currentEpoch`, `vaultStatus`, and solvency floor attestations | Exact treasury balance, exact invoice amounts, all counterparty identities, line items, ISO country codes, and auditor viewing keys | **Zero-wallet, zero-trust verification** directly against Midnight Indexer GraphQL (`AuditTab` / `npm run verify:onchain`). |
| **Midnight Validators & Indexer** | Public ledger transitions & ZK proofs only | All 11 private witnesses | **Trustless soundness** via Midnight Ledger 9 SNARK verification (`zkir-3.2.1`). |
| **Midnight Proof Server** | Receives private witnesses during local proof generation | N/A if self-hosted locally (`localhost:6300`) | **Deployment rule:** Institutional operators MUST run the Proof Server inside their own VPC or local machine (`http://127.0.0.1:6300`) or use Lace/1AM's delegated `getProvingProvider()`. Never send production witnesses to an untrusted third-party prover. |

---

## 5. Residual Metadata & Mitigations

1. **Coarse-Grained Spend Band Leakage (`budgetTierCap`)**: Publishing `budgetTierCap` reveals an upper bound on an invoice (e.g., `<= $50,000`). **Mitigation:** Standardize DAO payouts into coarse power-of-two or institutional bands (`$25k`, `$50k`, `$100k`, `$150k`) so distinct vendor rates share identical anonymity sets.
2. **Low-Entropy Vendor/Scope Inputs**: If an adversary guesses both `vendorId` and `lineItemsHash`, they could recompute `deriveNullifier(vendorId, lineItemsHash)`. **Mitigation:** ProofVault hashes structured domain-separated identifiers (`proofvault:vendor:v1`, `proofvault:lineitems:v1`) and recommends including a high-entropy contract nonce inside `invoiceReference` in production ERP adapters.
3. **Timing Correlation**: On-chain settlement timestamps correlate with block inclusion time. **Mitigation:** Batch invoice settlements at fixed weekly/epoch windows rather than immediately upon vendor submission.

---

## 6. Automated Enforcement Proof

ProofVault backs every claim above with deterministic automated tests (`npm test`):
- **Serialized On-Chain State Privacy Audit (`tests/compact-contract.test.ts`)**: Inspects raw `contractState.serialize()` bytes from `@midnight-ntwrk/compact-runtime@0.21.0` after settlement and proves zero occurrences of `operatorSecretKey`, `invoiceVendorId`, `invoiceLineItemsHash`, or blinding salts.
- **Exported Audit JSON Zero-PII Check (`tests/proof-engine.test.ts` & `tests/mutation-audit.test.ts`)**: Verifies `buildExportedAuditPackage()` strips `localMemo`, vendor display names, and exact invoice amounts across randomized `fast-check` fuzz runs.
- **18/18 Guard-Deletion Mutation Audit (`tests/mutation-audit.test.ts`)**: Programmatically strips every single `assert(...)` guard in `contracts/proofvault.compact` from the compiled runtime JS one by one and confirms our adversarial test suite detects 100% (`18/18`) of guard deletions.
