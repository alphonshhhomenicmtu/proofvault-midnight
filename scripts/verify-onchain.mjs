#!/usr/bin/env node
/**
 * ProofVault — Walletless Live Midnight Indexer GraphQL Verification CLI
 *
 * Usage:
 *   npm run verify:onchain
 *   node scripts/verify-onchain.mjs --network preview --contract <hex-address>
 *
 * Queries the live Midnight Indexer GraphQL v4 endpoint directly with zero wallet
 * and zero Docker requirements.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const ENDPOINTS = {
  preview: "https://indexer.preview.midnight.network/api/v4/graphql",
  preprod: "https://indexer.midnight-preprod.blockfrost.io/api/v4/graphql"
};

function parseArgs(argv) {
  let network = "preview";
  let contract = null;
  let endpoint = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--network" && argv[i + 1]) {
      network = argv[++i].toLowerCase();
    } else if (argv[i] === "--contract" && argv[i + 1]) {
      contract = argv[++i].replace(/^0x/i, "").toLowerCase();
    } else if (argv[i] === "--endpoint" && argv[i + 1]) {
      endpoint = argv[++i];
    }
  }
  return { network, contract, endpoint };
}

async function main() {
  const { network, contract: cliContract, endpoint: cliEndpoint } = parseArgs(process.argv);
  const endpoint = cliEndpoint || ENDPOINTS[network] || ENDPOINTS.preview;

  let manifestContract = null;
  try {
    const manifestRaw = await fs.readFile(path.join(ROOT_DIR, "deploy", `${network}.json`), "utf8");
    const manifest = JSON.parse(manifestRaw);
    manifestContract = manifest?.deployment?.contractAddress ?? null;
  } catch {
    // manifest optional
  }

  const targetContract = cliContract || manifestContract;
  const headers = { "Content-Type": "application/json" };
  if (process.env.BLOCKFROST_PROJECT_ID) {
    headers.project_id = process.env.BLOCKFROST_PROJECT_ID;
  }

  const startedAt = Date.now();
  const query = targetContract
    ? `query VerifyOnChain($address: HexEncoded!) {
        block { height hash timestamp protocolVersion zswapMerkleTreeRoot dustCommitmentMerkleTreeRoot }
        contractAction(address: $address) {
          __typename address state
          stateAt { height hash protocolVersion }
          transaction { hash }
          ... on ContractCall { entryPoint }
        }
      }`
    : `{ block { height hash timestamp protocolVersion zswapMerkleTreeRoot dustCommitmentMerkleTreeRoot } }`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(targetContract ? { query, variables: { address: targetContract } } : { query })
  });
  const latencyMs = Date.now() - startedAt;
  const json = await res.json();

  if (!res.ok || !json?.data?.block) {
    console.error(`[FAIL] Indexer returned HTTP ${res.status}:`, JSON.stringify(json?.errors ?? json));
    process.exit(1);
  }

  const b = json.data.block;
  const tsIso = new Date(Number(b.timestamp) > 1e12 ? Number(b.timestamp) : Number(b.timestamp) * 1000).toISOString();

  console.log(`\n=== ProofVault Live Midnight Indexer Verification (${network.toUpperCase()}) ===`);
  console.log(`Endpoint          : ${endpoint}`);
  console.log(`Latency           : ${latencyMs} ms`);
  console.log(`Block Height      : #${b.height}`);
  console.log(`Protocol Version  : ${b.protocolVersion}`);
  console.log(`Block Timestamp   : ${tsIso}`);
  console.log(`Block Hash        : 0x${b.hash}`);
  console.log(`Zswap Merkle Root : 0x${b.zswapMerkleTreeRoot}`);
  console.log(`DUST Merkle Root  : 0x${b.dustCommitmentMerkleTreeRoot}`);

  if (targetContract) {
    const action = json.data.contractAction;
    if (action) {
      console.log(`\n[CONTRACT FOUND]  : 0x${action.address}`);
      console.log(`Action Type       : ${action.__typename}${action.entryPoint ? ` (${action.entryPoint})` : ""}`);
      console.log(`State At Block    : #${action.stateAt?.height}`);
      console.log(`Transaction Hash  : 0x${action.transaction?.hash}`);
      console.log(`Serialized State  : ${Math.floor((action.state?.length ?? 0) / 2)} bytes`);
    } else {
      console.log(`\n[CONTRACT QUERY]  : 0x${targetContract} not yet deployed on ${network}.`);
    }
  } else {
    console.log(`\n[MANIFEST STATUS] : deploy/${network}.json awaiting Turnstile-funded tNight/tDUST deployment.`);
    console.log(`                    Pass --contract <hex> to inspect any deployed Midnight contract live.`);
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
