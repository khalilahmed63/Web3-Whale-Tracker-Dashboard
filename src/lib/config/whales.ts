import type { TrackedWallet } from "@/types/wallet";

function isSupportedChain(value: string): value is TrackedWallet["chains"][number] {
  return value === "ethereum" || value === "base" || value === "polygon";
}

function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function parseTrackedWalletsFromEnv(): TrackedWallet[] {
  const raw = process.env.TRACKED_WALLETS_JSON;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<{
      label?: string;
      address?: string;
      chains?: string[];
    }>;

    return parsed
      .filter((wallet) => typeof wallet.label === "string" && typeof wallet.address === "string")
      .map((wallet) => ({
        label: wallet.label!.trim(),
        address: wallet.address!,
        chains: (wallet.chains ?? []).filter(isSupportedChain),
      }))
      .filter((wallet) => wallet.label.length > 0 && isAddress(wallet.address) && wallet.chains.length > 0);
  } catch {
    return [];
  }
}

export const TRACKED_WALLETS: TrackedWallet[] = parseTrackedWalletsFromEnv();
