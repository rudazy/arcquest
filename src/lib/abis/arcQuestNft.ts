export const arcQuestNftAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "claimed",
    inputs: [
      { name: "user", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
