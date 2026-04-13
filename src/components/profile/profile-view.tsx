"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Award, ListChecks, Trophy, Zap } from "lucide-react";
import { getLevelLabel } from "@/lib/xp-utils";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/user";
import type { NftTier } from "@/types/leaderboard";

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

const NFT_ICONS: Record<NftTier, string> = {
  bronze: "\u{1F949}",
  silver: "\u{1F948}",
  gold: "\u{1F947}",
};

const NFT_LABELS: Record<NftTier, string> = {
  bronze: "Bronze Badge",
  silver: "Silver Badge",
  gold: "Gold Badge",
};

const PROJECT_COLORS: Record<string, string> = {
  aave: "#B6509E",
  maple: "#1A8C6D",
  curve: "#E64980",
};

export function ProfileView({
  user,
  isOwnProfile,
}: {
  user: UserProfile;
  isOwnProfile: boolean;
}) {
  const levelLabel = getLevelLabel(user.level);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* "This is you" banner */}
      {isOwnProfile && (
        <div className="mb-6 rounded-md border border-[#7B5EA7]/30 bg-[#7B5EA7]/10 px-4 py-2.5 text-center text-xs font-medium text-[#7B5EA7]">
          This is you
        </div>
      )}

      {/* User header */}
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
              Rank #{user.rank}
            </Link>
            <span className="mx-2 text-border">|</span>
            Joined {user.joined_at}
          </p>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Tasks Completed",
            value: user.tasks_completed.length.toString(),
            icon: ListChecks,
          },
          {
            label: "XP Earned",
            value: user.xp.toLocaleString(),
            icon: Zap,
            gold: true,
          },
          {
            label: "Current Level",
            value: `Lv${user.level}`,
            icon: Award,
          },
          {
            label: "Leaderboard Rank",
            value: `#${user.rank}`,
            icon: Trophy,
          },
        ].map((stat) => (
          <div
            key={stat.label}
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
          </div>
        ))}
      </div>

      {/* NFT Gallery */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Award className="h-4 w-4" />
          NFT Collection
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["bronze", "silver", "gold"] as const).map((tier) => {
            const userNft = user.nfts.find((n) => n.tier === tier);
            const earned = !!userNft;

            return (
              <div
                key={tier}
                className={cn(
                  "flex flex-col items-center rounded-lg border p-5 text-center",
                  earned
                    ? "border-border bg-card shadow-md"
                    : "border-border/50 bg-card/40 opacity-60",
                )}
              >
                <span className={cn("text-3xl", !earned && "grayscale")}>
                  {NFT_ICONS[tier]}
                </span>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {NFT_LABELS[tier]}
                </p>
                <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  {tier === "gold" ? "Tradeable" : "Soulbound"}
                </span>
                {earned && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Earned {userNft.earned_at}
                  </p>
                )}
                {!earned && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Not earned
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed tasks */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <ListChecks className="h-4 w-4" />
          Completed Tasks
        </h2>
        <div className="mt-3 space-y-2">
          {user.tasks_completed.map((task) => {
            const color = PROJECT_COLORS[task.project_slug] ?? "#7B5EA7";
            const initials = task.project_name.slice(0, 2).toUpperCase();

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
      </div>
    </main>
  );
}
