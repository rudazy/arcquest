"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronDown } from "lucide-react";
import { getLevelColor } from "@/lib/level-colors";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry, LeaderboardFilter, NftTier } from "@/types/leaderboard";

const CURRENT_USER = "ludarep";

const FILTERS: { id: LeaderboardFilter; label: string }[] = [
  { id: "all_time", label: "All Time" },
  { id: "this_week", label: "This Week" },
  { id: "by_project", label: "By Project" },
];

const PLACEHOLDER_PROJECTS = ["Aave", "Maple", "Curve"];

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-zinc-300",
  3: "text-amber-600",
};

const PODIUM_BORDERS: Record<number, string> = {
  1: "border-yellow-400/50",
  2: "border-zinc-300/50",
  3: "border-amber-600/50",
};

const PODIUM_GLOWS: Record<number, string> = {
  1: "shadow-yellow-400/10",
  2: "shadow-zinc-300/10",
  3: "shadow-amber-600/10",
};

const NFT_ICONS: Record<NftTier, string> = {
  bronze: "\u{1F949}",
  silver: "\u{1F948}",
  gold: "\u{1F947}",
};

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
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
        LEVEL_BG[level] ?? "bg-zinc-400/15 text-zinc-400",
      )}
    >
      Lv{level}
    </span>
  );
}

function NftBadges({ nfts }: { nfts: readonly NftTier[] }) {
  if (nfts.length === 0) {
    return <span className="text-xs text-muted-foreground">&mdash;</span>;
  }
  return (
    <span className="flex gap-0.5">
      {nfts.map((tier) => (
        <span key={tier} className="text-sm" title={`${tier} badge`}>
          {NFT_ICONS[tier]}
        </span>
      ))}
    </span>
  );
}

// ─── Podium card ────────────────────────────────────────────────────

function PodiumCard({
  rank,
  display_name,
  xp,
  level,
  elevated,
}: {
  rank: number;
  display_name: string;
  xp: number;
  level: number;
  elevated?: boolean;
}) {
  const border = PODIUM_BORDERS[rank] ?? "border-border";
  const glow = PODIUM_GLOWS[rank] ?? "";
  const rankColor = RANK_COLORS[rank] ?? "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank === 1 ? 0 : rank * 0.1 }}
      className={cn(
        "flex flex-col items-center rounded-lg border bg-card px-6 py-6 shadow-lg",
        border,
        glow,
        elevated && "lg:-mt-4",
      )}
    >
      {/* Rank */}
      <span className={cn("text-2xl font-bold tabular-nums", rankColor)}>
        #{rank}
      </span>

      {/* Avatar */}
      <div
        className={cn(
          "mt-3 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white",
          rank === 1 && "bg-gradient-to-br from-yellow-500 to-amber-600",
          rank === 2 && "bg-gradient-to-br from-zinc-300 to-zinc-500",
          rank === 3 && "bg-gradient-to-br from-amber-600 to-amber-800",
        )}
      >
        {getInitials(display_name)}
      </div>

      {/* Name */}
      <p className="mt-2 text-sm font-semibold text-foreground">
        {display_name}
        {display_name === CURRENT_USER && (
          <span className="ml-1.5 rounded bg-[#7B5EA7]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#7B5EA7]">
            You
          </span>
        )}
      </p>

      {/* XP + Level */}
      <p
        className="mt-1 text-xs font-medium tabular-nums"
        style={{ color: "#f5c842" }}
      >
        {xp.toLocaleString()} XP
      </p>
      <div className="mt-1.5">
        <LevelBadge level={level} />
      </div>
    </motion.div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [activeFilter, setActiveFilter] =
    useState<LeaderboardFilter>("all_time");
  const [selectedProject, setSelectedProject] = useState(
    PLACEHOLDER_PROJECTS[0],
  );
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard?limit=20&offset=0")
      .then((r) => r.json())
      .then((json: { data?: LeaderboardEntry[] }) => {
        if (Array.isArray(json.data)) {
          const mapped: LeaderboardEntry[] = json.data.map((row) => ({
            ...row,
            nfts: row.nft_badges ?? row.nfts ?? [],
          }));
          setEntries(mapped);
        }
      })
      .catch(() => {
        // Server unavailable
      });
  }, []);

  const top3 = entries.slice(0, 3);
  // Podium order: #2 left, #1 center, #3 right
  const podiumOrder = [top3[1], top3[0], top3[2]];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Leaderboard
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Top Arc Terminal participants ranked by XP
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="mt-6">
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeFilter === f.id
                  ? "bg-[#7B5EA7] text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Project selector for "by_project" */}
        {activeFilter === "by_project" && (
          <div className="relative mt-3 w-48">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2 pr-8 text-sm text-foreground focus:border-[#7B5EA7] focus:outline-none focus:ring-1 focus:ring-[#7B5EA7]"
              aria-label="Select project"
            >
              {PLACEHOLDER_PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Top 3 podium — desktop only */}
      <div className="mt-8 hidden lg:grid lg:grid-cols-3 lg:gap-4 lg:items-end">
        {podiumOrder.map(
          (entry) =>
            entry && (
              <PodiumCard
                key={entry.rank}
                rank={entry.rank}
                display_name={entry.display_name}
                xp={entry.xp}
                level={entry.level}
                elevated={entry.rank === 1}
              />
            ),
        )}
      </div>

      {/* Full table */}
      <div className="mt-8 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Display Name</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium text-right">XP</th>
              <th className="hidden px-4 py-3 font-medium text-right sm:table-cell">
                Tasks
              </th>
              <th className="px-4 py-3 font-medium">NFTs</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isCurrentUser = entry.display_name === CURRENT_USER;
              const rankColor =
                RANK_COLORS[entry.rank] ?? "text-muted-foreground";

              return (
                <tr
                  key={entry.rank}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-muted/30",
                    isCurrentUser && "bg-[#7B5EA7]/5",
                  )}
                >
                  {/* Rank */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        rankColor,
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>

                  {/* Display Name */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {entry.display_name}
                    </span>
                    {isCurrentUser && (
                      <span className="ml-2 rounded bg-[#7B5EA7]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#7B5EA7]">
                        You
                      </span>
                    )}
                  </td>

                  {/* Level */}
                  <td className="px-4 py-3">
                    <LevelBadge level={entry.level} />
                  </td>

                  {/* XP */}
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-medium tabular-nums",
                      getLevelColor(entry.level),
                    )}
                  >
                    {entry.xp.toLocaleString()}
                  </td>

                  {/* Tasks — hidden on mobile */}
                  <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">
                    {entry.tasks_completed}
                  </td>

                  {/* NFTs */}
                  <td className="px-4 py-3">
                    <NftBadges nfts={entry.nfts} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Load more placeholder */}
      <div className="mt-6 flex justify-center">
        <button
          disabled
          className="cursor-not-allowed rounded-md border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground"
        >
          Load more
        </button>
      </div>
    </main>
  );
}
