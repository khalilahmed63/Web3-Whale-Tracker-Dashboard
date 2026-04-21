import type { SupportedChain } from "@/types/transaction";

export interface WhaleActivity {
  walletAddress: string;
  chain: SupportedChain;
  totalInflowUsd24h: number;
  totalOutflowUsd24h: number;
  netFlowUsd24h: number;
  largeTxCount24h: number;
  lastActiveAt: string | null;
}
