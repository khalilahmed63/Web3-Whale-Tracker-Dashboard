import { NextResponse } from "next/server";
import { pollWhaleTransactions } from "@/lib/ingestion/poller";

async function runPoll(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");

  if (configuredSecret && providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pollWhaleTransactions(true);
  return NextResponse.json({
    ok: result.ok,
    reason: result.reason,
    triggeredAt: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  return runPoll(request);
}

export async function POST(request: Request) {
  return runPoll(request);
}
