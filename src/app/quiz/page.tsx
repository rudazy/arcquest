"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, Check, RotateCcw, X, Zap } from "lucide-react";
import { QUIZ_QUESTIONS, QUIZ_XP_REWARD } from "@/lib/quiz";
import { WalletBoundary } from "@/components/wallet-detector";
import { XpToast } from "@/components/ui/xp-toast";
import { cn } from "@/lib/utils";

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;
const STORAGE_KEY = "arc_quiz_complete";
const CORRECT_DELAY_MS = 1200;
const WRONG_EXPLANATION_MS = 1500;
const RESTART_COUNTDOWN_S = 3;

type AnswerState = "idle" | "correct" | "wrong";

export default function QuizPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [isComplete, setIsComplete] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [alreadyEarned, setAlreadyEarned] = useState(false);
  const [showRestartOverlay, setShowRestartOverlay] = useState(false);
  const [restartCountdown, setRestartCountdown] = useState(RESTART_COUNTDOWN_S);
  const [toastAmount, setToastAmount] = useState(0);
  const [toastTrigger, setToastTrigger] = useState(0);
  // Tracks the index chosen for each question so we can submit all at once
  const [collectedAnswers, setCollectedAnswers] = useState<number[]>([]);
  // Wallet address supplied by WalletBoundary — null when Privy unavailable
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check localStorage on mount (fast optimistic check)
  useEffect(() => {
    try {
      setAlreadyEarned(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // localStorage unavailable — treat as not earned
    }
  }, []);

  const showXpToast = useCallback((amount: number) => {
    setToastAmount(amount);
    setToastTrigger((t) => t + 1);
  }, []);

  const resetQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setAnswerState("idle");
    setShowRestartOverlay(false);
    setRestartCountdown(RESTART_COUNTDOWN_S);
    setAttemptCount((prev) => prev + 1);
    setCollectedAnswers([]);
  }, []);

  // Restart countdown timer
  useEffect(() => {
    if (!showRestartOverlay) return;

    if (restartCountdown <= 0) {
      resetQuiz();
      return;
    }

    const timer = setTimeout(() => {
      setRestartCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showRestartOverlay, restartCountdown, resetQuiz]);

  const handleSelectOption = (index: number) => {
    if (answerState !== "idle" || selectedOption !== null) return;

    const question = QUIZ_QUESTIONS[currentQuestion];
    if (!question) return;

    setSelectedOption(index);
    const isCorrect = index === question.correct_index;

    if (isCorrect) {
      setAnswerState("correct");
      // Collect this answer for the server submit
      const nextAnswers = [...collectedAnswers, index];
      setCollectedAnswers(nextAnswers);

      setTimeout(() => {
        if (currentQuestion >= TOTAL_QUESTIONS - 1) {
          // All 10 correct — mark complete
          setIsComplete(true);

          // Optimistic localStorage update
          try {
            localStorage.setItem(STORAGE_KEY, "true");
          } catch {
            // localStorage unavailable
          }

          if (walletAddress) {
            // Submit to server — server is the source of truth for XP
            // TODO: after server confirms, call XPRegistry.sol.awardXP() onchain (Step 21+)
            fetch("/api/quiz/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                wallet_address: walletAddress,
                answers: nextAnswers,
              }),
            })
              .then((r) => r.json())
              .then(
                (data: {
                  success: boolean;
                  xp_awarded?: number;
                  xp_already_awarded?: boolean;
                }) => {
                  if (data.success && data.xp_awarded) {
                    setAlreadyEarned(false); // XP just awarded fresh
                    showXpToast(data.xp_awarded);
                  } else if (data.xp_already_awarded) {
                    setAlreadyEarned(true);
                  }
                },
              )
              .catch(() => {
                // Server unavailable — fall back to local XP toast if first time
                if (!alreadyEarned) {
                  showXpToast(QUIZ_XP_REWARD);
                }
              });
          } else {
            // No wallet connected — use localStorage-only flow
            if (!alreadyEarned) {
              showXpToast(QUIZ_XP_REWARD);
            }
          }
          setAlreadyEarned(true);
        } else {
          setCurrentQuestion((prev) => prev + 1);
          setSelectedOption(null);
          setAnswerState("idle");
        }
      }, CORRECT_DELAY_MS);
    } else {
      setAnswerState("wrong");
      setTimeout(() => {
        setShowRestartOverlay(true);
      }, WRONG_EXPLANATION_MS);
    }
  };

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progressPercent = ((currentQuestion + (answerState === "correct" ? 1 : 0)) / TOTAL_QUESTIONS) * 100;

  // ─── Pre-quiz screen ────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
        {/* WalletBoundary is rendered once here; React keeps it mounted across screen transitions */}
        <WalletBoundary onWalletAddress={setWalletAddress} />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl rounded-lg border border-border bg-card p-10"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Arc Knowledge Quiz
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                10 questions. Answer all correctly to earn{" "}
                <span className="font-semibold" style={{ color: "#f5c842" }}>
                  {QUIZ_XP_REWARD} XP
                </span>
                . Miss one — you restart from Q1.
              </p>
            </div>
            <span
              className="shrink-0 rounded-md px-3 py-1.5 text-sm font-bold"
              style={{ color: "#f5c842", backgroundColor: "rgba(245, 200, 66, 0.1)" }}
            >
              +{QUIZ_XP_REWARD} XP
            </span>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-200/80">
              You can retake as many times as needed. XP is awarded once.
            </p>
          </div>

          <button
            onClick={() => setHasStarted(true)}
            className="mt-8 w-full rounded-md bg-[#7B5EA7] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
          >
            Start Quiz
          </button>
        </motion.div>
        <XpToast amount={toastAmount} trigger={toastTrigger} />
      </main>
    );
  }

  // ─── Completion screen ──────────────────────────────────────────────
  if (isComplete) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <WalletBoundary onWalletAddress={setWalletAddress} />
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl rounded-lg border border-border bg-card p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}
          >
            <Check className="h-8 w-8 text-green-500" />
          </motion.div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quiz Complete!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You answered all {TOTAL_QUESTIONS} questions correctly
          </p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-6"
          >
            <span
              className="inline-block rounded-md px-4 py-2 text-lg font-bold"
              style={{ color: "#f5c842", backgroundColor: "rgba(245, 200, 66, 0.1)" }}
            >
              +{QUIZ_XP_REWARD} XP
            </span>
          </motion.div>

          {alreadyEarned && (
            <p className="mt-3 text-xs text-muted-foreground">
              You&apos;ve already earned XP for this quiz
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="rounded-md bg-[#7B5EA7] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              View Leaderboard
            </Link>
          </div>
        </motion.div>
        <XpToast amount={toastAmount} trigger={toastTrigger} />
      </main>
    );
  }

  if (!question) return null;

  // ─── Quiz in progress ───────────────────────────────────────────────
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <WalletBoundary onWalletAddress={setWalletAddress} />
      {/* Restart overlay */}
      <AnimatePresence>
        {showRestartOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-center"
            >
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.15)" }}
              >
                <X className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Wrong answer. Restarting...
              </h2>
              <p className="mt-3 text-4xl font-bold tabular-nums text-muted-foreground">
                {restartCountdown}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Attempt {attemptCount + 2}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl">
        {/* Header: question counter + attempt */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {TOTAL_QUESTIONS}
          </span>
          <div className="flex items-center gap-3">
            {attemptCount > 0 && (
              <span className="text-xs text-muted-foreground">
                Attempt {attemptCount + 1}
              </span>
            )}
            <span
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "#f5c842" }}
            >
              <Zap className="h-3 w-3" />
              {QUIZ_XP_REWARD} XP
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-[#7B5EA7]"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${attemptCount}-${currentQuestion}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-lg border border-border bg-card p-8"
          >
            <h2 className="text-lg font-semibold leading-snug text-foreground">
              {question.question}
            </h2>

            <div className="mt-6 space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectOption = index === question.correct_index;

                let borderColor = "border-border";
                let bgColor = "bg-card";
                let icon = null;

                if (answerState === "correct" && isSelected) {
                  borderColor = "border-green-500";
                  bgColor = "bg-green-950/20";
                  icon = <Check className="h-4 w-4 shrink-0 text-green-500" />;
                } else if (answerState === "wrong" && isSelected) {
                  borderColor = "border-red-500";
                  bgColor = "bg-red-950/20";
                  icon = <X className="h-4 w-4 shrink-0 text-red-500" />;
                } else if (answerState === "wrong" && isCorrectOption) {
                  borderColor = "border-green-500/50";
                  bgColor = "bg-green-950/10";
                } else if (isSelected) {
                  borderColor = "border-[#7B5EA7]";
                  bgColor = "bg-[#7B5EA7]/5";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    disabled={answerState !== "idle"}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-5 py-4 text-left text-sm transition-all",
                      borderColor,
                      bgColor,
                      answerState === "idle" &&
                        "cursor-pointer hover:border-[#7B5EA7]/60 hover:bg-[#7B5EA7]/5",
                      answerState !== "idle" && "cursor-default",
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border text-xs font-medium text-muted-foreground">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-foreground">{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation text */}
            <AnimatePresence>
              {answerState !== "idle" && (
                <motion.p
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "overflow-hidden rounded-md px-4 py-3 text-xs leading-relaxed",
                    answerState === "correct"
                      ? "border border-green-900/40 bg-green-950/20 text-green-200/80"
                      : "border border-red-900/40 bg-red-950/20 text-red-200/80",
                  )}
                >
                  {question.explanation}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
      <XpToast amount={toastAmount} trigger={toastTrigger} />
    </main>
  );
}
