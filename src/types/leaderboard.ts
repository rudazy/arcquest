export type NftTier = "bronze" | "silver" | "gold";

export interface LeaderboardEntry {
  readonly rank: number;
  readonly display_name: string;
  readonly level: number;
  readonly xp: number;
  readonly tasks_completed: number;
  /** nfts is the canonical field name from the API; nft_badges is the DB column alias */
  readonly nfts: readonly NftTier[];
  readonly nft_badges?: readonly NftTier[];
}

export type LeaderboardFilter = "all_time" | "this_week" | "by_project";
