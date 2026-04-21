const TOKEN_ID_BY_SYMBOL: Record<string, string> = {
  ETH: "ethereum",
  WETH: "weth",
  BTC: "bitcoin",
  WBTC: "wrapped-bitcoin",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
};

const STABLECOINS = new Set(["USDC", "USDT", "DAI"]);
const CACHE_TTL_MS = 60_000;

type PriceCacheEntry = {
  value: number;
  expiresAt: number;
};

const globalCache = globalThis as typeof globalThis & {
  __priceCache?: Map<string, PriceCacheEntry>;
};

const priceCache = globalCache.__priceCache ?? new Map<string, PriceCacheEntry>();
if (!globalCache.__priceCache) {
  globalCache.__priceCache = priceCache;
}

export function hasPriceMappingForSymbol(symbol: string): boolean {
  const normalized = symbol.toUpperCase();
  return STABLECOINS.has(normalized) || normalized in TOKEN_ID_BY_SYMBOL;
}

export async function getUsdPriceBySymbol(symbol: string): Promise<number> {
  const normalized = symbol.toUpperCase();

  if (STABLECOINS.has(normalized)) return 1;

  const cached = priceCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const tokenId = TOKEN_ID_BY_SYMBOL[normalized];
  if (!tokenId) return 0;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`,
      { cache: "no-store" },
    );
    if (!response.ok) return 0;

    const data = (await response.json()) as Record<string, { usd?: number }>;
    const value = data[tokenId]?.usd ?? 0;
    if (value > 0) {
      priceCache.set(normalized, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return value;
  } catch {
    return 0;
  }
}
