import type { LeaderboardEntry } from "@/types/leaderboard";

export const MOCK_LEADERBOARD: readonly LeaderboardEntry[] = [
  { rank: 1,  display_name: "CryptoKing",    level: 5, xp: 2400, tasks_completed: 30, nfts: ["gold", "silver", "bronze"] },
  { rank: 2,  display_name: "nald",          level: 4, xp: 890,  tasks_completed: 22, nfts: ["silver", "bronze"] },
  { rank: 3,  display_name: "ludarep",       level: 3, xp: 420,  tasks_completed: 14, nfts: ["bronze"] },
  { rank: 4,  display_name: "arcmaxi",       level: 3, xp: 385,  tasks_completed: 13, nfts: ["bronze"] },
  { rank: 5,  display_name: "stableSam",     level: 3, xp: 340,  tasks_completed: 12, nfts: ["bronze"] },
  { rank: 6,  display_name: "0xVault",       level: 3, xp: 310,  tasks_completed: 11, nfts: ["bronze"] },
  { rank: 7,  display_name: "degenQueen",    level: 3, xp: 275,  tasks_completed: 10, nfts: ["bronze"] },
  { rank: 8,  display_name: "usdcWhale",     level: 3, xp: 240,  tasks_completed: 9,  nfts: ["bronze"] },
  { rank: 9,  display_name: "circleNode",    level: 3, xp: 215,  tasks_completed: 8,  nfts: ["bronze"] },
  { rank: 10, display_name: "gaslessGary",   level: 3, xp: 200,  tasks_completed: 8,  nfts: ["bronze"] },
  { rank: 11, display_name: "finTechFinn",   level: 2, xp: 165,  tasks_completed: 7,  nfts: [] },
  { rank: 12, display_name: "bridgeRunner",  level: 2, xp: 140,  tasks_completed: 6,  nfts: [] },
  { rank: 13, display_name: "yieldHunter",   level: 2, xp: 120,  tasks_completed: 5,  nfts: [] },
  { rank: 14, display_name: "swapSage",      level: 2, xp: 105,  tasks_completed: 5,  nfts: [] },
  { rank: 15, display_name: "onchainOscar",  level: 2, xp: 88,   tasks_completed: 4,  nfts: [] },
  { rank: 16, display_name: "questJunkie",   level: 2, xp: 72,   tasks_completed: 4,  nfts: [] },
  { rank: 17, display_name: "mintMaster",    level: 2, xp: 55,   tasks_completed: 3,  nfts: [] },
  { rank: 18, display_name: "web3Wren",      level: 1, xp: 40,   tasks_completed: 2,  nfts: [] },
  { rank: 19, display_name: "newbieNova",    level: 1, xp: 25,   tasks_completed: 2,  nfts: [] },
  { rank: 20, display_name: "freshStart_01", level: 1, xp: 15,   tasks_completed: 1,  nfts: [] },
] as const;
