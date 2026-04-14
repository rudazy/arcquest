import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getLevel, getLevelLabel, getXpToNextLevel } from "@/lib/xp-utils";

/**
 * GET /api/xp/status?wallet=0x... — Get user XP status.
 * Returns XP total, level, progress to next level.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet || wallet.length < 10) {
    return NextResponse.json(
      { error: "wallet query parameter is required" },
      { status: 400 },
    );
  }

  const address = wallet.toLowerCase();
  const supabase = createServerClient();

  if (!supabase) {
    // Supabase not configured — return mock data
    const mockXp = 0;
    return NextResponse.json({
      wallet_address: address,
      xp: mockXp,
      level: getLevel(mockXp),
      level_label: getLevelLabel(getLevel(mockXp)),
      progress: getXpToNextLevel(mockXp),
    });
  }

  const { data, error } = await supabase
    .from("users")
    .select("xp")
    .eq("wallet_address", address)
    .single();

  if (error || !data) {
    // User not found — return zero state
    return NextResponse.json({
      wallet_address: address,
      xp: 0,
      level: 1,
      level_label: getLevelLabel(1),
      progress: getXpToNextLevel(0),
    });
  }

  const xp = (data.xp as number) ?? 0;

  return NextResponse.json({
    wallet_address: address,
    xp,
    level: getLevel(xp),
    level_label: getLevelLabel(getLevel(xp)),
    progress: getXpToNextLevel(xp),
  });
}
