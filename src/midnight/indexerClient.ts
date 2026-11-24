import type { LiveIndexerSnapshot } from "./types";

export interface IndexerEndpointPreset {
  id: "preview" | "preprod" | "custom";
  label: string;
  graphqlUri: string;
  rpcUri: string;
  explorerBaseUrl: string | null;
  publicNoAuth: boolean;
  note: string;
}

export interface LiveDeploymentTxRecord {
  circuit: string;
  label: string;
  txHash: string;
  blockHeight: number;
  status: "SucceedEntirely";
  note: string;
}

export const LIVE_PREVIEW_DEPLOYMENT = {
  network: "preview" as const,
  contractAddress: "9ae57d40331df50a9a30340d2f2a612f7e6cf8fa99112d11e630c7b3f4228bc8",
  deployTxHash: "a952332ea1c3680295a853ad1ec4ede82ae1e82f9dcda0e61630f7db15264747",
  deployBlockHeight: 250802,
  latestBlockHeight: 250861,
  settledInvoiceCount: 1,
  serializedStateBytes: 11697,
  receiptIdHex: "fa1ccd4f6b061f46745f053afee56c2460c5cbb066413744e73274f384516822",
  solvencyAttestationHex: "90264f766319a06d59e25bdf0842537b12d3e0316849af178a12d2e51afce656",
  contractVersionNote:
    "Live Preview contract (0x9ae57d40...4228bc8) runs the v2.0 Compact 0.28.0 artifact proved via Proof Server 9.0.2 with 2 registered jurisdiction leaves (iso:CH, iso:SG — a 1-of-2 anonymity set). The hardened v2.1 circuit (secret-keyed nullifiers, jurisdiction-bound commitments, strict cap > amount, registered auditor authorization, persisted solvency state) is compiled with compactc 0.36.1 and verified via @midnight-ntwrk/compact-runtime@0.21.0 in npm test.",
  transactions: [
    {
      circuit: "ContractDeploy",
      label: "Deploy ProofVault (Compact 0.28.0 / Ledger 9)",
      txHash: "a952332ea1c3680295a853ad1ec4ede82ae1e82f9dcda0e61630f7db15264747",
      blockHeight: 250802,
      status: "SucceedEntirely",
      note: "Initialized shielded balance commitment, operator key digest & public governance caps"
    },
    {
      circuit: "registerApprovedJurisdiction",
      label: "Register Jurisdiction CH (Switzerland)",
      txHash: "92d830abe80c3df4c0b245aab6c8c0d5649de782a97f615c2e76a99922c3fb21",
      blockHeight: 250831,
      status: "SucceedEntirely",
      note: "Inserted iso:CH leaf into on-chain HistoricMerkleTree<8>"
    },
    {
      circuit: "registerApprovedJurisdiction",
      label: "Register Jurisdiction SG (Singapore)",
      txHash: "ad9189709834908fa9ccd5cbbd9f06a3426f6dc8d0749f047fcd2cee9c2370fb",
      blockHeight: 250838,
      status: "SucceedEntirely",
      note: "Inserted iso:SG leaf into on-chain HistoricMerkleTree<8> (2-leaf tree on Preview)"
    },
    {
      circuit: "proveTreasurySolvency",
      label: "ZK Solvency Proof (Public Floor >= $2.00M)",
      txHash: "743afa89e518f514353752b970fe66341bec8b4b2b5c97eb23ee7873200c12ba",
      blockHeight: 250844,
      status: "SucceedEntirely",
      note: "Attestation 0x90264f76...afce656 verified without disclosing exact balance"
    },
    {
      circuit: "settleConfidentialInvoice",
      label: "Confidential Settlement (Shielded Payout under $50k Cap)",
      txHash: "c60a81d352fcb277c4b187bea22757df339d2c8c096af0490b491a97feb2e059",
      blockHeight: 250852,
      status: "SucceedEntirely",
      note: "AuditorScoped receipt 0xfa1ccd4f...4516822 written; exact payout kept off-chain"
    },
    {
      circuit: "verifyReceiptOnChain",
      label: "Verify AuditReceipt Membership On-Chain",
      txHash: "0043a6dcb17177b8b3b4d291b078bbac4284222de67763d2b38be532f2ac3d4b",
      blockHeight: 250861,
      status: "SucceedEntirely",
      note: "Returned true confirming on-chain auditReceipts map membership"
    }
  ] as LiveDeploymentTxRecord[]
} as const;

export const MIDNIGHT_INDEXER_PRESETS: Record<"preview" | "preprod", IndexerEndpointPreset> = {
  preview: {
    id: "preview",
    label: "Midnight Preview (Public v4 GraphQL · Zero-Auth)",
    graphqlUri: "https://indexer.preview.midnight.network/api/v4/graphql",
    rpcUri: "https://rpc.preview.midnight.network",
    explorerBaseUrl: "https://explorer.preview.midnight.network",
    publicNoAuth: true,
    note: "Official live Ledger 9 Preview Indexer with CORS enabled; verifies chain head and deployed contract state walletlessly."
  },
  preprod: {
    id: "preprod",
    label: "Midnight Preprod (Blockfrost v4 GraphQL · Token Optional)",
    graphqlUri: "https://indexer.midnight-preprod.blockfrost.io/api/v4/graphql",
    rpcUri: "https://rpc.midnight-preprod.blockfrost.io",
    explorerBaseUrl: "https://preprod.midnightexplorer.com",
    publicNoAuth: false,
    note: "Midnight decommissioned legacy indexer.preprod.midnight.network on 2026-10-09; Preprod queries route via Blockfrost project_id or Lace serviceUris."
  }
};

export interface IndexerQueryOptions {
  network: "preview" | "preprod" | "custom";
  endpointOverride?: string;
  contractAddress?: string;
  blockfrostProjectId?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export function normalizeHexAddress(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^0x/i, "").toLowerCase();
  if (!cleaned) return null;
  if (!/^[0-9a-f]{8,128}$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

export function buildIndexerGraphQLQuery(normalizedContractAddress: string | null): {
  query: string;
  variables?: Record<string, string>;
} {
  if (normalizedContractAddress) {
    return {
      query: `query VerifyProofVaultState($address: HexEncoded!) {
  block {
    height
    hash
    timestamp
    protocolVersion
    zswapMerkleTreeRoot
    dustCommitmentMerkleTreeRoot
  }
  contractAction(address: $address) {
    __typename
    address
    state
    stateAt {
      height
      hash
      protocolVersion
    }
    transaction {
      hash
    }
    ... on ContractCall {
      entryPoint
    }
  }
}`,
      variables: { address: normalizedContractAddress }
    };
  }

  return {
    query: `query VerifyMidnightChainHead {
  block {
    height
    hash
    timestamp
    protocolVersion
    zswapMerkleTreeRoot
    dustCommitmentMerkleTreeRoot
  }
}`
  };
}

interface GraphQLBlock {
  height?: number;
  hash?: string;
  timestamp?: number | string;
  protocolVersion?: number;
  zswapMerkleTreeRoot?: string;
  dustCommitmentMerkleTreeRoot?: string;
}

interface GraphQLContractAction {
  __typename?: string;
  address?: string;
  state?: string;
  entryPoint?: string;
  stateAt?: {
    height?: number;
    hash?: string;
    protocolVersion?: number;
  };
  transaction?: {
    hash?: string;
  };
}

interface GraphQLResponse {
  data?: {
    block?: GraphQLBlock | null;
    contractAction?: GraphQLContractAction | null;
  } | null;
  errors?: Array<{
    message?: string;
    extensions?: {
      code?: string;
      migrationGuide?: string;
    };
  }>;
}

function parseTimestampIso(ts: number | string | undefined): string | null {
  if (ts === undefined || ts === null) return null;
  const numeric = typeof ts === "string" ? Number(ts) : ts;
  if (!Number.isFinite(numeric)) return null;
  const ms = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
  try {
    return new Date(ms).toISOString();
  } catch {
    return null;
  }
}

export async function fetchLiveIndexerSnapshot(
  options: IndexerQueryOptions
): Promise<LiveIndexerSnapshot> {
  const startedAt = Date.now();
  const preset =
    options.network === "custom"
      ? null
      : MIDNIGHT_INDEXER_PRESETS[options.network];
  const endpoint =
    options.endpointOverride?.trim() ||
    preset?.graphqlUri ||
    MIDNIGHT_INDEXER_PRESETS.preview.graphqlUri;
  const explorerBaseUrl = preset?.explorerBaseUrl ?? null;
  const normalizedAddress = normalizeHexAddress(options.contractAddress);
  const fetcher = options.fetchImpl ?? globalThis.fetch;

  const baseErrorResult = (
    error: string,
    migrationNotice: string | null = null
  ): LiveIndexerSnapshot => ({
    ok: false,
    network: options.network,
    endpoint,
    explorerBaseUrl,
    fetchedAtIso: new Date().toISOString(),
    latencyMs: Math.max(1, Date.now() - startedAt),
    blockHeight: null,
    blockHash: null,
    blockTimestampIso: null,
    protocolVersion: null,
    zswapMerkleTreeRoot: null,
    dustCommitmentMerkleTreeRoot: null,
    queriedContractAddress: normalizedAddress,
    contractFound: false,
    contractActionType: null,
    contractEntryPoint: null,
    contractStateBytes: null,
    contractStatePreviewHex: null,
    contractBlockHeight: null,
    contractTxHash: null,
    migrationNotice,
    error
  });

  if (typeof fetcher !== "function") {
    return baseErrorResult("Global fetch API is unavailable in this environment.");
  }

  const payload = buildIndexerGraphQLQuery(normalizedAddress);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/graphql-response+json, application/json"
  };
  if (options.blockfrostProjectId?.trim()) {
    headers.project_id = options.blockfrostProjectId.trim();
  }

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutMs = options.timeoutMs ?? 9000;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetcher(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller?.signal
    });

    const rawText = await response.text();
    let parsed: GraphQLResponse | null = null;
    try {
      parsed = JSON.parse(rawText) as GraphQLResponse;
    } catch {
      parsed = null;
    }

    const decommissioned = parsed?.errors?.find(
      (e) => e.extensions?.code === "ENDPOINT_DECOMMISSIONED"
    );
    if (decommissioned) {
      return baseErrorResult(
        decommissioned.message ?? "Indexer endpoint has been decommissioned.",
        `Endpoint migrated to Blockfrost (${decommissioned.extensions?.migrationGuide ?? "https://docs.midnight.network"}). Switch to Midnight Preview for zero-auth public verification.`
      );
    }

    if (!response.ok) {
      const errMsg =
        parsed?.errors?.[0]?.message ||
        (response.status === 401 || response.status === 403
          ? `HTTP ${response.status}: Authentication token (Blockfrost project_id) required for ${endpoint}. Switch to Midnight Preview for zero-auth public queries.`
          : `Indexer HTTP ${response.status}: ${rawText.slice(0, 160)}`);
      return baseErrorResult(errMsg);
    }

    if (!parsed?.data?.block) {
      const gqlErr = parsed?.errors?.[0]?.message ?? "GraphQL response did not include block telemetry.";
      return baseErrorResult(gqlErr);
    }

    const block = parsed.data.block;
    const action = parsed.data.contractAction ?? null;
    const stateHex = action?.state?.replace(/^0x/i, "") ?? null;

    return {
      ok: true,
      network: options.network,
      endpoint,
      explorerBaseUrl,
      fetchedAtIso: new Date().toISOString(),
      latencyMs: Math.max(1, Date.now() - startedAt),
      blockHeight: typeof block.height === "number" ? block.height : null,
      blockHash: block.hash ?? null,
      blockTimestampIso: parseTimestampIso(block.timestamp),
      protocolVersion: typeof block.protocolVersion === "number" ? block.protocolVersion : null,
      zswapMerkleTreeRoot: block.zswapMerkleTreeRoot ?? null,
      dustCommitmentMerkleTreeRoot: block.dustCommitmentMerkleTreeRoot ?? null,
      queriedContractAddress: normalizedAddress,
      contractFound: Boolean(action),
      contractActionType: action?.__typename ?? null,
      contractEntryPoint: action?.entryPoint ?? null,
      contractStateBytes: stateHex ? Math.floor(stateHex.length / 2) : null,
      contractStatePreviewHex: stateHex ? stateHex.slice(0, 96) : null,
      contractBlockHeight: action?.stateAt?.height ?? null,
      contractTxHash: action?.transaction?.hash ?? null,
      migrationNotice: null,
      error: null
    };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return baseErrorResult(
      isAbort
        ? `Indexer request timed out after ${timeoutMs}ms (${endpoint}).`
        : err instanceof Error
          ? err.message
          : "Network request to Midnight Indexer failed."
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
}
