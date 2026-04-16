import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/auth/privy — Privy webhook handler.
 * Called after Privy login to upsert the user record in Supabase.
 * Expects: { wallet_address: string, display_name?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const walletAddress = body.wallet_address;

    if (typeof walletAddress !== "string" || walletAddress.length < 10) {
      return NextResponse.json(
        { error: "wallet_address is required" },
        { status: 400 },
      );
    }

    const address = walletAddress.toLowerCase();
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 },
      );
    }

    // Upsert user record
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          wallet_address: address,
          display_name: (body.display_name as string) ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "wallet_address" },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to upsert user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

/**
 * GET /api/auth/privy — Check session status.
 */
export async function GET() {
  return NextResponse.json({ authenticated: false, message: "Use Privy SDK for auth state" });
}
