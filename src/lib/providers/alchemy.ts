import type { SupportedChain } from "@/types/transaction";

interface AlchemyTransfer {
  hash?: string;
  from?: string;
  to?: string;
  value?: number;
  asset?: string;
  uniqueId?: string;
  category?: string;
  blockNum?: string;
  logIndex?: string;
  metadata?: {
    blockTimestamp?: string;
  };
}

interface AlchemyResponse {
  result?: {
    transfers?: AlchemyTransfer[];
  };
}

const RETRY_DELAYS_MS = [300, 700, 1_500];

function shouldRetry(status: number): boolean {
  return status === 429 || status >= 500;
}

async function postWithRetry(endpoint: string, payload: unknown): Promise<Response> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!shouldRetry(response.status) || attempt === RETRY_DELAYS_MS.length) {
      return response;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }

  throw new Error("Unexpected Alchemy retry flow");
}

const NETWORK_BY_CHAIN: Record<SupportedChain, string> = {
  ethereum: "eth-mainnet",
  base: "base-mainnet",
  polygon: "polygon-mainnet",
};

export async function fetchWalletTransfers(
  chain: SupportedChain,
  apiKey: string,
  fromBlockHex = "0x0",
  walletAddress?: string,
): Promise<AlchemyTransfer[]> {
  const network = NETWORK_BY_CHAIN[chain];
  const endpoint = `https://${network}.g.alchemy.com/v2/${apiKey}`;

  const payload = {
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromBlock: fromBlockHex,
        toBlock: "latest",
        category: ["external", "erc20"],
        withMetadata: true,
        excludeZeroValue: true,
        maxCount: "0x32",
        order: "desc",
      },
    ],
  };

  if (!walletAddress) {
    const response = await postWithRetry(endpoint, payload);
    if (!response.ok) {
      throw new Error(`Alchemy global request failed on ${chain}`);
    }
    const json = (await response.json()) as AlchemyResponse;
    return json.result?.transfers ?? [];
  }

  const outboundPayload = {
    ...payload,
    params: [
      {
        ...(payload.params[0] as Record<string, unknown>),
        fromAddress: walletAddress,
      },
    ],
  };
  const inboundPayload = {
    ...payload,
    params: [
      {
        ...(payload.params[0] as Record<string, unknown>),
        toAddress: walletAddress,
      },
    ],
  };

  const [outboundRes, inboundRes] = await Promise.all([
    postWithRetry(endpoint, outboundPayload),
    postWithRetry(endpoint, inboundPayload),
  ]);

  if (!outboundRes.ok || !inboundRes.ok) {
    throw new Error(`Alchemy request failed on ${chain}`);
  }

  const outboundJson = (await outboundRes.json()) as AlchemyResponse;
  const inboundJson = (await inboundRes.json()) as AlchemyResponse;

  return [...(outboundJson.result?.transfers ?? []), ...(inboundJson.result?.transfers ?? [])];
}
