import type { SupportedChain } from "@/types/transaction";

export const SUPPORTED_CHAINS: SupportedChain[] = ["ethereum", "base", "polygon"];

export const CHAIN_LABELS: Record<SupportedChain, string> = {
  ethereum: "Ethereum",
  base: "Base",
  polygon: "Polygon",
};
