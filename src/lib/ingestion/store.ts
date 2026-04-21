import type { UiAlert } from "@/types/alert";
import type { SupportedChain, WhaleTransaction } from "@/types/transaction";

interface IngestionState {
  transactions: WhaleTransaction[];
  alerts: UiAlert[];
  lastPollAt: number;
  isPolling: boolean;
  cursorByChain: Record<SupportedChain, number>;
  seenTransactionIds: Record<string, number>;
  pricingCoverage: {
    totalTransfers: number;
    pricedTransfers: number;
    unmappedSymbols: string[];
  };
}

const defaultState: IngestionState = {
  transactions: [],
  alerts: [],
  lastPollAt: 0,
  isPolling: false,
  cursorByChain: {
    ethereum: 0,
    base: 0,
    polygon: 0,
  },
  seenTransactionIds: {},
  pricingCoverage: {
    totalTransfers: 0,
    pricedTransfers: 0,
    unmappedSymbols: [],
  },
};

const globalState = globalThis as typeof globalThis & {
  __whaleTrackerState?: IngestionState;
};

export const ingestionState = globalState.__whaleTrackerState ?? defaultState;

if (!globalState.__whaleTrackerState) {
  globalState.__whaleTrackerState = ingestionState;
}
