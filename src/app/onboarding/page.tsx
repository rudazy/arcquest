"use client";

import React, { Component, useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ExternalLink, Wallet } from "lucide-react";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { XpToast } from "@/components/ui/xp-toast";
import { cn } from "@/lib/utils";

const DISPLAY_NAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const FOUNDER_HANDLES = [
  { handle: "handle1", url: "https://x.com/handle1" },
  { handle: "handle2", url: "https://x.com/handle2" },
];

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}\u2026${addr.slice(-4)}`;
}

// --- Privy error boundary (matches navbar pattern) ---

class PrivyBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Wallet provider is unavailable. Check your configuration.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Follow link helper ---

function FollowLink({
  handle,
  url,
  confirmed,
  linkOpened,
  onOpenLink,
  onConfirm,
}: {
  handle: string;
  url: string;
  confirmed: boolean;
  linkOpened: boolean;
  onOpenLink: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onOpenLink}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-[#7B5EA7]"
      >
        Follow @{handle} on X
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      {linkOpened && (
        <label className="mt-3 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={onConfirm}
            className="h-4 w-4 rounded border-border accent-[#7B5EA7]"
          />
          <span className="text-xs text-muted-foreground">
            I&apos;ve followed @{handle}
          </span>
        </label>
      )}
    </div>
  );
}

// --- Main onboarding flow ---

function OnboardingFlow() {
  const { ready, authenticated, login, user } = usePrivy();
  const [currentStep, setCurrentStep] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [nameError, setNameError] = useState("");
  const [linksOpened, setLinksOpened] = useState<Record<string, boolean>>({});
  const [followConfirmed, setFollowConfirmed] = useState<Record<string, boolean>>({});
  const [toastAmount, setToastAmount] = useState(0);
  const [toastTrigger, setToastTrigger] = useState(0);
  const [completed, setCompleted] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];

  const showXpToast = useCallback((amount: number) => {
    setToastAmount(amount);
    setToastTrigger((t) => t + 1);
  }, []);

  const advanceStep = useCallback(() => {
    const s = ONBOARDING_STEPS[currentStep];
    if (s && s.xp_reward > 0) {
      setEarnedXp((prev) => prev + s.xp_reward);
      showXpToast(s.xp_reward);
    }
    if (currentStep >= ONBOARDING_STEPS.length - 1) {
      setCompleted(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, showXpToast]);

  // Auto-advance wallet step when already connected
  useEffect(() => {
    if (currentStep === 0 && authenticated && ready) {
      const timer = setTimeout(advanceStep, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, authenticated, ready, advanceStep]);

  // --- Loading ---
  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // --- Wallet guard (Task 4) ---
  if (!authenticated && currentStep > 0 && !completed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center">
          <Wallet className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Wallet Required
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your wallet to continue onboarding.
          </p>
          <button
            onClick={login}
            className="mt-6 w-full rounded-md bg-[#7B5EA7] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // --- Completion screen ---
  if (completed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md rounded-lg border border-border bg-card p-10 text-center"
        >
          <h2 className="text-2xl font-bold text-foreground">
            You&apos;re in.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            You earned{" "}
            <span className="font-bold" style={{ color: "#f5c842" }}>
              {earnedXp} XP
            </span>
          </p>
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
      </div>
    );
  }

  if (!step) return null;

  // --- Step validation ---
  const canContinue = (() => {
    switch (step.id) {
      case "connect_wallet":
        return authenticated;
      case "set_display_name":
        return DISPLAY_NAME_PATTERN.test(displayName);
      case "follow_arc":
        return !!followConfirmed["arc_xyz"];
      case "follow_arcterminal":
        return !!followConfirmed["arcterminal"];
      case "follow_founders":
        return FOUNDER_HANDLES.every((f) => followConfirmed[f.handle]);
      default:
        return false;
    }
  })();

  const handleContinue = () => {
    if (step.id === "set_display_name") {
      localStorage.setItem("arc_display_name", displayName);
    }
    advanceStep();
  };

  const validateName = (value: string) => {
    setDisplayName(value);
    if (value.length === 0) {
      setNameError("");
    } else if (value.length < 3) {
      setNameError("Must be at least 3 characters");
    } else if (value.length > 20) {
      setNameError("Must be 20 characters or less");
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setNameError("Only letters, numbers, and underscores");
    } else {
      setNameError("");
    }
  };

  const markLinkOpened = (key: string) =>
    setLinksOpened((prev) => ({ ...prev, [key]: true }));

  const toggleFollow = (key: string) =>
    setFollowConfirmed((prev) => ({ ...prev, [key]: !prev[key] }));

  const progressPercent = (currentStep / ONBOARDING_STEPS.length) * 100;
  const walletAddress = user?.wallet?.address;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            {step.xp_reward > 0 && (
              <span className="font-medium" style={{ color: "#f5c842" }}>
                +{step.xp_reward} XP
              </span>
            )}
          </div>
          <div className="mt-2 h-1 rounded-full bg-muted">
            <div
              className="h-1 rounded-full bg-[#7B5EA7] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step header */}
        <h2 className="text-xl font-semibold text-foreground">{step.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {step.description}
        </p>

        {/* Step content */}
        <div className="mt-6 space-y-4">
          {/* Step 1: Connect wallet */}
          {step.id === "connect_wallet" &&
            (authenticated ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-900/50 bg-green-950/30 p-4">
                <Check className="h-5 w-5 shrink-0 text-green-500" />
                <span className="text-sm text-foreground">
                  Wallet connected
                  {walletAddress && (
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {truncateAddress(walletAddress)}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <button
                onClick={login}
                className="w-full rounded-md bg-[#7B5EA7] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
              >
                Connect Wallet
              </button>
            ))}

          {/* Step 2: Display name */}
          {step.id === "set_display_name" && (
            <>
              <input
                type="text"
                value={displayName}
                onChange={(e) => validateName(e.target.value)}
                placeholder="e.g. ludarep"
                maxLength={20}
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#7B5EA7] focus:outline-none focus:ring-1 focus:ring-[#7B5EA7]"
                aria-label="Display name"
              />
              {nameError && (
                <p className="text-xs text-red-400">{nameError}</p>
              )}
            </>
          )}

          {/* Step 3: Follow Arc */}
          {step.id === "follow_arc" && (
            <FollowLink
              handle="arc_xyz"
              url="https://x.com/arc_xyz"
              confirmed={!!followConfirmed["arc_xyz"]}
              linkOpened={!!linksOpened["arc_xyz"]}
              onOpenLink={() => markLinkOpened("arc_xyz")}
              onConfirm={() => toggleFollow("arc_xyz")}
            />
          )}

          {/* Step 4: Follow Arc Terminal */}
          {step.id === "follow_arcterminal" && (
            <FollowLink
              handle="arcterminal"
              url="https://x.com/arcterminal"
              confirmed={!!followConfirmed["arcterminal"]}
              linkOpened={!!linksOpened["arcterminal"]}
              onOpenLink={() => markLinkOpened("arcterminal")}
              onConfirm={() => toggleFollow("arcterminal")}
            />
          )}

          {/* Step 5: Follow founders */}
          {step.id === "follow_founders" && (
            <div className="space-y-3">
              {FOUNDER_HANDLES.map((founder) => (
                <FollowLink
                  key={founder.handle}
                  handle={founder.handle}
                  url={founder.url}
                  confirmed={!!followConfirmed[founder.handle]}
                  linkOpened={!!linksOpened[founder.handle]}
                  onOpenLink={() => markLinkOpened(founder.handle)}
                  onConfirm={() => toggleFollow(founder.handle)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Continue button — hidden on wallet step (auto-advances) */}
        {step.id !== "connect_wallet" && (
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={cn(
              "mt-8 w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              canContinue
                ? "bg-[#7B5EA7] text-white hover:bg-[#6a4e94]"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            Continue
          </button>
        )}
      </div>

      <XpToast amount={toastAmount} trigger={toastTrigger} />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <PrivyBoundary>
      <OnboardingFlow />
    </PrivyBoundary>
  );
}
