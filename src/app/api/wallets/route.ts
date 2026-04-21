import { NextResponse } from "next/server";
import { TRACKED_WALLETS } from "@/lib/config/whales";

export async function GET() {
  return NextResponse.json({
    data: TRACKED_WALLETS,
  });
}
