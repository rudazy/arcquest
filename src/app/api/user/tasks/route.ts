import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/user/tasks?wallet=0x...
 *
 * Returns the list of task IDs the wallet has completed.
 * Used by the frontend to hydrate completion state from the DB on mount.
 * Never returns wallet addresses in the response body.
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
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("task_completions")
    .select("task_id, completed_at")
    .eq("wallet_address", address)
    .order("completed_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch task completions" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: (data ?? []).map((row) => ({
      task_id: row.task_id as string,
      completed_at: row.completed_at as string,
    })),
  });
}
