import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum DisclosureTier { MinimalSolvency = 0,
                             ThresholdBand = 1,
                             AuditorScoped = 2
}

export enum VaultStatus { Active = 0, Paused = 1 }

export type AuditReceipt = { invoiceCommitment: Uint8Array;
                             nullifier: Uint8Array;
                             budgetTierCap: bigint;
                             jurisdictionRoot: Uint8Array;
                             auditorTag: Uint8Array;
                             disclosureTier: DisclosureTier;
                             settledEpoch: bigint
                           };

export type Witnesses<PS> = {
  operatorSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  treasurySecretBalance(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  treasuryBlindingFactor(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  nextTreasuryBlindingFactor(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  invoiceVendorId(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  invoiceLineItemsHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  invoiceAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  invoiceSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  jurisdictionLeaf(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  jurisdictionMerklePath(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { leaf: Uint8Array,
                                                                                       path: { sibling: { field: bigint
                                                                                                        },
                                                                                               goes_left: boolean
                                                                                             }[]
                                                                                     }];
  auditorViewingKeyHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  registerApprovedJurisdiction(context: __compactRuntime.CircuitContext<PS>,
                               jurisdictionDigest_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveTreasurySolvency(context: __compactRuntime.CircuitContext<PS>,
                        claimedMinFloor_0: bigint): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  settleConfidentialInvoice(context: __compactRuntime.CircuitContext<PS>,
                            budgetTierCap_0: bigint,
                            tier_0: DisclosureTier): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  updateGovernancePolicy(context: __compactRuntime.CircuitContext<PS>,
                         newMaxSettlement_0: bigint,
                         newMinReserve_0: bigint,
                         newStatus_0: VaultStatus): Promise<__compactRuntime.CircuitResults<PS, []>>;
  verifyReceiptOnChain(context: __compactRuntime.CircuitContext<PS>,
                       receiptId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type ProvableCircuits<PS> = {
  registerApprovedJurisdiction(context: __compactRuntime.CircuitContext<PS>,
                               jurisdictionDigest_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveTreasurySolvency(context: __compactRuntime.CircuitContext<PS>,
                        claimedMinFloor_0: bigint): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  settleConfidentialInvoice(context: __compactRuntime.CircuitContext<PS>,
                            budgetTierCap_0: bigint,
                            tier_0: DisclosureTier): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  updateGovernancePolicy(context: __compactRuntime.CircuitContext<PS>,
                         newMaxSettlement_0: bigint,
                         newMinReserve_0: bigint,
                         newStatus_0: VaultStatus): Promise<__compactRuntime.CircuitResults<PS, []>>;
  verifyReceiptOnChain(context: __compactRuntime.CircuitContext<PS>,
                       receiptId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type PureCircuits = {
  deriveOperatorPublicKey(sk_0: Uint8Array): Uint8Array;
  deriveNullifier(vendorId_0: Uint8Array, lineItemsHash_0: Uint8Array): Uint8Array;
  deriveInvoiceCommitment(vendorId_0: Uint8Array,
                          lineItemsHash_0: Uint8Array,
                          amount_0: bigint,
                          salt_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  deriveOperatorPublicKey(context: __compactRuntime.CircuitContext<PS>,
                          sk_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  deriveNullifier(context: __compactRuntime.CircuitContext<PS>,
                  vendorId_0: Uint8Array,
                  lineItemsHash_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  deriveInvoiceCommitment(context: __compactRuntime.CircuitContext<PS>,
                          vendorId_0: Uint8Array,
                          lineItemsHash_0: Uint8Array,
                          amount_0: bigint,
                          salt_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  registerApprovedJurisdiction(context: __compactRuntime.CircuitContext<PS>,
                               jurisdictionDigest_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveTreasurySolvency(context: __compactRuntime.CircuitContext<PS>,
                        claimedMinFloor_0: bigint): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  settleConfidentialInvoice(context: __compactRuntime.CircuitContext<PS>,
                            budgetTierCap_0: bigint,
                            tier_0: DisclosureTier): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
  updateGovernancePolicy(context: __compactRuntime.CircuitContext<PS>,
                         newMaxSettlement_0: bigint,
                         newMinReserve_0: bigint,
                         newStatus_0: VaultStatus): Promise<__compactRuntime.CircuitResults<PS, []>>;
  verifyReceiptOnChain(context: __compactRuntime.CircuitContext<PS>,
                       receiptId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type Ledger = {
  readonly treasuryAuthority: Uint8Array;
  readonly treasuryBalanceCommitment: Uint8Array;
  readonly policyMaxSingleSettlement: bigint;
  readonly policyMinReserveFloor: bigint;
  readonly currentEpoch: bigint;
  readonly vaultStatus: VaultStatus;
  approvedJurisdictions: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined;
    history(): Iterator<__compactRuntime.MerkleTreeDigest>
  };
  usedInvoiceNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  auditReceipts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): AuditReceipt;
    [Symbol.iterator](): Iterator<[Uint8Array, AuditReceipt]>
  };
  readonly settledInvoiceCount: bigint;
}

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               initOperatorPk_0: Uint8Array,
               initBalanceCommitment_0: Uint8Array,
               maxSingleSettlement_0: bigint,
               minReserveFloor_0: bigint): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
export declare const circuitSignatures: __compactRuntime.CircuitSignatures;
export declare const declaredInterfaces: __compactRuntime.DeclaredInterfaces;
