import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { MOCK_LEADERBOARD } from "@/lib/leaderboard-mock";

/**
 * GET /api/leaderboard — Public leaderboard.
 * Returns top users sorted by XP descending.
 * Query params: ?limit=20&offset=0
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

  const supabase = createServerClient();

  if (!supabase) {
    // Supabase not configured — return mock data
    const page = MOCK_LEADERBOARD.slice(offset, offset + limit);
    return NextResponse.json({
      data: page,
      total: MOCK_LEADERBOARD.length,
      limit,
      offset,
    });
  }

  const { data, error, count } = await supabase
    .from("users")
    .select("wallet_address, display_name, xp, level, nft_badges", {
      count: "exact",
    })
    .order("xp", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}
