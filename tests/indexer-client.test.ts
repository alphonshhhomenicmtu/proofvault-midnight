import { describe, expect, it, vi } from "vitest";
import {
  MIDNIGHT_INDEXER_PRESETS,
  buildIndexerGraphQLQuery,
  fetchLiveIndexerSnapshot,
  normalizeHexAddress
} from "../src/midnight/indexerClient";

describe("Midnight Indexer GraphQL v4 Client (Walletless State Reader)", () => {
  it("normalizes hex contract addresses and rejects malformed inputs", () => {
    expect(normalizeHexAddress("0x0200AABBCCDD")).toBe("0200aabbccdd");
    expect(normalizeHexAddress("  74fe0bf91234  ")).toBe("74fe0bf91234");
    expect(normalizeHexAddress("")).toBeNull();
    expect(normalizeHexAddress("not-hex!")).toBeNull();
    expect(normalizeHexAddress("1234")).toBeNull();
  });

  it("builds chain-head-only and contract-scoped GraphQL queries matching Midnight v4 schema", () => {
    const headOnly = buildIndexerGraphQLQuery(null);
    expect(headOnly.query).toContain("zswapMerkleTreeRoot");
    expect(headOnly.query).not.toContain("contractAction");
    expect(headOnly.variables).toBeUndefined();

    const withContract = buildIndexerGraphQLQuery("0200abcdef123456");
    expect(withContract.query).toContain("contractAction(address: $address)");
    expect(withContract.query).toContain("... on ContractCall");
    expect(withContract.variables).toEqual({ address: "0200abcdef123456" });
  });

  it("parses live Preview chain head and deployed ContractCall state cleanly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          data: {
            block: {
              height: 249500,
              hash: "aa".repeat(32),
              timestamp: 1795513000000,
              protocolVersion: 2001100,
              zswapMerkleTreeRoot: "bb".repeat(32),
              dustCommitmentMerkleTreeRoot: "cc".repeat(32)
            },
            contractAction: {
              __typename: "ContractCall",
              address: "0200" + "11".repeat(30),
              entryPoint: "settleConfidentialInvoice",
              state: "deadbeef".repeat(16),
              stateAt: {
                height: 249495,
                hash: "dd".repeat(32),
                protocolVersion: 2001100
              },
              transaction: {
                hash: "ee".repeat(32)
              }
            }
          }
        })
    }) as unknown as typeof fetch;

    const snap = await fetchLiveIndexerSnapshot({
      network: "preview",
      contractAddress: "0x0200" + "11".repeat(30),
      fetchImpl: mockFetch
    });

    expect(snap.ok).toBe(true);
    expect(snap.endpoint).toBe(MIDNIGHT_INDEXER_PRESETS.preview.graphqlUri);
    expect(snap.blockHeight).toBe(249500);
    expect(snap.protocolVersion).toBe(2001100);
    expect(snap.contractFound).toBe(true);
    expect(snap.contractActionType).toBe("ContractCall");
    expect(snap.contractEntryPoint).toBe("settleConfidentialInvoice");
    expect(snap.contractStateBytes).toBe(64);
    expect(snap.contractBlockHeight).toBe(249495);
    expect(snap.contractTxHash).toBe("ee".repeat(32));
    expect(snap.error).toBeNull();
  });

  it("handles live chain head with undeployed local simulator address gracefully", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          data: {
            block: {
              height: 249501,
              hash: "12".repeat(32),
              timestamp: 1795513010,
              protocolVersion: 2001100,
              zswapMerkleTreeRoot: "34".repeat(32),
              dustCommitmentMerkleTreeRoot: "56".repeat(32)
            },
            contractAction: null
          }
        })
    }) as unknown as typeof fetch;

    const snap = await fetchLiveIndexerSnapshot({
      network: "preview",
      contractAddress: "0200" + "aa".repeat(30),
      fetchImpl: mockFetch
    });

    expect(snap.ok).toBe(true);
    expect(snap.blockHeight).toBe(249501);
    expect(snap.contractFound).toBe(false);
    expect(snap.contractStateBytes).toBeNull();
    expect(snap.blockTimestampIso).toContain("2026-");
  });

  it("surfaces Blockfrost migration notice when a decommissioned Preprod endpoint responds HTTP 410", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 410,
      text: async () =>
        JSON.stringify({
          errors: [
            {
              message: "indexer.preprod.midnight.network was decommissioned on 2026-10-09.",
              extensions: {
                code: "ENDPOINT_DECOMMISSIONED",
                migrationGuide: "https://docs.midnight.network/guides/networks-and-environments"
              }
            }
          ]
        })
    }) as unknown as typeof fetch;

    const snap = await fetchLiveIndexerSnapshot({
      network: "custom",
      endpointOverride: "https://indexer.preprod.midnight.network/api/v3/graphql",
      fetchImpl: mockFetch
    });

    expect(snap.ok).toBe(false);
    expect(snap.migrationNotice).toContain("Blockfrost");
    expect(snap.error).toContain("decommissioned");
  });

  it("forwards Blockfrost project_id header and explains HTTP 403 authentication errors", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ error: "Forbidden" })
    });

    const snap = await fetchLiveIndexerSnapshot({
      network: "preprod",
      blockfrostProjectId: "midnight_preprod_demo_token",
      fetchImpl: mockFetch as unknown as typeof fetch
    });

    expect(snap.ok).toBe(false);
    expect(snap.error).toContain("project_id");
    const callHeaders = (mockFetch.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(callHeaders.project_id).toBe("midnight_preprod_demo_token");
  });
});
