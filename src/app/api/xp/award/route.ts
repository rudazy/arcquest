import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";

const awardSchema = z.object({
  wallet_address: z.string().min(10),
  amount: z.number().int().positive().max(1000),
  reason: z.string().min(1).max(200),
});

/**
 * POST /api/xp/award — Award XP to a user.
 * Server-side only — never trust client XP claims.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = awardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { wallet_address, amount, reason } = parsed.data;
    const address = wallet_address.toLowerCase();
    const supabase = createServerClient();

    if (!supabase) {
      // Supabase not configured — return mock success
      return NextResponse.json({
        success: true,
        wallet_address: address,
        xp_awarded: amount,
        reason,
      });
    }

    // Record XP event
    const { error: logError } = await supabase.from("xp_events").insert({
      wallet_address: address,
      amount,
      reason,
      created_at: new Date().toISOString(),
    });

    if (logError) {
      return NextResponse.json(
        { error: "Failed to record XP event" },
        { status: 500 },
      );
    }

    // Increment user total
    const { error: rpcError } = await supabase.rpc("increment_xp", {
      p_wallet: address,
      p_amount: amount,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: "Failed to increment XP" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      wallet_address: address,
      xp_awarded: amount,
      reason,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
