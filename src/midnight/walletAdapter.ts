import "@midnight-ntwrk/dapp-connector-api";
import type { InitialAPI, ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { DiscoveredWallet, MidnightNetworkId, WalletConnectionState } from "./types";

function getMidnightRegistry(): Record<string, InitialAPI> | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return (globalThis as typeof globalThis & { midnight?: Record<string, InitialAPI> }).midnight;
}

export function discoverMidnightWallets(): DiscoveredWallet[] {
  const registry = getMidnightRegistry();
  if (!registry) {
    return [];
  }

  const found: DiscoveredWallet[] = [];
  for (const [key, api] of Object.entries(registry)) {
    if (!api || typeof api !== "object") continue;
    if (typeof api.connect !== "function") continue;
    found.push({
      key,
      name:
        typeof api.name === "string" && api.name.trim()
          ? api.name
          : key === "mnLace"
            ? "Lace (Midnight)"
            : `Midnight Wallet (${key.slice(0, 8)})`,
      apiVersion: typeof api.apiVersion === "string" ? api.apiVersion : "4.x"
    });
  }
  return found;
}

export async function connectMidnightWallet(
  walletKey: string | undefined,
  networkId: MidnightNetworkId
): Promise<{ state: WalletConnectionState; connectedApi?: ConnectedAPI }> {
  const wallets = discoverMidnightWallets();
  if (wallets.length === 0) {
    return {
      state: {
        mode: "local-simulator",
        networkId,
        walletConnected: false,
        walletName: null,
        walletKey: null,
        shieldedAddress: null,
        unshieldedAddress: null,
        dustAddress: null,
        serviceUris: null,
        error:
          "No Midnight browser wallet (Lace) detected on window.midnight. Stay in Local Proof Engine mode for full deterministic ZK settlement and receipt verification."
      }
    };
  }

  const target = walletKey ? wallets.find((w) => w.key === walletKey) ?? wallets[0] : wallets[0];
  const initialApi = getMidnightRegistry()?.[target.key];
  if (!initialApi || typeof initialApi.connect !== "function") {
    return {
      state: {
        mode: "local-simulator",
        networkId,
        walletConnected: false,
        walletName: null,
        walletKey: null,
        shieldedAddress: null,
        unshieldedAddress: null,
        dustAddress: null,
        serviceUris: null,
        error: `Selected wallet provider "${target.name}" does not expose connect(networkId).`
      }
    };
  }

  try {
    const connectedApi = await initialApi.connect(networkId);
    const [config, shielded, unshielded, dust] = await Promise.all([
      connectedApi.getConfiguration().catch(() => null),
      connectedApi.getShieldedAddresses().catch(() => null),
      connectedApi.getUnshieldedAddress().catch(() => null),
      connectedApi.getDustAddress().catch(() => null)
    ]);

    return {
      connectedApi,
      state: {
        mode: "lace-wallet",
        networkId,
        walletConnected: true,
        walletName: target.name,
        walletKey: target.key,
        shieldedAddress: shielded?.shieldedAddress ?? null,
        unshieldedAddress: unshielded?.unshieldedAddress ?? null,
        dustAddress: dust?.dustAddress ?? null,
        serviceUris: config
          ? {
              indexerUri: config.indexerUri,
              indexerWsUri: config.indexerWsUri,
              proverServerUri: config.proverServerUri,
              substrateNodeUri: config.substrateNodeUri
            }
          : null,
        error: null
      }
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Wallet authorization rejected by user.";
    return {
      state: {
        mode: "local-simulator",
        networkId,
        walletConnected: false,
        walletName: target.name,
        walletKey: target.key,
        shieldedAddress: null,
        unshieldedAddress: null,
        dustAddress: null,
        serviceUris: null,
        error: message
      }
    };
  }
}

export function createDefaultWalletState(): WalletConnectionState {
  return {
    mode: "local-simulator",
    networkId: "preprod",
    walletConnected: false,
    walletName: null,
    walletKey: null,
    shieldedAddress: null,
    unshieldedAddress: null,
    dustAddress: null,
    serviceUris: null,
    error: null
  };
}
