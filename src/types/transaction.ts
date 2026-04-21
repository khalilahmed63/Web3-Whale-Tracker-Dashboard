export type SupportedChain = "ethereum" | "base" | "polygon";

export type FlowDirection = "inflow" | "outflow";

export interface WhaleTransaction {
  id: string;
  chain: SupportedChain;
  hash: string;
  blockNumber: number;
  logIndex?: number;
  walletAddress: string;
  counterparty: string;
  tokenSymbol: string;
  amount: number;
  usdValue: number;
  direction: FlowDirection;
  isLarge: boolean;
  timestamp: string;
}
