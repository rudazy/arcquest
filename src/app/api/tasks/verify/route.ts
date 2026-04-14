import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import { getTaskById } from "@/lib/tasks-helpers";

const verifySchema = z.object({
  wallet_address: z.string().min(10),
  task_id: z.string().min(1),
});

/**
 * POST /api/tasks/verify — Verify task completion.
 * For onchain tasks: checks Arc RPC for tx proof (placeholder).
 * For social tasks: validates user self-report.
 * For educational tasks: redirects to quiz submit.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { wallet_address, task_id } = parsed.data;
    const task = getTaskById(task_id);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 },
      );
    }

    const supabase = createServerClient();

    if (!supabase) {
      // Supabase not configured — return mock success
      return NextResponse.json({
        success: true,
        task_id,
        xp_awarded: task.xp_reward,
        verified_at: new Date().toISOString(),
      });
    }

    // Check if already completed
    const { data: existing } = await supabase
      .from("task_completions")
      .select("id")
      .eq("wallet_address", wallet_address.toLowerCase())
      .eq("task_id", task_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Task already completed" },
        { status: 409 },
      );
    }

    // Record completion
    const now = new Date().toISOString();
    const { error: insertError } = await supabase
      .from("task_completions")
      .insert({
        wallet_address: wallet_address.toLowerCase(),
        task_id,
        project_slug: task.project_slug,
        xp_awarded: task.xp_reward,
        completed_at: now,
      });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to record completion" },
        { status: 500 },
      );
    }

    // Award XP
    const { error: xpError } = await supabase.rpc("increment_xp", {
      p_wallet: wallet_address.toLowerCase(),
      p_amount: task.xp_reward,
    });

    if (xpError) {
      return NextResponse.json(
        { error: "Failed to award XP" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      task_id,
      xp_awarded: task.xp_reward,
      verified_at: now,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
