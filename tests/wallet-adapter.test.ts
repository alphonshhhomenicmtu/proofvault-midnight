import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import {
  connectMidnightWallet,
  discoverMidnightWallets
} from "../src/midnight/walletAdapter";

describe("Midnight DApp Connector API v4.1 Wallet Adapter (Lace)", () => {
  const originalMidnight = (globalThis as { midnight?: unknown }).midnight;

  afterEach(() => {
    if (originalMidnight === undefined) {
      delete (globalThis as { midnight?: unknown }).midnight;
    } else {
      (globalThis as { midnight?: unknown }).midnight = originalMidnight;
    }
  });

  it("discovers UUID-injected Midnight wallets and connects with configuration & Bech32m addresses", async () => {
    const mockConnected = {
      getConfiguration: vi.fn().mockResolvedValue({
        indexerUri: "https://indexer.preprod.midnight.network/api/v3/graphql",
        indexerWsUri: "wss://indexer.preprod.midnight.network/api/v3/graphql/ws",
        proverServerUri: "http://127.0.0.1:6300",
        substrateNodeUri: "wss://rpc.preprod.midnight.network",
        networkId: "preprod"
      }),
      getShieldedAddresses: vi.fn().mockResolvedValue({
        shieldedAddress: "mn_shield-addr_preprod1q9 proofvaultshieldeddemo0001",
        shieldedCoinPublicKey: "mn_shield-cpk_preprod1demo",
        shieldedEncryptionPublicKey: "mn_shield-epk_preprod1demo"
      }),
      getUnshieldedAddress: vi.fn().mockResolvedValue({
        unshieldedAddress: "mn_addr_preprod1proofvaultunshielded0001"
      }),
      getDustAddress: vi.fn().mockResolvedValue({
        dustAddress: "mn_dust_preprod1proofvaultdust0001"
      })
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

    const wallets = discoverMidnightWallets();
    expect(wallets).toHaveLength(1);
    expect(wallets[0]).toEqual({
      key: walletUuid,
      name: "Lace Midnight Wallet",
      apiVersion: "4.1.0"
    });

    const { state, connectedApi } = await connectMidnightWallet(walletUuid, "preprod");
    expect(connectedApi).toBe(mockConnected);
    expect(state.mode).toBe("lace-wallet");
    expect(state.walletConnected).toBe(true);
    expect(state.networkId).toBe("preprod");
    expect(state.shieldedAddress).toContain("mn_shield-addr_preprod1");
    expect(state.serviceUris?.indexerUri).toContain("preprod.midnight.network");
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
});
