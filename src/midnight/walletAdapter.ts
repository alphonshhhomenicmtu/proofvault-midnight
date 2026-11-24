import "@midnight-ntwrk/dapp-connector-api";
import type {
  ConnectedAPI,
  InitialAPI,
  KeyMaterialProvider,
  WalletConnectedAPI
} from "@midnight-ntwrk/dapp-connector-api";
import type {
  DiscoveredWallet,
  MidnightNetworkId,
  WalletConnectionState,
  WalletDispatchResult
} from "./types";

function getMidnightRegistry(): Record<string, InitialAPI> | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return (globalThis as typeof globalThis & { midnight?: Record<string, InitialAPI> }).midnight;
}

function detectWalletBrand(key: string, name: string, rdns: string): "lace" | "1am" | "other" {
  const haystack = `${key} ${name} ${rdns}`.toLowerCase();
  if (haystack.includes("lace")) return "lace";
  if (haystack.includes("1am") || haystack.includes("oneam")) return "1am";
  return "other";
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
    const rdns = typeof api.rdns === "string" && api.rdns.trim() ? api.rdns : `midnight.${key}`;
    const name =
      typeof api.name === "string" && api.name.trim()
        ? api.name
        : key === "mnLace"
          ? "Lace (Midnight)"
          : `Midnight Wallet (${key.slice(0, 8)})`;
    found.push({
      key,
      name,
      rdns,
      apiVersion: typeof api.apiVersion === "string" ? api.apiVersion : "4.x",
      brand: detectWalletBrand(key, name, rdns)
    });
  }

  const order: Record<DiscoveredWallet["brand"], number> = { lace: 0, "1am": 1, other: 2 };
  found.sort((a, b) => order[a.brand] - order[b.brand]);
  return found;
}

const RECOMMENDED_HINT_METHODS: Array<keyof WalletConnectedAPI> = [
  "getConfiguration",
  "getShieldedAddresses",
  "getUnshieldedAddress",
  "getDustAddress",
  "getDustBalance",
  "balanceUnsealedTransaction",
  "submitTransaction",
  "getProvingProvider",
  "signData"
];

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
        walletRdns: null,
        shieldedAddress: null,
        unshieldedAddress: null,
        dustAddress: null,
        dustBalance: null,
        dustCap: null,
        provingMode: "local-engine",
        serviceUris: null,
        lastDispatch: null,
        error:
          "No Midnight browser wallet (Lace or 1AM) detected on window.midnight. Use the browser SHA-256 Circuit Simulator and the walletless Midnight Preview Indexer reader below."
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
        walletRdns: null,
        shieldedAddress: null,
        unshieldedAddress: null,
        dustAddress: null,
        dustBalance: null,
        dustCap: null,
        provingMode: "local-engine",
        serviceUris: null,
        lastDispatch: null,
        error: `Selected wallet provider "${target.name}" does not expose connect(networkId).`
      }
    };
  }

  try {
    const connectedApi = await initialApi.connect(networkId);
    if (typeof connectedApi.hintUsage === "function") {
      await connectedApi.hintUsage(RECOMMENDED_HINT_METHODS).catch(() => {});
    }

    const [config, shielded, unshielded, dustAddr, dustBal] = await Promise.all([
      connectedApi.getConfiguration().catch(() => null),
      connectedApi.getShieldedAddresses().catch(() => null),
      connectedApi.getUnshieldedAddress().catch(() => null),
      connectedApi.getDustAddress().catch(() => null),
      typeof connectedApi.getDustBalance === "function"
        ? connectedApi.getDustBalance().catch(() => null)
        : Promise.resolve(null)
    ]);

    const provingMode: WalletConnectionState["provingMode"] =
      typeof connectedApi.getProvingProvider === "function"
        ? "wallet-proving-provider"
        : config?.proverServerUri
          ? "http-prover"
          : "local-engine";

    return {
      connectedApi,
      state: {
        mode: "lace-wallet",
        networkId,
        walletConnected: true,
        walletName: target.name,
        walletKey: target.key,
        walletRdns: target.rdns,
        shieldedAddress: shielded?.shieldedAddress ?? null,
        unshieldedAddress: unshielded?.unshieldedAddress ?? null,
        dustAddress: dustAddr?.dustAddress ?? null,
        dustBalance: dustBal ? dustBal.balance.toString() : null,
        dustCap: dustBal ? dustBal.cap.toString() : null,
        provingMode,
        serviceUris: config
          ? {
              indexerUri: config.indexerUri,
              indexerWsUri: config.indexerWsUri,
              proverServerUri: config.proverServerUri,
              substrateNodeUri: config.substrateNodeUri
            }
          : null,
        lastDispatch: null,
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
        walletRdns: target.rdns,
        shieldedAddress: null,
        unshieldedAddress: null,
        dustAddress: null,
        dustBalance: null,
        dustCap: null,
        provingMode: "local-engine",
        serviceUris: null,
        lastDispatch: null,
        error: message
      }
    };
  }
}

/**
 * KeyMaterialProvider implementation compatible with @midnight-ntwrk/dapp-connector-api v4.1
 * connectedApi.getProvingProvider(keyMaterialProvider) for delegated wallet ZK proving.
 */
export function createProofVaultKeyMaterialProvider(
  assetBaseUrl: string,
  fetchImpl: typeof fetch = globalThis.fetch
): KeyMaterialProvider {
  const base = assetBaseUrl.replace(/\/+$/, "");

  const fetchBytes = async (relativePath: string): Promise<Uint8Array> => {
    const res = await fetchImpl(`${base}/${relativePath}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch Compact circuit material ${relativePath} (HTTP ${res.status})`);
    }
    return new Uint8Array(await res.arrayBuffer());
  };

  return {
    getZKIR: (circuitKeyLocation: string) => fetchBytes(`zkir/${circuitKeyLocation}.bzkir`),
    getProverKey: (circuitKeyLocation: string) => fetchBytes(`keys/${circuitKeyLocation}.prover`),
    getVerifierKey: (circuitKeyLocation: string) => fetchBytes(`keys/${circuitKeyLocation}.verifier`)
  };
}

export interface WalletDispatchRequest {
  circuitName: "settleConfidentialInvoice" | "proveTreasurySolvency" | "registerApprovedJurisdiction" | "updateGovernancePolicy";
  walletName: string;
  networkId: MidnightNetworkId;
  proverServerUri?: string;
  /** Serialized unsealed Ledger 9 transaction hex when a live Proof Server built the ZK tx */
  unsealedTxHex?: string;
  /** Local simulator receipt ID hex for wallet connectivity signData check */
  commitmentPayloadHex: string;
  payFees?: boolean;
}

/**
 * Interfaces with an active @midnight-ntwrk/dapp-connector-api v4.1 session (Lace or 1AM).
 *
 * - Path A (Live Prover Tx): when `unsealedTxHex` is built from the compiled Contract class
 *   and a Midnight Proof Server, balances DUST fees via `balanceUnsealedTransaction` and calls
 *   `submitTransaction`.
 * - Path B (Static Simulator Wallet Check): in the static browser demo (no local Proof Server),
 *   runs `signData()` over the local SHA-256 receipt ID as a wallet connectivity & signature check
 *   (does not broadcast a Midnight Ledger 9 contract transaction).
 */
export async function dispatchWalletTransaction(
  connectedApi: ConnectedAPI | undefined,
  request: WalletDispatchRequest
): Promise<WalletDispatchResult> {
  const timestampIso = new Date().toISOString();
  const proverPath = request.proverServerUri
    ? `HTTP Prover (${request.proverServerUri})`
    : typeof connectedApi?.getProvingProvider === "function"
      ? "Wallet Delegated ProvingProvider (dapp-connector-api v4.1)"
      : "SHA-256 Browser Circuit Simulator";

  if (!connectedApi) {
    return {
      ok: false,
      dispatchPath: "unavailable",
      walletName: request.walletName,
      networkId: request.networkId,
      proverPath,
      submittedOnChain: false,
      detail: "No active ConnectedAPI wallet handle.",
      timestampIso,
      error: "Connect Lace or 1AM wallet before signing."
    };
  }

  // Path A: Full unsealed Midnight Ledger 9 transaction balance + broadcast
  if (
    request.unsealedTxHex &&
    typeof connectedApi.balanceUnsealedTransaction === "function" &&
    typeof connectedApi.submitTransaction === "function"
  ) {
    try {
      const balanced = await connectedApi.balanceUnsealedTransaction(request.unsealedTxHex, {
        payFees: request.payFees ?? true
      });
      await connectedApi.submitTransaction(balanced.tx);
      return {
        ok: true,
        dispatchPath: "balance-and-submit",
        walletName: request.walletName,
        networkId: request.networkId,
        proverPath,
        submittedOnChain: true,
        balancedTxHex: balanced.tx,
        detail: `Balanced via ${request.walletName} (DUST fees paid) and submitted ${request.circuitName}() to Midnight ${request.networkId}.`,
        timestampIso
      };
    } catch (err) {
      return {
        ok: false,
        dispatchPath: "balance-and-submit",
        walletName: request.walletName,
        networkId: request.networkId,
        proverPath,
        submittedOnChain: false,
        detail: `Wallet transaction balance/submit aborted for ${request.circuitName}().`,
        timestampIso,
        error: err instanceof Error ? err.message : "Wallet transaction dispatch failed."
      };
    }
  }

  // Path B: Wallet connectivity & signature check over local SHA-256 receipt ID
  if (typeof connectedApi.signData === "function") {
    try {
      const sig = await connectedApi.signData(request.commitmentPayloadHex, {
        encoding: "hex",
        keyType: "unshielded"
      });
      return {
        ok: true,
        dispatchPath: "wallet-sign-attestation",
        walletName: request.walletName,
        networkId: request.networkId,
        proverPath,
        submittedOnChain: false,
        signatureHex: sig.signature,
        verifyingKeyHex: sig.verifyingKey,
        signatureScheme: sig.scheme ?? "schnorr_bip340",
        detail: `Wallet connectivity check passed (${request.walletName} signed local SHA-256 receipt ID via ${sig.scheme ?? "schnorr_bip340"}). Live on-chain contract submission requires an unsealed Ledger 9 tx from the compiled Contract class and Proof Server 9.0.2.`,
        timestampIso
      };
    } catch (err) {
      return {
        ok: false,
        dispatchPath: "wallet-sign-attestation",
        walletName: request.walletName,
        networkId: request.networkId,
        proverPath,
        submittedOnChain: false,
        detail: "Wallet signData check declined.",
        timestampIso,
        error: err instanceof Error ? err.message : "User declined wallet signature."
      };
    }
  }

  return {
    ok: false,
    dispatchPath: "unavailable",
    walletName: request.walletName,
    networkId: request.networkId,
    proverPath,
    submittedOnChain: false,
    detail: "Connected wallet exposes neither balanceUnsealedTransaction/submitTransaction nor signData.",
    timestampIso,
    error: "Unsupported wallet ConnectedAPI capability set."
  };
}

export function createDefaultWalletState(): WalletConnectionState {
  return {
    mode: "local-simulator",
    networkId: "preview",
    walletConnected: false,
    walletName: null,
    walletKey: null,
    walletRdns: null,
    shieldedAddress: null,
    unshieldedAddress: null,
    dustAddress: null,
    dustBalance: null,
    dustCap: null,
    provingMode: "local-engine",
    serviceUris: null,
    lastDispatch: null,
    error: null
  };
}
