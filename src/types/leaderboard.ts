export type NftTier = "bronze" | "silver" | "gold";

export interface LeaderboardEntry {
  readonly rank: number;
  readonly display_name: string;
  readonly level: number;
  readonly xp: number;
  readonly tasks_completed: number;
  readonly nfts: readonly NftTier[];
}

export type LeaderboardFilter = "all_time" | "this_week" | "by_project";
