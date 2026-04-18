export const xpRegistryAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "totalXP",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
