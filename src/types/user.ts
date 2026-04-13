import type { NftTier } from "./leaderboard";

export type { NftTier };

export interface UserNft {
  readonly tier: NftTier;
  readonly earned_at: string;
  readonly tradeable: boolean;
}

export interface CompletedTask {
  readonly task_id: string;
  readonly project_slug: string;
  readonly project_name: string;
  readonly xp_earned: number;
  readonly completed_at: string;
}

export interface UserProfile {
  readonly address: string;
  readonly display_name: string;
  readonly level: number;
  readonly xp: number;
  readonly xp_to_next_level: number;
  readonly rank: number;
  readonly tasks_completed: readonly CompletedTask[];
  readonly nfts: readonly UserNft[];
  readonly joined_at: string;
}
