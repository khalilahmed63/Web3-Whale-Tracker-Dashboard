import { NextResponse } from "next/server";
import { pollWhaleTransactions } from "@/lib/ingestion/poller";
import { ingestionState } from "@/lib/ingestion/store";
import type { SupportedChain } from "@/types/transaction";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get("chain") as SupportedChain | "all" | null;

  await pollWhaleTransactions();

  const data =
    chain && chain !== "all"
      ? ingestionState.alerts.filter((alert) => alert.chain === chain)
      : ingestionState.alerts;

  return NextResponse.json({
    data,
    meta: {
      lastPollAt: ingestionState.lastPollAt,
    },
  });
}
