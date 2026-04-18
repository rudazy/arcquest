"use client";

import React, { Component, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http } from "viem";
import {
  ArrowRight,
  Award,
  BookOpen,
  ListChecks,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { env } from "@/config/env";
import { arcQuestNftAbi } from "@/lib/abis/arcQuestNft";
import { xpRegistryAbi } from "@/lib/abis/xpRegistry";
import { MOCK_USER } from "@/lib/user-mock";
import { getLevelLabel, getXpToNextLevel } from "@/lib/xp-utils";
import { getLevelColor } from "@/lib/level-colors";
import { cn } from "@/lib/utils";
import type { NftTier } from "@/types/leaderboard";

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

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

const LEVEL_BG: Record<number, string> = {
  1: "bg-zinc-400/15 text-zinc-400",
  2: "bg-blue-400/15 text-blue-400",
  3: "bg-green-400/15 text-green-400",
  4: "bg-purple-400/15 text-purple-400",
  5: "bg-yellow-400/15 text-yellow-400",
};

function LevelBadge({ level }: { level: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none",
        LEVEL_BG[level] ?? "bg-zinc-400/15 text-zinc-400",
      )}
    >
      Lv{level}
    </span>
  );
}

const PROJECT_INITIALS: Record<string, string> = {
  aave: "AA",
  maple: "MF",
  curve: "CF",
};

const PROJECT_COLORS: Record<string, string> = {
  aave: "#B6509E",
  maple: "#1A8C6D",
  curve: "#E64980",
};

const NFT_CONFIG: {
  tier: NftTier;
  label: string;
  xp: number;
  icon: string;
  soulbound: boolean;
  tokenId: bigint;
}[] = [
  { tier: "bronze", label: "Bronze Badge", xp: 100, icon: "🥉", soulbound: true, tokenId: 1n },
  { tier: "silver", label: "Silver Badge", xp: 500, icon: "🥈", soulbound: true, tokenId: 2n },
  { tier: "gold", label: "Gold Badge", xp: 1000, icon: "🥇", soulbound: false, tokenId: 3n },
];

type ChainBadgeState = {
  claimed: boolean;
};

function NftMilestoneCard({
  label,
  xp: threshold,
  icon,
  soulbound,
  earned,
  userXp,
}: {
  label: string;
  xp: number;
  icon: string;
  soulbound: boolean;
  earned: boolean;
  userXp: number;
}) {
  const progress = Math.min((userXp / threshold) * 100, 100);
  const eligible = userXp >= threshold;

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border p-5 text-center transition-colors",
        earned
          ? "border-border bg-card shadow-md"
          : "border-border/50 bg-card/40",
      )}
    >
      <span className={cn("text-3xl", !earned && "grayscale")}>{icon}</span>
      <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
      <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
        {soulbound ? "Soulbound" : "Tradeable"}
      </span>

      {earned ? (
        <p className="mt-2 text-[10px] font-medium text-emerald-400">
          Claimed onchain
        </p>
      ) : (
        <>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {threshold} XP required
          </p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#7B5EA7]/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span
            className={cn(
              "mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium",
              eligible
                ? "bg-[#7B5EA7]/15 text-[#b49ad7]"
                : "bg-muted text-muted-foreground",
            )}
          >
            {eligible ? "Claimable" : "Locked"}
          </span>
        </>
      )}
    </div>
  );
}

function DashboardContent() {
  const { ready, authenticated, login, user: privyUser } = usePrivy();
  const walletAddress = privyUser?.wallet?.address as `0x${string}` | undefined;

  const [liveXp, setLiveXp] = useState<number | null>(null);
  const [badgeState, setBadgeState] = useState<Record<string, ChainBadgeState>>(
    {},
  );

  const publicClient = useMemo(() => {
    if (!env.NEXT_PUBLIC_ARC_RPC_URL) return null;
    return createPublicClient({
      transport: http(env.NEXT_PUBLIC_ARC_RPC_URL),
    });
  }, []);

  useEffect(() => {
    if (!publicClient || !walletAddress) return;
    if (!env.NEXT_PUBLIC_XP_REGISTRY_ADDRESS) return;
    if (!env.NEXT_PUBLIC_ARCQUEST_NFT_ADDRESS) return;

    let cancelled = false;

    async function loadOnchainData() {
      try {
        const xp = await publicClient.readContract({
          address: env.NEXT_PUBLIC_XP_REGISTRY_ADDRESS as `0x${string}`,
          abi: xpRegistryAbi,
          functionName: "totalXP",
          args: [walletAddress],
        });

        const nextBadgeState: Record<string, ChainBadgeState> = {};

        for (const nft of NFT_CONFIG) {
          const claimed = await publicClient.readContract({
            address: env.NEXT_PUBLIC_ARCQUEST_NFT_ADDRESS as `0x${string}`,
            abi: arcQuestNftAbi,
            functionName: "claimed",
            args: [walletAddress, nft.tokenId],
          });

          nextBadgeState[nft.tier] = { claimed };
        }

        if (!cancelled) {
          setLiveXp(Number(xp));
          setBadgeState(nextBadgeState);
        }
      } catch (error) {
        console.error("Failed to load onchain dashboard data", error);
      }
    }

    void loadOnchainData();

    return () => {
      cancelled = true;
    };
  }, [publicClient, walletAddress]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center">
          <Wallet className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Dashboard
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your wallet to view your dashboard.
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

  const user = MOCK_USER;
  const displayedXp = liveXp ?? user.xp;
  const levelLabel = getLevelLabel(user.level);
  const xpInfo = getXpToNextLevel(displayedXp);
  const xpRemaining = xpInfo.required - xpInfo.current;
  const progressPercent = (xpInfo.current / xpInfo.required) * 100;
  const recentTasks = user.tasks_completed.slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-4"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7B5EA7] to-[#00d4ff] text-lg font-bold text-white">
          {getInitials(user.display_name)}
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {user.display_name}
            </h1>
            <LevelBadge level={user.level} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {levelLabel}
            <span className="mx-2 text-border">|</span>
            <Link
              href="/leaderboard"
              className="transition-colors hover:text-foreground"
            >
              Rank #{user.rank} on leaderboard
            </Link>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mt-8 rounded-lg border border-border bg-card p-6"
      >
        <div className="flex items-baseline justify-between">
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color: "#f5c842" }}
          >
            {displayedXp.toLocaleString()} XP
          </span>
          <span className="text-xs text-muted-foreground">
            Level {user.level} — {levelLabel}
          </span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-[#7B5EA7]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className={cn("font-medium", getLevelColor(user.level + 1))}>
            {xpRemaining} XP
          </span>{" "}
          to Level {user.level + 1}
        </p>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Tasks Completed",
            value: user.tasks_completed.length.toString(),
            icon: ListChecks,
          },
          {
            label: "XP Earned",
            value: displayedXp.toLocaleString(),
            icon: Zap,
            gold: true,
          },
          {
            label: "Current Level",
            value: user.level.toString(),
            icon: Award,
          },
          {
            label: "Leaderboard Rank",
            value: `#${user.rank}`,
            icon: Trophy,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <stat.icon
              className={cn(
                "h-4 w-4",
                stat.gold ? "text-yellow-400" : "text-muted-foreground",
              )}
            />
            <p
              className={cn(
                "mt-2 text-xl font-bold tabular-nums",
                stat.gold ? "" : "text-foreground",
              )}
              style={stat.gold ? { color: "#f5c842" } : undefined}
            >
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Award className="h-4 w-4" />
          NFT Milestones
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {NFT_CONFIG.map((nft) => {
            const earned = badgeState[nft.tier]?.claimed ?? false;

            return (
              <NftMilestoneCard
                key={nft.tier}
                label={nft.label}
                xp={nft.xp}
                icon={nft.icon}
                soulbound={nft.soulbound}
                earned={earned}
                userXp={displayedXp}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <ListChecks className="h-4 w-4" />
          Recent Tasks
        </h2>
        <div className="mt-3 space-y-2">
          {recentTasks.map((task) => {
            const initials =
              PROJECT_INITIALS[task.project_slug] ??
              task.project_name.slice(0, 2).toUpperCase();
            const color = PROJECT_COLORS[task.project_slug] ?? "#7B5EA7";

            return (
              <div
                key={task.task_id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {task.task_id
                      .replace(`${task.project_slug}_`, "")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {task.project_name}
                  </p>
                </div>
                <span
                  className="shrink-0 text-xs font-bold tabular-nums"
                  style={{ color: "#f5c842" }}
                >
                  +{task.xp_earned} XP
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {task.completed_at}
                </span>
              </div>
            );
          })}
        </div>
        <Link
          href="/tasks"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#7B5EA7] transition-colors hover:text-[#9b7ec8]"
        >
          View all tasks
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/tasks"
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#7B5EA7] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
        >
          <ListChecks className="h-4 w-4" />
          Find Tasks
        </Link>
        <Link
          href="/quiz"
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <BookOpen className="h-4 w-4" />
          Take Quiz
        </Link>
        <Link
          href="/leaderboard"
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Trophy className="h-4 w-4" />
          View Leaderboard
        </Link>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <PrivyBoundary>
      <DashboardContent />
    </PrivyBoundary>
  );
}
