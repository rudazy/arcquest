import type { NftTier } from "@/types/leaderboard";

const LEVEL_THRESHOLDS = [0, 50, 200, 500, 1000] as const;

const LEVEL_LABELS: Record<number, string> = {
  1: "Arc Newcomer",
  2: "Arc Builder",
  3: "Arc Veteran",
  4: "Arc Expert",
  5: "Arc Legend",
};

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = LEVEL_THRESHOLDS[i];
    if (threshold !== undefined && xp >= threshold) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function getXpToNextLevel(xp: number): {
  current: number;
  required: number;
  level: number;
} {
  const level = getLevel(xp);
  if (level >= LEVEL_THRESHOLDS.length) {
    return { current: xp, required: xp, level };
  }
  const nextThreshold = LEVEL_THRESHOLDS[level];
  if (nextThreshold === undefined) {
    return { current: xp, required: xp, level };
  }
  return { current: xp, required: nextThreshold, level };
}

export function getLevelLabel(level: number): string {
  return LEVEL_LABELS[level] ?? "Arc Newcomer";
}

export function getNftMilestones(xp: number): NftTier[] {
  const tiers: NftTier[] = [];
  if (xp >= 100) tiers.push("bronze");
  if (xp >= 500) tiers.push("silver");
  if (xp >= 1000) tiers.push("gold");
  return tiers;
}
