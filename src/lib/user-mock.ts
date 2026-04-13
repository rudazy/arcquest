import type { UserProfile } from "@/types/user";

export const MOCK_USER: UserProfile = {
  address: "0x1234...5678",
  display_name: "ludarep",
  level: 3,
  xp: 420,
  xp_to_next_level: 500,
  rank: 3,
  tasks_completed: [
    {
      task_id: "aave_supply",
      project_slug: "aave",
      project_name: "Aave",
      xp_earned: 30,
      completed_at: "2025-01-12",
    },
    {
      task_id: "aave_follow",
      project_slug: "aave",
      project_name: "Aave",
      xp_earned: 5,
      completed_at: "2025-01-11",
    },
    {
      task_id: "maple_deposit",
      project_slug: "maple",
      project_name: "Maple Finance",
      xp_earned: 30,
      completed_at: "2025-01-10",
    },
    {
      task_id: "maple_follow",
      project_slug: "maple",
      project_name: "Maple Finance",
      xp_earned: 5,
      completed_at: "2025-01-09",
    },
    {
      task_id: "curve_swap",
      project_slug: "curve",
      project_name: "Curve Finance",
      xp_earned: 25,
      completed_at: "2025-01-08",
    },
    {
      task_id: "curve_follow",
      project_slug: "curve",
      project_name: "Curve Finance",
      xp_earned: 5,
      completed_at: "2025-01-07",
    },
  ],
  nfts: [
    {
      tier: "bronze",
      earned_at: "2025-01-10",
      tradeable: false,
    },
  ],
  joined_at: "2025-01-05",
};
