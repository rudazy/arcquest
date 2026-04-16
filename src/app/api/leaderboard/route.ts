import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { NftTier } from "@/types/leaderboard";

/**
 * Cache this route for 5 minutes (ISR).
 */
export const revalidate = 300;

/**
 * GET /api/leaderboard — Public leaderboard.
 * Returns top users sorted by XP descending.
 * wallet_address is NEVER included in the response.
 *
 * Query params: ?limit=20&offset=0
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

  const supabase = createServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const { data, error, count } = await supabase
    .from("users")
    .select("display_name, xp, level, nft_badges", { count: "exact" })
    .not("display_name", "is", null)
    .order("xp", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }

  const rows = (data ?? []).map((row, i) => ({
    rank: offset + i + 1,
    display_name: row.display_name as string,
    xp: (row.xp as number) ?? 0,
    level: (row.level as number) ?? 1,
    nft_badges: ((row.nft_badges as NftTier[]) ?? []),
    tasks_completed: 0,
  }));

  return NextResponse.json({
    data: rows,
    total: count ?? 0,
    limit,
    offset,
  });
}
