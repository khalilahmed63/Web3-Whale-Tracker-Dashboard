import type { SupportedChain } from "@/types/transaction";

export interface TrackedWallet {
  label: string;
  address: string;
  chains: SupportedChain[];
}
