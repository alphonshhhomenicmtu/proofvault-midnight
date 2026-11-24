import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import {
  connectMidnightWallet,
  createProofVaultKeyMaterialProvider,
  discoverMidnightWallets,
  dispatchWalletTransaction
} from "../src/midnight/walletAdapter";

describe("Midnight DApp Connector API v4.1 Wallet Adapter (Lace & 1AM)", () => {
  const originalMidnight = (globalThis as { midnight?: unknown }).midnight;

  afterEach(() => {
    if (originalMidnight === undefined) {
      delete (globalThis as { midnight?: unknown }).midnight;
    } else {
      (globalThis as { midnight?: unknown }).midnight = originalMidnight;
    }
  });

  it("discovers Lace and 1AM wallets under window.midnight with deterministic priority ordering", () => {
    const makeWallet = (name: string, rdns: string): InitialAPI => ({
      rdns,
      name,
      icon: "",
      apiVersion: "4.1.0",
      connect: vi.fn()
    });

    (globalThis as { midnight?: Record<string, InitialAPI> }).midnight = {
      "generic-uuid": makeWallet("Custom Midnight Signer", "io.custom.signer"),
      "1am-uuid": makeWallet("1AM Midnight Wallet", "app.1am.midnight"),
      "lace-uuid": makeWallet("Lace Midnight Wallet", "io.lace.midnight")
    };

    const wallets = discoverMidnightWallets();
    expect(wallets).toHaveLength(3);
    expect(wallets[0].brand).toBe("lace");
    expect(wallets[1].brand).toBe("1am");
    expect(wallets[2].brand).toBe("other");
  });

  it("connects via UUID, calls hintUsage, and hydrates Bech32m addresses, DUST balance & proving mode", async () => {
    const mockConnected = {
      hintUsage: vi.fn().mockResolvedValue(undefined),
      getConfiguration: vi.fn().mockResolvedValue({
        indexerUri: "https://indexer.preview.midnight.network/api/v4/graphql",
        indexerWsUri: "wss://indexer.preview.midnight.network/api/v4/graphql/ws",
        proverServerUri: "http://127.0.0.1:6300",
        substrateNodeUri: "wss://rpc.preview.midnight.network",
        networkId: "preview"
      }),
      getShieldedAddresses: vi.fn().mockResolvedValue({
        shieldedAddress: "mn_shield-addr_preview1q9proofvaultshieldeddemo0001",
        shieldedCoinPublicKey: "mn_shield-cpk_preview1demo",
        shieldedEncryptionPublicKey: "mn_shield-epk_preview1demo"
      }),
      getUnshieldedAddress: vi.fn().mockResolvedValue({
        unshieldedAddress: "mn_addr_preview1proofvaultunshielded0001"
      }),
      getDustAddress: vi.fn().mockResolvedValue({
        dustAddress: "mn_dust_preview1proofvaultdust0001"
      }),
      getDustBalance: vi.fn().mockResolvedValue({
        balance: 420_000_000n,
        cap: 1_000_000_000n
      }),
      getProvingProvider: vi.fn()
    } as unknown as ConnectedAPI;

    const mockInitial: InitialAPI = {
      rdns: "io.lace.midnight",
      name: "Lace Midnight Wallet",
      icon: "https://lace.io/icon.svg",
      apiVersion: "4.1.0",
      connect: vi.fn().mockResolvedValue(mockConnected)
    };

    const walletUuid = "9e81f2c4-5d01-4b2c-9f22-112233445566";
    (globalThis as { midnight?: Record<string, InitialAPI> }).midnight = {
      [walletUuid]: mockInitial
    };

    const { state, connectedApi } = await connectMidnightWallet(walletUuid, "preview");
    expect(connectedApi).toBe(mockConnected);
    expect(mockConnected.hintUsage).toHaveBeenCalledTimes(1);
    expect(state.mode).toBe("lace-wallet");
    expect(state.walletConnected).toBe(true);
    expect(state.networkId).toBe("preview");
    expect(state.walletRdns).toBe("io.lace.midnight");
    expect(state.shieldedAddress).toContain("mn_shield-addr_preview1");
    expect(state.dustBalance).toBe("420000000");
    expect(state.dustCap).toBe("1000000000");
    expect(state.provingMode).toBe("wallet-proving-provider");
    expect(state.serviceUris?.proverServerUri).toBe("http://127.0.0.1:6300");
    expect(state.error).toBeNull();
  });

  it("falls back cleanly to Local Proof Engine mode when wallet authorization is rejected", async () => {
    const mockInitial: InitialAPI = {
      rdns: "io.lace.midnight",
      name: "Lace Midnight Wallet",
      icon: "",
      apiVersion: "4.1.0",
      connect: vi.fn().mockRejectedValue(new Error("User rejected connection request"))
    };

    (globalThis as { midnight?: Record<string, InitialAPI> }).midnight = {
      mnLace: mockInitial
    };

    const { state } = await connectMidnightWallet("mnLace", "preprod");
    expect(state.mode).toBe("local-simulator");
    expect(state.walletConnected).toBe(false);
    expect(state.error).toContain("User rejected connection request");
  });

  it("dispatches full balanceUnsealedTransaction -> submitTransaction pipeline when unsealed tx is supplied", async () => {
    const mockConnected = {
      balanceUnsealedTransaction: vi.fn().mockResolvedValue({ tx: "balanced_deadbeef_01" }),
      submitTransaction: vi.fn().mockResolvedValue(undefined),
      getProvingProvider: vi.fn()
    } as unknown as ConnectedAPI;

    const res = await dispatchWalletTransaction(mockConnected, {
      circuitName: "settleConfidentialInvoice",
      walletName: "Lace Midnight Wallet",
      networkId: "preview",
      proverServerUri: "http://127.0.0.1:6300",
      unsealedTxHex: "unsealed_cafe01",
      commitmentPayloadHex: "aa".repeat(32)
    });

    expect(res.ok).toBe(true);
    expect(res.dispatchPath).toBe("balance-and-submit");
    expect(res.submittedOnChain).toBe(true);
    expect(res.balancedTxHex).toBe("balanced_deadbeef_01");
    expect(mockConnected.balanceUnsealedTransaction).toHaveBeenCalledWith("unsealed_cafe01", { payFees: true });
    expect(mockConnected.submitTransaction).toHaveBeenCalledWith("balanced_deadbeef_01");
  });

  it("falls back to cryptographic signData endorsement when operating in static wallet-connected mode", async () => {
    const mockConnected = {
      signData: vi.fn().mockResolvedValue({
        scheme: "schnorr_bip340",
        data: "bb".repeat(32),
        signature: "cc".repeat(64),
        verifyingKey: "dd".repeat(32)
      })
    } as unknown as ConnectedAPI;

    const res = await dispatchWalletTransaction(mockConnected, {
      circuitName: "settleConfidentialInvoice",
      walletName: "1AM Midnight Wallet",
      networkId: "preview",
      commitmentPayloadHex: "bb".repeat(32)
    });

    expect(res.ok).toBe(true);
    expect(res.dispatchPath).toBe("wallet-sign-attestation");
    expect(res.submittedOnChain).toBe(false);
    expect(res.signatureScheme).toBe("schnorr_bip340");
    expect(res.signatureHex).toBe("cc".repeat(64));
    expect(mockConnected.signData).toHaveBeenCalledWith("bb".repeat(32), {
      encoding: "hex",
      keyType: "unshielded"
    });
  });

  it("loads Compact ZKIR, prover, and verifier artifacts via KeyMaterialProvider", async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string) => ({
      ok: true,
      status: 200,
      arrayBuffer: async () => new TextEncoder().encode(url).buffer
    })) as unknown as typeof fetch;

    const provider = createProofVaultKeyMaterialProvider("https://example.org/managed/proofvault/", mockFetch);
    const zkir = await provider.getZKIR("settleConfidentialInvoice");
    const prover = await provider.getProverKey("settleConfidentialInvoice");
    const verifier = await provider.getVerifierKey("settleConfidentialInvoice");

    expect(new TextDecoder().decode(zkir)).toBe("https://example.org/managed/proofvault/zkir/settleConfidentialInvoice.bzkir");
    expect(new TextDecoder().decode(prover)).toBe("https://example.org/managed/proofvault/keys/settleConfidentialInvoice.prover");
    expect(new TextDecoder().decode(verifier)).toBe("https://example.org/managed/proofvault/keys/settleConfidentialInvoice.verifier");
  });
});
