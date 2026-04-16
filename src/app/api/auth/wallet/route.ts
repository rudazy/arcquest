import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";

const DISPLAY_NAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const walletSchema = z.object({
  wallet_address: z.string().min(10),
  display_name: z
    .string()
    .regex(DISPLAY_NAME_PATTERN, "3–20 chars: letters, numbers, underscores")
    .optional(),
});

/**
 * POST /api/auth/wallet — upsert user on wallet connect.
 *
 * Call this immediately after Privy reports `authenticated`.
 * - New user (no display_name yet) → needs_onboarding: true
 * - Returning user                 → needs_onboarding: false
 *
 * XP is never awarded here — it is awarded by /api/tasks/verify and
 * /api/quiz/submit only.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = walletSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { wallet_address, display_name } = parsed.data;
    const address = wallet_address.toLowerCase();
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 },
      );
    }

    // Build upsert payload — only set display_name if provided
    const upsertPayload: Record<string, unknown> = {
      wallet_address: address,
      updated_at: new Date().toISOString(),
    };
    if (display_name) {
      upsertPayload.display_name = display_name;
    }

    const { data, error } = await supabase
      .from("users")
      .upsert(upsertPayload, { onConflict: "wallet_address" })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to upsert user" },
        { status: 500 },
      );
    }

    const user = data as {
      wallet_address: string;
      display_name: string | null;
      xp: number;
      level: number;
    };

    return NextResponse.json({
      success: true,
      // Redirect hint for the frontend: new users need onboarding
      needs_onboarding: !user.display_name,
      user: {
        wallet_address: user.wallet_address,
        display_name: user.display_name,
        xp: user.xp,
        level: user.level,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
