export const checkInAbi = [
  {
    type: "function",
    name: "checkIn",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "dayIndex", type: "uint256", indexed: true },
      { name: "newStreak", type: "uint256", indexed: false },
    ],
  },
] as const;
