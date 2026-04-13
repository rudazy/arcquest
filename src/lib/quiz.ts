export interface QuizQuestion {
  readonly id: number;
  readonly question: string;
  readonly options: readonly [string, string, string, string];
  readonly correct_index: number;
  readonly explanation: string;
}

export const QUIZ_XP_REWARD = 20;

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 1,
    question: "What is Arc?",
    options: [
      "A Layer 2 on Ethereum",
      "Circle's stablecoin-native L1 blockchain",
      "A cross-chain bridge protocol",
      "A DeFi aggregator",
    ],
    correct_index: 1,
    explanation:
      "Arc is Circle's purpose-built L1 blockchain with USDC as the native gas token.",
  },
  {
    id: 2,
    question: "What token is used as gas on Arc?",
    options: ["ETH", "ARC", "USDC", "USDT"],
    correct_index: 2,
    explanation:
      "Arc uses USDC as its native gas token, making fees stable and predictable.",
  },
  {
    id: 3,
    question: 'What does "sub-second finality" mean on Arc?',
    options: [
      "Transactions take less than 1 minute",
      "Transactions are confirmed in under 1 second",
      "Blocks are produced every 0.5 seconds",
      "Arc has no finality guarantees",
    ],
    correct_index: 1,
    explanation:
      "Arc achieves sub-second finality, meaning transactions are irreversibly confirmed almost instantly.",
  },
  {
    id: 4,
    question: "Who backs Arc?",
    options: ["Coinbase", "Binance", "Circle", "Tether"],
    correct_index: 2,
    explanation: "Arc is built and backed by Circle, the issuer of USDC.",
  },
  {
    id: 5,
    question: "What is the primary use case Arc is designed for?",
    options: [
      "NFT minting",
      "Gaming",
      "Stablecoin-native finance",
      "Privacy transactions",
    ],
    correct_index: 2,
    explanation:
      "Arc is purpose-built for stablecoin-native financial applications.",
  },
  {
    id: 6,
    question: "What makes Arc different from general-purpose L1s?",
    options: [
      "It uses proof of work",
      "USDC is the native gas token",
      "It has no smart contracts",
      "It only supports NFTs",
    ],
    correct_index: 1,
    explanation:
      "Unlike ETH or SOL as gas, Arc uses USDC — making it uniquely suited for financial applications.",
  },
  {
    id: 7,
    question: "What type of tasks can you complete on Arc Terminal?",
    options: [
      "Only social tasks",
      "Only onchain tasks",
      "Onchain, social, and educational tasks",
      "Only quiz tasks",
    ],
    correct_index: 2,
    explanation:
      "Arc Terminal supports three task types: onchain (verified via RPC), social (X OAuth), and educational (quiz).",
  },
  {
    id: 8,
    question: "What happens if you fail a question in the Arc Quiz?",
    options: [
      "You lose XP",
      "You are banned for 24 hours",
      "You restart from Question 1",
      "You skip to the next question",
    ],
    correct_index: 2,
    explanation:
      "The quiz requires a perfect run — fail any question and you restart from Q1.",
  },
  {
    id: 9,
    question: "How much XP do you earn for completing the Arc Quiz?",
    options: ["5 XP", "10 XP", "15 XP", "20 XP"],
    correct_index: 3,
    explanation:
      "The quiz awards 20 XP — the highest single reward on Arc Terminal.",
  },
  {
    id: 10,
    question: "What are NFT milestones on Arc Terminal?",
    options: [
      "NFTs you buy with USDC",
      "Soulbound and tradeable NFTs awarded at XP thresholds",
      "Random NFT drops",
      "NFTs earned only by verified projects",
    ],
    correct_index: 1,
    explanation:
      "Arc Terminal awards milestone NFTs at 100 XP (Bronze, soulbound), 500 XP (Silver, soulbound), and 1000 XP (Gold, tradeable).",
  },
] as const;
