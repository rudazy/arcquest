import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import { QUIZ_QUESTIONS, QUIZ_XP_REWARD } from "@/lib/quiz";

const submitSchema = z.object({
  wallet_address: z.string().min(10),
  answers: z.array(z.number().int().min(0).max(3)).length(QUIZ_QUESTIONS.length),
});

/**
 * POST /api/quiz/submit — Submit quiz answers.
 * 1. Validate all 10 answers match correct_index
 * 2. If any wrong → { success: false, passed: false }
 * 3. Check if XP already awarded → { success: false, xp_already_awarded: true }
 * 4. Insert/update quiz_completions
 * 5. Award 20 XP with reason "quiz_complete"
 * 6. Return { success: true, xp_awarded: 20 }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { wallet_address, answers } = parsed.data;

    // Validate answers
    const allCorrect = answers.every(
      (answer, index) => {
        const question = QUIZ_QUESTIONS[index];
        return question !== undefined && answer === question.correct_index;
      },
    );

    if (!allCorrect) {
      return NextResponse.json({
        success: false,
        passed: false,
        message: "One or more answers are incorrect",
      });
    }

    const address = wallet_address.toLowerCase();
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 },
      );
    }

    // Check if XP already awarded
    const { data: existing } = await supabase
      .from("quiz_completions")
      .select("id")
      .eq("wallet_address", address)
      .single();

    if (existing) {
      return NextResponse.json({
        success: false,
        passed: true,
        xp_already_awarded: true,
        message: "Quiz XP already awarded",
      });
    }

    // Insert quiz completion
    const now = new Date().toISOString();
    const { error: insertError } = await supabase
      .from("quiz_completions")
      .upsert(
        {
          wallet_address: address,
          completed_at: now,
          xp_awarded: QUIZ_XP_REWARD,
        },
        { onConflict: "wallet_address" },
      );

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to record quiz completion" },
        { status: 500 },
      );
    }

    // Award XP
    const { error: xpError } = await supabase.rpc("increment_xp", {
      p_wallet: address,
      p_amount: QUIZ_XP_REWARD,
    });

    if (xpError) {
      return NextResponse.json(
        { error: "Failed to award XP" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      xp_awarded: QUIZ_XP_REWARD,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
