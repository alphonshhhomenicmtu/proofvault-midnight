import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.21.0');

export var DisclosureTier;
(function (DisclosureTier) {
  DisclosureTier[DisclosureTier['MinimalSolvency'] = 0] = 'MinimalSolvency';
  DisclosureTier[DisclosureTier['ThresholdBand'] = 1] = 'ThresholdBand';
  DisclosureTier[DisclosureTier['AuditorScoped'] = 2] = 'AuditorScoped';
})(DisclosureTier || (DisclosureTier = {}));

export var VaultStatus;
(function (VaultStatus) {
  VaultStatus[VaultStatus['Active'] = 0] = 'Active';
  VaultStatus[VaultStatus['Paused'] = 1] = 'Paused';
})(VaultStatus || (VaultStatus = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeEnum(1, 1);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_3 = new __compactRuntime.CompactTypeEnum(2, 1);

class _AuditReceipt_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_1.alignment()))))));
  }
  fromValue(value_0) {
    return {
      invoiceCommitment: _descriptor_2.fromValue(value_0),
      nullifier: _descriptor_2.fromValue(value_0),
      budgetTierCap: _descriptor_1.fromValue(value_0),
      jurisdictionRoot: _descriptor_2.fromValue(value_0),
      auditorTag: _descriptor_2.fromValue(value_0),
      disclosureTier: _descriptor_3.fromValue(value_0),
      settledEpoch: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.invoiceCommitment).concat(_descriptor_2.toValue(value_0.nullifier).concat(_descriptor_1.toValue(value_0.budgetTierCap).concat(_descriptor_2.toValue(value_0.jurisdictionRoot).concat(_descriptor_2.toValue(value_0.auditorTag).concat(_descriptor_3.toValue(value_0.disclosureTier).concat(_descriptor_1.toValue(value_0.settledEpoch)))))));
  }
}

const _descriptor_4 = new _AuditReceipt_0();

const _descriptor_5 = __compactRuntime.CompactTypeBoolean;

const _descriptor_6 = __compactRuntime.CompactTypeField;

class _MerkleTreeDigest_0 {
  alignment() {
    return _descriptor_6.alignment();
  }
  fromValue(value_0) {
    return {
      field: _descriptor_6.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.field);
  }
}

const _descriptor_7 = new _MerkleTreeDigest_0();

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _MerkleTreePathEntry_0 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_5.alignment());
  }
  fromValue(value_0) {
    return {
      sibling: _descriptor_7.fromValue(value_0),
      goes_left: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.sibling).concat(_descriptor_5.toValue(value_0.goes_left));
  }
}

const _descriptor_9 = new _MerkleTreePathEntry_0();

const _descriptor_10 = new __compactRuntime.CompactTypeVector(8, _descriptor_9);

class _MerkleTreePath_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_10.alignment());
  }
  fromValue(value_0) {
    return {
      leaf: _descriptor_2.fromValue(value_0),
      path: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.leaf).concat(_descriptor_10.toValue(value_0.path));
  }
}

const _descriptor_11 = new _MerkleTreePath_0();

const _descriptor_12 = new __compactRuntime.CompactTypeVector(5, _descriptor_2);

const _descriptor_13 = new __compactRuntime.CompactTypeVector(3, _descriptor_2);

const _descriptor_14 = new __compactRuntime.CompactTypeBytes(6);

class _LeafPreimage_0 {
  alignment() {
    return _descriptor_14.alignment().concat(_descriptor_2.alignment());
  }
  fromValue(value_0) {
    return {
      domain_sep: _descriptor_14.fromValue(value_0),
      data: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_14.toValue(value_0.domain_sep).concat(_descriptor_2.toValue(value_0.data));
  }
}

const _descriptor_15 = new _LeafPreimage_0();

const _descriptor_16 = new __compactRuntime.CompactTypeVector(2, _descriptor_2);

const _descriptor_17 = new __compactRuntime.CompactTypeVector(4, _descriptor_2);

const _descriptor_18 = new __compactRuntime.CompactTypeVector(2, _descriptor_6);

class _Either_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_5.fromValue(value_0),
      left: _descriptor_2.fromValue(value_0),
      right: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.is_left).concat(_descriptor_2.toValue(value_0.left).concat(_descriptor_2.toValue(value_0.right)));
  }
}

const _descriptor_19 = new _Either_0();

const _descriptor_20 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_2.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.bytes);
  }
}

const _descriptor_21 = new _ContractAddress_0();

class _UserAddress_0 {
  alignment() {
    return _descriptor_2.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.bytes);
  }
}

const _descriptor_22 = new _UserAddress_0();

class _Either_1 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_21.alignment().concat(_descriptor_22.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_5.fromValue(value_0),
      left: _descriptor_21.fromValue(value_0),
      right: _descriptor_22.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.is_left).concat(_descriptor_21.toValue(value_0.left).concat(_descriptor_22.toValue(value_0.right)));
  }
}

const _descriptor_23 = new _Either_1();

class _Maybe_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_23.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_5.fromValue(value_0),
      value: _descriptor_23.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.is_some).concat(_descriptor_23.toValue(value_0.value));
  }
}

const _descriptor_24 = new _Maybe_0();

const _descriptor_25 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_26 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.operatorSecretKey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named operatorSecretKey');
    }
    if (typeof(witnesses_0.treasurySecretBalance) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named treasurySecretBalance');
    }
    if (typeof(witnesses_0.treasuryBlindingFactor) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named treasuryBlindingFactor');
    }
    if (typeof(witnesses_0.nextTreasuryBlindingFactor) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named nextTreasuryBlindingFactor');
    }
    if (typeof(witnesses_0.invoiceVendorId) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named invoiceVendorId');
    }
    if (typeof(witnesses_0.invoiceLineItemsHash) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named invoiceLineItemsHash');
    }
    if (typeof(witnesses_0.invoiceAmount) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named invoiceAmount');
    }
    if (typeof(witnesses_0.invoiceSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named invoiceSalt');
    }
    if (typeof(witnesses_0.jurisdictionLeaf) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named jurisdictionLeaf');
    }
    if (typeof(witnesses_0.jurisdictionMerklePath) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named jurisdictionMerklePath');
    }
    if (typeof(witnesses_0.auditorViewingKeyHash) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named auditorViewingKeyHash');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      async deriveOperatorPublicKey(context, ...args_1) {
        return { result: pureCircuits.deriveOperatorPublicKey(...args_1), context };
      },
      async deriveAuditorCommitment(context, ...args_1) {
        return { result: pureCircuits.deriveAuditorCommitment(...args_1), context };
      },
      async deriveNullifierBlindingSalt(context, ...args_1) {
        return { result: pureCircuits.deriveNullifierBlindingSalt(...args_1), context };
      },
      async deriveNullifier(context, ...args_1) {
        return { result: pureCircuits.deriveNullifier(...args_1), context };
      },
      async deriveInvoiceCommitment(context, ...args_1) {
        return { result: pureCircuits.deriveInvoiceCommitment(...args_1), context };
      },
      registerApprovedJurisdiction: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`registerApprovedJurisdiction: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const jurisdictionDigest_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerApprovedJurisdiction',
                                     'argument 1 (as invoked from Typescript)',
                                     'proofvault.compact line 150 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(jurisdictionDigest_0.buffer instanceof ArrayBuffer && jurisdictionDigest_0.BYTES_PER_ELEMENT === 1 && jurisdictionDigest_0.length === 32)) {
          __compactRuntime.typeError('registerApprovedJurisdiction',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proofvault.compact line 150 char 1',
                                     'Bytes<32>',
                                     jurisdictionDigest_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(jurisdictionDigest_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._registerApprovedJurisdiction_0(context,
                                                                    partialProofData,
                                                                    jurisdictionDigest_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      proveTreasurySolvency: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`proveTreasurySolvency: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const claimedMinFloor_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('proveTreasurySolvency',
                                     'argument 1 (as invoked from Typescript)',
                                     'proofvault.compact line 160 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(claimedMinFloor_0) === 'bigint' && claimedMinFloor_0 >= 0n && claimedMinFloor_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveTreasurySolvency',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proofvault.compact line 160 char 1',
                                     'Uint<0..18446744073709551616>',
                                     claimedMinFloor_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(claimedMinFloor_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._proveTreasurySolvency_0(context,
                                                             partialProofData,
                                                             claimedMinFloor_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      settleConfidentialInvoice: async (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`settleConfidentialInvoice: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const budgetTierCap_0 = args_1[1];
        const tier_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('settleConfidentialInvoice',
                                     'argument 1 (as invoked from Typescript)',
                                     'proofvault.compact line 188 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(budgetTierCap_0) === 'bigint' && budgetTierCap_0 >= 0n && budgetTierCap_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('settleConfidentialInvoice',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proofvault.compact line 188 char 1',
                                     'Uint<0..18446744073709551616>',
                                     budgetTierCap_0)
        }
        if (!(typeof(tier_0) === 'number' && tier_0 >= 0 && tier_0 <= 2)) {
          __compactRuntime.typeError('settleConfidentialInvoice',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proofvault.compact line 188 char 1',
                                     'Enum<DisclosureTier, MinimalSolvency, ThresholdBand, AuditorScoped>',
                                     tier_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(budgetTierCap_0).concat(_descriptor_3.toValue(tier_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_3.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._settleConfidentialInvoice_0(context,
                                                                 partialProofData,
                                                                 budgetTierCap_0,
                                                                 tier_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      updateGovernancePolicy: async (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`updateGovernancePolicy: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const newMaxSettlement_0 = args_1[1];
        const newMinReserve_0 = args_1[2];
        const newStatus_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('updateGovernancePolicy',
                                     'argument 1 (as invoked from Typescript)',
                                     'proofvault.compact line 314 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(newMaxSettlement_0) === 'bigint' && newMaxSettlement_0 >= 0n && newMaxSettlement_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('updateGovernancePolicy',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proofvault.compact line 314 char 1',
                                     'Uint<0..18446744073709551616>',
                                     newMaxSettlement_0)
        }
        if (!(typeof(newMinReserve_0) === 'bigint' && newMinReserve_0 >= 0n && newMinReserve_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('updateGovernancePolicy',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proofvault.compact line 314 char 1',
                                     'Uint<0..18446744073709551616>',
                                     newMinReserve_0)
        }
        if (!(typeof(newStatus_0) === 'number' && newStatus_0 >= 0 && newStatus_0 <= 1)) {
          __compactRuntime.typeError('updateGovernancePolicy',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'proofvault.compact line 314 char 1',
                                     'Enum<VaultStatus, Active, Paused>',
                                     newStatus_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(newMaxSettlement_0).concat(_descriptor_1.toValue(newMinReserve_0).concat(_descriptor_0.toValue(newStatus_0))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._updateGovernancePolicy_0(context,
                                                              partialProofData,
                                                              newMaxSettlement_0,
                                                              newMinReserve_0,
                                                              newStatus_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      verifyReceiptOnChain: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`verifyReceiptOnChain: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const receiptId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('verifyReceiptOnChain',
                                     'argument 1 (as invoked from Typescript)',
                                     'proofvault.compact line 333 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(receiptId_0.buffer instanceof ArrayBuffer && receiptId_0.BYTES_PER_ELEMENT === 1 && receiptId_0.length === 32)) {
          __compactRuntime.typeError('verifyReceiptOnChain',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proofvault.compact line 333 char 1',
                                     'Bytes<32>',
                                     receiptId_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(receiptId_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._verifyReceiptOnChain_0(context,
                                                            partialProofData,
                                                            receiptId_0);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      }
    };
    this.impureCircuits = {
      registerApprovedJurisdiction: this.circuits.registerApprovedJurisdiction,
      proveTreasurySolvency: this.circuits.proveTreasurySolvency,
      settleConfidentialInvoice: this.circuits.settleConfidentialInvoice,
      updateGovernancePolicy: this.circuits.updateGovernancePolicy,
      verifyReceiptOnChain: this.circuits.verifyReceiptOnChain
    };
    this.provableCircuits = {
      registerApprovedJurisdiction: this.circuits.registerApprovedJurisdiction,
      proveTreasurySolvency: this.circuits.proveTreasurySolvency,
      settleConfidentialInvoice: this.circuits.settleConfidentialInvoice,
      updateGovernancePolicy: this.circuits.updateGovernancePolicy,
      verifyReceiptOnChain: this.circuits.verifyReceiptOnChain
    };
  }
  async initialState(...args_0) {
    if (args_0.length !== 6) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 6 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const initOperatorPk_0 = args_0[1];
    const initBalanceCommitment_0 = args_0[2];
    const initAuditorCommitment_0 = args_0[3];
    const maxSingleSettlement_0 = args_0[4];
    const minReserveFloor_0 = args_0[5];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(initOperatorPk_0.buffer instanceof ArrayBuffer && initOperatorPk_0.BYTES_PER_ELEMENT === 1 && initOperatorPk_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'proofvault.compact line 125 char 1',
                                 'Bytes<32>',
                                 initOperatorPk_0)
    }
    if (!(initBalanceCommitment_0.buffer instanceof ArrayBuffer && initBalanceCommitment_0.BYTES_PER_ELEMENT === 1 && initBalanceCommitment_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 2 (argument 3 as invoked from Typescript)',
                                 'proofvault.compact line 125 char 1',
                                 'Bytes<32>',
                                 initBalanceCommitment_0)
    }
    if (!(initAuditorCommitment_0.buffer instanceof ArrayBuffer && initAuditorCommitment_0.BYTES_PER_ELEMENT === 1 && initAuditorCommitment_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 3 (argument 4 as invoked from Typescript)',
                                 'proofvault.compact line 125 char 1',
                                 'Bytes<32>',
                                 initAuditorCommitment_0)
    }
    if (!(typeof(maxSingleSettlement_0) === 'bigint' && maxSingleSettlement_0 >= 0n && maxSingleSettlement_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 4 (argument 5 as invoked from Typescript)',
                                 'proofvault.compact line 125 char 1',
                                 'Uint<0..18446744073709551616>',
                                 maxSingleSettlement_0)
    }
    if (!(typeof(minReserveFloor_0) === 'bigint' && minReserveFloor_0 >= 0n && minReserveFloor_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 5 (argument 6 as invoked from Typescript)',
                                 'proofvault.compact line 125 char 1',
                                 'Uint<0..18446744073709551616>',
                                 minReserveFloor_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('registerApprovedJurisdiction', new __compactRuntime.ContractOperation());
    state_0.setOperation('proveTreasurySolvency', new __compactRuntime.ContractOperation());
    state_0.setOperation('settleConfidentialInvoice', new __compactRuntime.ContractOperation());
    state_0.setOperation('updateGovernancePolicy', new __compactRuntime.ContractOperation());
    state_0.setOperation('verifyReceiptOnChain', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext({circuitId: 'constructor', contractAddress: __compactRuntime.dummyContractAddress(), coinPublicKeyOrZswapState: constructorContext_0.initialZswapLocalState.coinPublicKey, contractState: state_0.data, privateState: constructorContext_0.initialPrivateState});
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(0n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(1n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(2n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(3n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(4n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(5n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(6n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(7n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(8n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(9n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(10n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newArray()
                                                          .arrayPush(__compactRuntime.StateValue.newBoundedMerkleTree(
                                                                       new __compactRuntime.StateBoundedMerkleTree(8)
                                                                     )).arrayPush(__compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                        alignment: _descriptor_1.alignment() })).arrayPush(__compactRuntime.StateValue.newMap(
                                                                                                                                                                             new __compactRuntime.StateMap()
                                                                                                                                                                           ))
                                                          .encode() } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(2n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: false,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(0n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       'root',
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(11n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(12n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(13n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.assert(maxSingleSettlement_0 > 0n,
                            'Max single settlement must be positive');
    __compactRuntime.assert(!this._equal_0(initAuditorCommitment_0,
                                           new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Authorized auditor commitment must be non-zero');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(0n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(initOperatorPk_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(1n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(initAuditorCommitment_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(2n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(initBalanceCommitment_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(3n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(maxSingleSettlement_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(4n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(minReserveFloor_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(5n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(6n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(7n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(8n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_1),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_2 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(9n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_2),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.callContext.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.callContext.currentPrivateState,
      currentZswapLocalState: context.callContext.currentZswapLocalState
    }
  }
  _merkleTreePathRoot_0(path_0) {
    return { field:
               this._folder_0((...args_0) =>
                                this._merkleTreePathEntryRoot_0(...args_0),
                              this._degradeToTransient_0(this._persistentHash_3({ domain_sep:
                                                                                    new Uint8Array([109, 100, 110, 58, 108, 104]),
                                                                                  data:
                                                                                    path_0.leaf })),
                              path_0.path) };
  }
  _merkleTreePathEntryRoot_0(recursiveDigest_0, entry_0) {
    const left_0 = entry_0.goes_left ? recursiveDigest_0 : entry_0.sibling.field;
    const right_0 = entry_0.goes_left ?
                    entry_0.sibling.field :
                    recursiveDigest_0;
    return this._transientHash_0([left_0, right_0]);
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_18, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_16, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_17, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_1, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_15, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_6, value_0);
    return result_0;
  }
  _persistentHash_5(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_13, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_12,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _persistentCommit_1(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_1,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _degradeToTransient_0(x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  _operatorSecretKey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.operatorSecretKey(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('operatorSecretKey',
                                 'return value',
                                 'proofvault.compact line 55 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _treasurySecretBalance_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.treasurySecretBalance(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('treasurySecretBalance',
                                 'return value',
                                 'proofvault.compact line 56 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _treasuryBlindingFactor_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.treasuryBlindingFactor(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('treasuryBlindingFactor',
                                 'return value',
                                 'proofvault.compact line 57 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _nextTreasuryBlindingFactor_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.nextTreasuryBlindingFactor(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('nextTreasuryBlindingFactor',
                                 'return value',
                                 'proofvault.compact line 58 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _invoiceVendorId_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.invoiceVendorId(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('invoiceVendorId',
                                 'return value',
                                 'proofvault.compact line 59 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _invoiceLineItemsHash_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.invoiceLineItemsHash(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('invoiceLineItemsHash',
                                 'return value',
                                 'proofvault.compact line 60 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _invoiceAmount_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.invoiceAmount(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('invoiceAmount',
                                 'return value',
                                 'proofvault.compact line 61 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _invoiceSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.invoiceSalt(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('invoiceSalt',
                                 'return value',
                                 'proofvault.compact line 62 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _jurisdictionLeaf_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.jurisdictionLeaf(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('jurisdictionLeaf',
                                 'return value',
                                 'proofvault.compact line 63 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _jurisdictionMerklePath_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.jurisdictionMerklePath(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.leaf.buffer instanceof ArrayBuffer && result_0.leaf.BYTES_PER_ELEMENT === 1 && result_0.leaf.length === 32 && Array.isArray(result_0.path) && result_0.path.length === 8 && result_0.path.every((t) => typeof(t) === 'object' && typeof(t.sibling) === 'object' && typeof(t.sibling.field) === 'bigint' && t.sibling.field >= 0 && t.sibling.field <= __compactRuntime.MAX_FIELD && typeof(t.goes_left) === 'boolean'))) {
      __compactRuntime.typeError('jurisdictionMerklePath',
                                 'return value',
                                 'proofvault.compact line 64 char 1',
                                 'struct MerkleTreePath<leaf: Bytes<32>, path: Vector<8, struct MerkleTreePathEntry<sibling: struct MerkleTreeDigest<field: Field>, goes_left: Boolean>>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_11.toValue(result_0),
      alignment: _descriptor_11.alignment()
    });
    return result_0;
  }
  _auditorViewingKeyHash_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.auditorViewingKeyHash(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('auditorViewingKeyHash',
                                 'return value',
                                 'proofvault.compact line 65 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _deriveOperatorPublicKey_0(sk_0) {
    return this._persistentHash_0([new Uint8Array([112, 114, 111, 111, 102, 118, 97, 117, 108, 116, 58, 111, 112, 101, 114, 97, 116, 111, 114, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _deriveAuditorCommitment_0(auditorVkHash_0) {
    return this._persistentHash_0([new Uint8Array([112, 114, 111, 111, 102, 118, 97, 117, 108, 116, 58, 97, 117, 100, 105, 116, 111, 114, 45, 114, 101, 103, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0]),
                                   auditorVkHash_0]);
  }
  _deriveNullifierBlindingSalt_0(sk_0) {
    return this._persistentHash_0([new Uint8Array([112, 114, 111, 111, 102, 118, 97, 117, 108, 116, 58, 110, 117, 108, 108, 105, 102, 105, 101, 114, 45, 115, 97, 108, 116, 58, 118, 50, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _deriveNullifier_0(nullifierSalt_0, vendorId_0, lineItemsHash_0) {
    return this._persistentHash_1([new Uint8Array([112, 114, 111, 111, 102, 118, 97, 117, 108, 116, 58, 110, 117, 108, 108, 105, 102, 105, 101, 114, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   nullifierSalt_0,
                                   vendorId_0,
                                   lineItemsHash_0]);
  }
  _deriveInvoiceCommitment_0(vendorId_0,
                             lineItemsHash_0,
                             amount_0,
                             jurisdictionLeafDigest_0,
                             salt_0)
  {
    return this._persistentCommit_0([new Uint8Array([112, 114, 111, 111, 102, 118, 97, 117, 108, 116, 58, 105, 110, 118, 111, 105, 99, 101, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                     vendorId_0,
                                     lineItemsHash_0,
                                     this._persistentHash_2(amount_0),
                                     jurisdictionLeafDigest_0],
                                    salt_0);
  }
  async _registerApprovedJurisdiction_0(context,
                                        partialProofData,
                                        jurisdictionDigest_0)
  {
    const opPk_0 = this._deriveOperatorPublicKey_0(this._operatorSecretKey_0(context,
                                                                             partialProofData));
    __compactRuntime.assert(this._equal_1(opPk_0,
                                          _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_25.toValue(0n),
                                                                                                                                alignment: _descriptor_25.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Unauthorized treasury operator');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(10n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(0n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: false,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(1n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.leafHash(
                                                                                              { value: _descriptor_2.toValue(jurisdictionDigest_0),
                                                                                                alignment: _descriptor_2.alignment() }
                                                                                            )).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(1n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { addi: { immediate: 1 } },
                                       { ins: { cached: true, n: 1 } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(2n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: false,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(0n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       'root',
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  async _proveTreasurySolvency_0(context, partialProofData, claimedMinFloor_0) {
    const opPk_0 = this._deriveOperatorPublicKey_0(this._operatorSecretKey_0(context,
                                                                             partialProofData));
    __compactRuntime.assert(this._equal_2(opPk_0,
                                          _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_25.toValue(0n),
                                                                                                                                alignment: _descriptor_25.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Unauthorized treasury operator');
    const balance_0 = this._treasurySecretBalance_0(context, partialProofData);
    const salt_0 = this._treasuryBlindingFactor_0(context, partialProofData);
    const commitment_0 = this._persistentCommit_1(balance_0, salt_0);
    __compactRuntime.assert(this._equal_3(commitment_0,
                                          _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_25.toValue(2n),
                                                                                                                                alignment: _descriptor_25.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Treasury commitment mismatch');
    __compactRuntime.assert(balance_0
                            >=
                            _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_25.toValue(4n),
                                                                                                                  alignment: _descriptor_25.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'Treasury below governance reserve floor');
    __compactRuntime.assert(balance_0 >= claimedMinFloor_0,
                            'Treasury below requested solvency floor');
    const attestation_0 = this._persistentHash_5([new Uint8Array([112, 114, 111, 111, 102, 118, 97, 117, 108, 116, 58, 115, 111, 108, 118, 101, 110, 99, 121, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                  _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                            partialProofData,
                                                                                                            [
                                                                                                             { dup: { n: 0 } },
                                                                                                             { idx: { cached: false,
                                                                                                                      pushPath: false,
                                                                                                                      path: [
                                                                                                                             { tag: 'value',
                                                                                                                               value: { value: _descriptor_25.toValue(2n),
                                                                                                                                        alignment: _descriptor_25.alignment() } }] } },
                                                                                                             { popeq: { cached: false,
                                                                                                                        result: undefined } }]).value),
                                                  this._persistentHash_2(claimedMinFloor_0)]);
    const publicAttestation_0 = attestation_0;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(7n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(publicAttestation_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(8n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(claimedMinFloor_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                            partialProofData,
                                                                            [
                                                                             { dup: { n: 0 } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_25.toValue(5n),
                                                                                                        alignment: _descriptor_25.alignment() } }] } },
                                                                             { popeq: { cached: false,
                                                                                        result: undefined } }]).value);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(9n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return publicAttestation_0;
  }
  async _settleConfidentialInvoice_0(context,
                                     partialProofData,
                                     budgetTierCap_0,
                                     tier_0)
  {
    __compactRuntime.assert(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_25.toValue(6n),
                                                                                                                  alignment: _descriptor_25.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value)
                            ===
                            0,
                            'Vault is currently paused');
    const opSk_0 = this._operatorSecretKey_0(context, partialProofData);
    const opPk_0 = this._deriveOperatorPublicKey_0(opSk_0);
    __compactRuntime.assert(this._equal_4(opPk_0,
                                          _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_25.toValue(0n),
                                                                                                                                alignment: _descriptor_25.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Unauthorized treasury operator');
    const balance_0 = this._treasurySecretBalance_0(context, partialProofData);
    const currentSalt_0 = this._treasuryBlindingFactor_0(context,
                                                         partialProofData);
    const expectedCommitment_0 = this._persistentCommit_1(balance_0,
                                                          currentSalt_0);
    __compactRuntime.assert(this._equal_5(expectedCommitment_0,
                                          _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_25.toValue(2n),
                                                                                                                                alignment: _descriptor_25.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Treasury commitment mismatch');
    const amount_0 = this._invoiceAmount_0(context, partialProofData);
    const publicTier_0 = tier_0;
    const publicCap_0 = budgetTierCap_0;
    __compactRuntime.assert(amount_0 > 0n,
                            'Invoice amount must be greater than zero');
    __compactRuntime.assert(amount_0 < publicCap_0,
                            'Invoice must be strictly below declared budget tier cap');
    __compactRuntime.assert(publicCap_0
                            <=
                            _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_25.toValue(3n),
                                                                                                                  alignment: _descriptor_25.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'Budget tier exceeds governance ceiling');
    __compactRuntime.assert(balance_0 >= amount_0,
                            'Insufficient treasury balance');
    const remainingBalance_0 = (__compactRuntime.assert(balance_0 >= amount_0,
                                                        'result of subtraction would be negative'),
                                balance_0 - amount_0);
    __compactRuntime.assert(remainingBalance_0
                            >=
                            _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_25.toValue(4n),
                                                                                                                  alignment: _descriptor_25.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'Settlement breaches minimum reserve floor');
    __compactRuntime.assert(publicTier_0 !== 0
                            ||
                            publicCap_0
                            ===
                            _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_25.toValue(3n),
                                                                                                                  alignment: _descriptor_25.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'MinimalSolvency tier must use full governance ceiling');
    __compactRuntime.assert(publicTier_0 !== 1
                            ||
                            publicCap_0
                            <
                            _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_25.toValue(3n),
                                                                                                                  alignment: _descriptor_25.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'ThresholdBand cap must be strictly below governance ceiling');
    const jLeaf_0 = this._jurisdictionLeaf_0(context, partialProofData);
    const jPath_0 = this._jurisdictionMerklePath_0(context, partialProofData);
    __compactRuntime.assert(this._equal_6(jPath_0.leaf, jLeaf_0),
                            'Jurisdiction leaf does not match Merkle path');
    const computedRoot_0 = this._merkleTreePathRoot_0(jPath_0);
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_25.toValue(10n),
                                                                                                                  alignment: _descriptor_25.alignment() } }] } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_25.toValue(2n),
                                                                                                                  alignment: _descriptor_25.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(computedRoot_0),
                                                                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Jurisdiction is not in the approved compliance Merkle tree');
    const vendorId_0 = this._invoiceVendorId_0(context, partialProofData);
    const lineItemsHash_0 = this._invoiceLineItemsHash_0(context,
                                                         partialProofData);
    const invSalt_0 = this._invoiceSalt_0(context, partialProofData);
    const nullifierSalt_0 = this._deriveNullifierBlindingSalt_0(opSk_0);
    const nullifier_0 = this._deriveNullifier_0(nullifierSalt_0,
                                                vendorId_0,
                                                lineItemsHash_0);
    const publicNullifier_0 = nullifier_0;
    __compactRuntime.assert(!_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_25.toValue(11n),
                                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(publicNullifier_0),
                                                                                                                                               alignment: _descriptor_2.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Invoice nullifier already spent');
    const invoiceCommitment_0 = this._deriveInvoiceCommitment_0(vendorId_0,
                                                                lineItemsHash_0,
                                                                amount_0,
                                                                jLeaf_0,
                                                                invSalt_0);
    const publicInvoiceCommitment_0 = invoiceCommitment_0;
    const disclosedRootField_0 = computedRoot_0.field;
    const rootBytes_0 = this._persistentHash_4(disclosedRootField_0);
    const vkHash_0 = this._auditorViewingKeyHash_0(context, partialProofData);
    const derivedAuditorCommitment_0 = this._deriveAuditorCommitment_0(vkHash_0);
    __compactRuntime.assert(publicTier_0 !== 2
                            ||
                            this._equal_7(derivedAuditorCommitment_0,
                                          _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_25.toValue(1n),
                                                                                                                                alignment: _descriptor_25.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Auditor viewing key is not authorized for this vault');
    const rawAuditorTag_0 = this._persistentHash_5([new Uint8Array([112, 114, 111, 111, 102, 118, 97, 117, 108, 116, 58, 97, 117, 100, 105, 116, 111, 114, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                    vkHash_0,
                                                    invoiceCommitment_0]);
    const publicAuditorTag_0 = publicTier_0 === 2 ?
                               rawAuditorTag_0 :
                               new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const receiptId_0 = this._persistentHash_5([new Uint8Array([112, 114, 111, 111, 102, 118, 97, 117, 108, 116, 58, 114, 101, 99, 101, 105, 112, 116, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                publicInvoiceCommitment_0,
                                                publicNullifier_0]);
    const nextSalt_0 = this._nextTreasuryBlindingFactor_0(context,
                                                          partialProofData);
    __compactRuntime.assert(!this._equal_8(nextSalt_0, currentSalt_0),
                            'Next treasury blinding factor must be fresh');
    const nextCommitment_0 = this._persistentCommit_1(remainingBalance_0,
                                                      nextSalt_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(2n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(nextCommitment_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(11n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(publicNullifier_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(13n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_8.toValue(tmp_0),
                                                                alignment: _descriptor_8.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = { invoiceCommitment: publicInvoiceCommitment_0,
                    nullifier: publicNullifier_0,
                    budgetTierCap: publicCap_0,
                    jurisdictionRoot: rootBytes_0,
                    auditorTag: publicAuditorTag_0,
                    disclosureTier: publicTier_0,
                    settledEpoch:
                      _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_25.toValue(5n),
                                                                                                            alignment: _descriptor_25.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_25.toValue(12n),
                                                                  alignment: _descriptor_25.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(receiptId_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_1),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return receiptId_0;
  }
  async _updateGovernancePolicy_0(context,
                                  partialProofData,
                                  newMaxSettlement_0,
                                  newMinReserve_0,
                                  newStatus_0)
  {
    const opPk_0 = this._deriveOperatorPublicKey_0(this._operatorSecretKey_0(context,
                                                                             partialProofData));
    __compactRuntime.assert(this._equal_9(opPk_0,
                                          _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_25.toValue(0n),
                                                                                                                                alignment: _descriptor_25.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Unauthorized treasury operator');
    __compactRuntime.assert(newMaxSettlement_0 > 0n,
                            'Max single settlement must be positive');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(3n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(newMaxSettlement_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(4n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(newMinReserve_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(6n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newStatus_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = ((t1) => {
                    if (t1 > 18446744073709551615n) {
                      throw new __compactRuntime.CompactError('proofvault.compact line 326 char 18: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                    }
                    return t1;
                  })(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_25.toValue(5n),
                                                                                                           alignment: _descriptor_25.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value)
                     +
                     1n);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_25.toValue(5n),
                                                                                              alignment: _descriptor_25.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  async _verifyReceiptOnChain_0(context, partialProofData, receiptId_0) {
    return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_25.toValue(12n),
                                                                                                 alignment: _descriptor_25.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(receiptId_0),
                                                                                                                             alignment: _descriptor_2.alignment() }).encode() } },
                                                                      'member',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _folder_0(f, x, a0) {
    for (let i = 0; i < 8; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    callContext: { currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get treasuryAuthority() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(0n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get authorizedAuditorCommitment() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(1n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get treasuryBalanceCommitment() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(2n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get policyMaxSingleSettlement() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(3n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get policyMinReserveFloor() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(4n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get currentEpoch() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(5n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get vaultStatus() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(6n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastSolvencyAttestation() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(7n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastSolvencyFloor() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(8n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get lastSolvencyEpoch() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(9n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    approvedJurisdictions: {
      isFull(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isFull: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(10n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(1n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(256n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'lt',
                                                                          'neg',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      checkRoot(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`checkRoot: expected 1 argument, received ${args_0.length}`);
        }
        const rt_0 = args_0[0];
        if (!(typeof(rt_0) === 'object' && typeof(rt_0.field) === 'bigint' && rt_0.field >= 0 && rt_0.field <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('checkRoot',
                                     'argument 1',
                                     'proofvault.compact line 46 char 1',
                                     'struct MerkleTreeDigest<field: Field>',
                                     rt_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(10n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(2n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(rt_0),
                                                                                                                                 alignment: _descriptor_7.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      root(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`root: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[10];
        return ((result) => result             ? __compactRuntime.CompactTypeMerkleTreeDigest.fromValue(result)             : undefined)(self_0.asArray()[0].asBoundedMerkleTree().rehash().root()?.value);
      },
      firstFree(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`first_free: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[10];
        return __compactRuntime.CompactTypeField.fromValue(self_0.asArray()[1].asCell().value);
      },
      pathForLeaf(...args_0) {
        if (args_0.length !== 2) {
          throw new __compactRuntime.CompactError(`path_for_leaf: expected 2 arguments, received ${args_0.length}`);
        }
        const index_0 = args_0[0];
        const leaf_0 = args_0[1];
        if (!(typeof(index_0) === 'bigint' && index_0 >= 0 && index_0 <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('path_for_leaf',
                                     'argument 1',
                                     'proofvault.compact line 46 char 1',
                                     'Field',
                                     index_0)
        }
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.typeError('path_for_leaf',
                                     'argument 2',
                                     'proofvault.compact line 46 char 1',
                                     'Bytes<32>',
                                     leaf_0)
        }
        const self_0 = state.asArray()[10];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(8, _descriptor_2).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().rehash().pathForLeaf(    index_0,    {      value: _descriptor_2.toValue(leaf_0),      alignment: _descriptor_2.alignment()    }  )?.value);
      },
      findPathForLeaf(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`find_path_for_leaf: expected 1 argument, received ${args_0.length}`);
        }
        const leaf_0 = args_0[0];
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.typeError('find_path_for_leaf',
                                     'argument 1',
                                     'proofvault.compact line 46 char 1',
                                     'Bytes<32>',
                                     leaf_0)
        }
        const self_0 = state.asArray()[10];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(8, _descriptor_2).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().rehash().findPathForLeaf(    {      value: _descriptor_2.toValue(leaf_0),      alignment: _descriptor_2.alignment()    }  )?.value);
      },
      history(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`history: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[10];
        return self_0.asArray()[2].asMap().keys().map(  (elem) => __compactRuntime.CompactTypeMerkleTreeDigest.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    usedInvoiceNullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(11n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(11n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'proofvault.compact line 47 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(11n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[11];
        return self_0.asMap().keys().map((elem) => _descriptor_2.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    auditReceipts: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(12n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(12n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'proofvault.compact line 48 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(12n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'proofvault.compact line 48 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_25.toValue(12n),
                                                                                                     alignment: _descriptor_25.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(key_0),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[12];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_2.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get settledInvoiceCount() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_25.toValue(13n),
                                                                                                   alignment: _descriptor_25.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({
  operatorSecretKey: (...args) => undefined,
  treasurySecretBalance: (...args) => undefined,
  treasuryBlindingFactor: (...args) => undefined,
  nextTreasuryBlindingFactor: (...args) => undefined,
  invoiceVendorId: (...args) => undefined,
  invoiceLineItemsHash: (...args) => undefined,
  invoiceAmount: (...args) => undefined,
  invoiceSalt: (...args) => undefined,
  jurisdictionLeaf: (...args) => undefined,
  jurisdictionMerklePath: (...args) => undefined,
  auditorViewingKeyHash: (...args) => undefined
});
export const pureCircuits = {
  deriveOperatorPublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`deriveOperatorPublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('deriveOperatorPublicKey',
                                 'argument 1',
                                 'proofvault.compact line 71 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._deriveOperatorPublicKey_0(sk_0);
  },
  deriveAuditorCommitment: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`deriveAuditorCommitment: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const auditorVkHash_0 = args_0[0];
    if (!(auditorVkHash_0.buffer instanceof ArrayBuffer && auditorVkHash_0.BYTES_PER_ELEMENT === 1 && auditorVkHash_0.length === 32)) {
      __compactRuntime.typeError('deriveAuditorCommitment',
                                 'argument 1',
                                 'proofvault.compact line 75 char 1',
                                 'Bytes<32>',
                                 auditorVkHash_0)
    }
    return _dummyContract._deriveAuditorCommitment_0(auditorVkHash_0);
  },
  deriveNullifierBlindingSalt: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`deriveNullifierBlindingSalt: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('deriveNullifierBlindingSalt',
                                 'argument 1',
                                 'proofvault.compact line 82 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._deriveNullifierBlindingSalt_0(sk_0);
  },
  deriveNullifier: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`deriveNullifier: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const nullifierSalt_0 = args_0[0];
    const vendorId_0 = args_0[1];
    const lineItemsHash_0 = args_0[2];
    if (!(nullifierSalt_0.buffer instanceof ArrayBuffer && nullifierSalt_0.BYTES_PER_ELEMENT === 1 && nullifierSalt_0.length === 32)) {
      __compactRuntime.typeError('deriveNullifier',
                                 'argument 1',
                                 'proofvault.compact line 89 char 1',
                                 'Bytes<32>',
                                 nullifierSalt_0)
    }
    if (!(vendorId_0.buffer instanceof ArrayBuffer && vendorId_0.BYTES_PER_ELEMENT === 1 && vendorId_0.length === 32)) {
      __compactRuntime.typeError('deriveNullifier',
                                 'argument 2',
                                 'proofvault.compact line 89 char 1',
                                 'Bytes<32>',
                                 vendorId_0)
    }
    if (!(lineItemsHash_0.buffer instanceof ArrayBuffer && lineItemsHash_0.BYTES_PER_ELEMENT === 1 && lineItemsHash_0.length === 32)) {
      __compactRuntime.typeError('deriveNullifier',
                                 'argument 3',
                                 'proofvault.compact line 89 char 1',
                                 'Bytes<32>',
                                 lineItemsHash_0)
    }
    return _dummyContract._deriveNullifier_0(nullifierSalt_0,
                                             vendorId_0,
                                             lineItemsHash_0);
  },
  deriveInvoiceCommitment: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`deriveInvoiceCommitment: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const vendorId_0 = args_0[0];
    const lineItemsHash_0 = args_0[1];
    const amount_0 = args_0[2];
    const jurisdictionLeafDigest_0 = args_0[3];
    const salt_0 = args_0[4];
    if (!(vendorId_0.buffer instanceof ArrayBuffer && vendorId_0.BYTES_PER_ELEMENT === 1 && vendorId_0.length === 32)) {
      __compactRuntime.typeError('deriveInvoiceCommitment',
                                 'argument 1',
                                 'proofvault.compact line 102 char 1',
                                 'Bytes<32>',
                                 vendorId_0)
    }
    if (!(lineItemsHash_0.buffer instanceof ArrayBuffer && lineItemsHash_0.BYTES_PER_ELEMENT === 1 && lineItemsHash_0.length === 32)) {
      __compactRuntime.typeError('deriveInvoiceCommitment',
                                 'argument 2',
                                 'proofvault.compact line 102 char 1',
                                 'Bytes<32>',
                                 lineItemsHash_0)
    }
    if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('deriveInvoiceCommitment',
                                 'argument 3',
                                 'proofvault.compact line 102 char 1',
                                 'Uint<0..18446744073709551616>',
                                 amount_0)
    }
    if (!(jurisdictionLeafDigest_0.buffer instanceof ArrayBuffer && jurisdictionLeafDigest_0.BYTES_PER_ELEMENT === 1 && jurisdictionLeafDigest_0.length === 32)) {
      __compactRuntime.typeError('deriveInvoiceCommitment',
                                 'argument 4',
                                 'proofvault.compact line 102 char 1',
                                 'Bytes<32>',
                                 jurisdictionLeafDigest_0)
    }
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('deriveInvoiceCommitment',
                                 'argument 5',
                                 'proofvault.compact line 102 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._deriveInvoiceCommitment_0(vendorId_0,
                                                     lineItemsHash_0,
                                                     amount_0,
                                                     jurisdictionLeafDigest_0,
                                                     salt_0);
  }
};
export const expectedVk = {
  'proveTreasurySolvency': '3502eed14610918206fdee3c8cf57706d8a0a9abbbefad059fbf79c3b7d67aa3',
  'registerApprovedJurisdiction': '6efc899e6c6fb576836a4d0652e6507e8b2ca71ee1c030a22106a3896cedc865',
  'settleConfidentialInvoice': '5f2631855ea13ba5cd300be061d423b099393dd19fcb8c67ba53b021666bf017',
  'updateGovernancePolicy': '862b8edb04cdefdaf8776fda98ac1c8b50cb632c3d53a1253e5cedba531486c3',
  'verifyReceiptOnChain': '2246d4cff17819fce3731af475494025d19b518526d113ab7b60806156278322',
};

export const circuitSignatures = {
  'deriveOperatorPublicKey': {pure: true, provable: false, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Bytes', length: 32}},
  'deriveAuditorCommitment': {pure: true, provable: false, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Bytes', length: 32}},
  'deriveNullifierBlindingSalt': {pure: true, provable: false, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Bytes', length: 32}},
  'deriveNullifier': {pure: true, provable: false, argumentTypes: [{tag: 'Bytes', length: 32}, {tag: 'Bytes', length: 32}, {tag: 'Bytes', length: 32}], resultType: {tag: 'Bytes', length: 32}},
  'deriveInvoiceCommitment': {pure: true, provable: false, argumentTypes: [{tag: 'Bytes', length: 32}, {tag: 'Bytes', length: 32}, {tag: 'Uint', maxval: '18446744073709551615'}, {tag: 'Bytes', length: 32}, {tag: 'Bytes', length: 32}], resultType: {tag: 'Bytes', length: 32}},
  'registerApprovedJurisdiction': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Tuple', types: []}},
  'proveTreasurySolvency': {pure: false, provable: true, argumentTypes: [{tag: 'Uint', maxval: '18446744073709551615'}], resultType: {tag: 'Bytes', length: 32}},
  'settleConfidentialInvoice': {pure: false, provable: true, argumentTypes: [{tag: 'Uint', maxval: '18446744073709551615'}, {tag: 'Enum', name: 'DisclosureTier', elements: ['MinimalSolvency', 'ThresholdBand', 'AuditorScoped']}], resultType: {tag: 'Bytes', length: 32}},
  'updateGovernancePolicy': {pure: false, provable: true, argumentTypes: [{tag: 'Uint', maxval: '18446744073709551615'}, {tag: 'Uint', maxval: '18446744073709551615'}, {tag: 'Enum', name: 'VaultStatus', elements: ['Active', 'Paused']}], resultType: {tag: 'Tuple', types: []}},
  'verifyReceiptOnChain': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Boolean'}},
};

export const declaredInterfaces = {};

//# sourceMappingURL=index.js.map
