import type { XpConfig } from "@/types/xp";

export const xpConfig: XpConfig = {
  // ─── Task definitions ───────────────────────────────────────────────
  tasks: {
    follow_arc_x: {
      id: "follow_arc_x",
      xp: 5,
      type: "social",
      verifier: "x_oauth",
      optional: false,
      expiryDays: null,
      label: "Follow Arc on X",
      description: "Follow the official Arc account on X.",
    },
    follow_arcquest_x: {
      id: "follow_arcquest_x",
      xp: 5,
      type: "social",
      verifier: "x_oauth",
      optional: false,
      expiryDays: null,
      label: "Follow ArcQuest on X",
      description: "Follow the ArcQuest account on X.",
    },
    follow_founder_x: {
      id: "follow_founder_x",
      xp: 5,
      type: "social",
      verifier: "x_oauth",
      optional: false,
      expiryDays: null,
      label: "Follow Founder on X",
      description: "Follow a listed Arc founder on X.",
    },
    join_discord: {
      id: "join_discord",
      xp: 10,
      type: "social",
      verifier: "discord_oauth",
      optional: false,
      expiryDays: null,
      label: "Join Discord Server",
      description: "Join a project's Discord server.",
    },
    retweet: {
      id: "retweet",
      xp: 5,
      type: "social",
      verifier: "x_oauth",
      optional: false,
      expiryDays: 7,
      label: "Retweet / Quote Post",
      description: "Retweet or quote a specified post on X.",
    },
    visit_site: {
      id: "visit_site",
      xp: 5,
      type: "visit",
      verifier: "timer",
      optional: false,
      expiryDays: null,
      label: "Visit Project Site",
      description:
        "Visit the project website and stay for at least 60 seconds.",
    },
    onchain_swap: {
      id: "onchain_swap",
      xp: 50,
      type: "onchain",
      verifier: "arc_rpc",
      optional: false,
      expiryDays: 7,
      label: "Swap on DEX",
      description: "Complete a token swap on an Arc DEX.",
    },
    onchain_lend: {
      id: "onchain_lend",
      xp: 40,
      type: "onchain",
      verifier: "arc_rpc",
      optional: false,
      expiryDays: 7,
      label: "Lend on Protocol",
      description: "Supply assets to a lending protocol on Arc.",
    },
    onchain_bridge: {
      id: "onchain_bridge",
      xp: 30,
      type: "onchain",
      verifier: "arc_rpc",
      optional: false,
      expiryDays: 7,
      label: "Bridge to Arc",
      description: "Bridge assets to the Arc network.",
    },
    arc_quiz: {
      id: "arc_quiz",
      xp: 20,
      type: "quiz",
      verifier: "backend",
      optional: true,
      expiryDays: null,
      label: "Arc Knowledge Quiz",
      description:
        "Answer 10 questions about the Arc ecosystem. One wrong answer resets to Q1. XP awarded once.",
    },
  },

  // ─── Level thresholds ───────────────────────────────────────────────
  levels: [
    { level: 1, xp: 0, title: "New Explorer" },
    { level: 2, xp: 50, title: "Arc Builder" },
    { level: 3, xp: 200, title: "Arc Veteran" },
    { level: 4, xp: 500, title: "Arc OG" },
    { level: 5, xp: 1000, title: "Arc Legend" },
  ],

  // ─── NFT milestones ─────────────────────────────────────────────────
  nfts: [
    {
      threshold: 100,
      name: "Bronze Badge",
      tier: "bronze",
      tradeable: false,
      tokenStandard: "ERC-1155",
    },
    {
      threshold: 500,
      name: "Silver Badge",
      tier: "silver",
      tradeable: false,
      tokenStandard: "ERC-1155",
    },
    {
      threshold: 1000,
      name: "Gold Badge",
      tier: "gold",
      tradeable: true,
      tokenStandard: "ERC-1155",
    },
  ],

  // ─── Onboarding sequence (must complete before quest board unlocks) ─
  onboarding: [
    {
      order: 1,
      taskId: "connect_wallet",
      required: true,
      label: "Connect Wallet",
    },
    {
      order: 2,
      taskId: "set_display_name",
      required: true,
      label: "Set Display Name",
    },
    {
      order: 3,
      taskId: "follow_arc_x",
      required: true,
      label: "Follow Arc on X",
    },
    {
      order: 4,
      taskId: "follow_arcquest_x",
      required: true,
      label: "Follow ArcQuest on X",
    },
    {
      order: 5,
      taskId: "follow_founder_x",
      required: true,
      label: "Follow Each Listed Founder on X",
    },
    {
      order: 6,
      taskId: "arc_quiz",
      required: false,
      label: "Complete Arc Quiz (optional)",
    },
  ],

  // ─── Quiz ───────────────────────────────────────────────────────────
  quiz: {
    totalQuestions: 10,
    xpReward: 20,
    failBehavior: "restart",
    maxAwards: 1,
    questions: [
      {
        id: "q1",
        order: 1,
        question: "What type of blockchain is Arc?",
        options: [
          { id: "q1a", text: "A Bitcoin sidechain" },
          { id: "q1b", text: "A stablecoin-focused Layer 1 built by Circle" },
          { id: "q1c", text: "An Ethereum Layer 2 rollup" },
          { id: "q1d", text: "A privacy-focused blockchain" },
        ],
        correctOptionId: "q1b",
      },
      {
        id: "q2",
        order: 2,
        question: "Which company created the Arc blockchain?",
        options: [
          { id: "q2a", text: "Coinbase" },
          { id: "q2b", text: "Binance" },
          { id: "q2c", text: "Circle" },
          { id: "q2d", text: "Consensys" },
        ],
        correctOptionId: "q2c",
      },
      {
        id: "q3",
        order: 3,
        question: "What is USDC?",
        options: [
          { id: "q3a", text: "An algorithmic stablecoin" },
          { id: "q3b", text: "A governance token for Circle" },
          {
            id: "q3c",
            text: "A fully-reserved stablecoin pegged 1:1 to the US dollar",
          },
          { id: "q3d", text: "A wrapped version of Bitcoin" },
        ],
        correctOptionId: "q3c",
      },
      {
        id: "q4",
        order: 4,
        question: "What happens if you get one question wrong on the Arc Quiz?",
        options: [
          { id: "q4a", text: "You lose 10 XP" },
          { id: "q4b", text: "You restart from question 1" },
          { id: "q4c", text: "You skip to the next question" },
          { id: "q4d", text: "The quiz locks for 24 hours" },
        ],
        correctOptionId: "q4b",
      },
      {
        id: "q5",
        order: 5,
        question:
          "In ArcQuest, how is XP awarded to prevent users from cheating?",
        options: [
          { id: "q5a", text: "Users self-report their XP in a form" },
          { id: "q5b", text: "XP is calculated client-side in the browser" },
          {
            id: "q5c",
            text: "XP is awarded server-side only after backend verification",
          },
          { id: "q5d", text: "Users vote on who deserves XP" },
        ],
        correctOptionId: "q5c",
      },
      {
        id: "q6",
        order: 6,
        question:
          "What token standard do the ArcQuest milestone NFTs use?",
        options: [
          { id: "q6a", text: "ERC-20" },
          { id: "q6b", text: "ERC-721" },
          { id: "q6c", text: "ERC-1155" },
          { id: "q6d", text: "ERC-4626" },
        ],
        correctOptionId: "q6c",
      },
      {
        id: "q7",
        order: 7,
        question:
          "Which ArcQuest NFT badge is tradeable?",
        options: [
          { id: "q7a", text: "Bronze Badge (100 XP)" },
          { id: "q7b", text: "Silver Badge (500 XP)" },
          { id: "q7c", text: "All badges are tradeable" },
          { id: "q7d", text: "Gold Badge (1000 XP)" },
        ],
        correctOptionId: "q7d",
      },
      {
        id: "q8",
        order: 8,
        question: "What does 'soulbound' mean for an NFT?",
        options: [
          { id: "q8a", text: "It can only be minted once per collection" },
          {
            id: "q8b",
            text: "It is permanently tied to the wallet that claimed it and cannot be transferred",
          },
          { id: "q8c", text: "It burns automatically after 30 days" },
          { id: "q8d", text: "It requires staking to hold" },
        ],
        correctOptionId: "q8b",
      },
      {
        id: "q9",
        order: 9,
        question:
          "How many XP do you need to reach the highest level (Arc Legend) in ArcQuest?",
        options: [
          { id: "q9a", text: "500 XP" },
          { id: "q9b", text: "2000 XP" },
          { id: "q9c", text: "1000 XP" },
          { id: "q9d", text: "750 XP" },
        ],
        correctOptionId: "q9c",
      },
      {
        id: "q10",
        order: 10,
        question:
          "What is the primary purpose of ArcQuest in the Arc ecosystem?",
        options: [
          { id: "q10a", text: "To provide a DEX for trading tokens" },
          { id: "q10b", text: "To serve as a block explorer" },
          {
            id: "q10c",
            text: "To be the reputation and discovery layer connecting all Arc protocols",
          },
          { id: "q10d", text: "To act as a bridge between Ethereum and Arc" },
        ],
        correctOptionId: "q10c",
      },
    ],
  },

  // ─── Rate limits & verification ─────────────────────────────────────
  rateLimits: {
    maxVerificationsPerMinute: 3,
    verificationPollIntervalMs: 30_000,
    verificationPollMaxMs: 300_000,
    visitTimerSeconds: 60,
  },
} as const satisfies XpConfig;
