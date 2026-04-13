export interface OnboardingStepDef {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly xp_reward: number;
  readonly required: boolean;
}

export const ONBOARDING_STEPS: readonly OnboardingStepDef[] = [
  {
    id: "connect_wallet",
    label: "Connect Wallet",
    description: "Connect your wallet to get started with Arc Terminal.",
    xp_reward: 0,
    required: true,
  },
  {
    id: "set_display_name",
    label: "Set Display Name",
    description:
      "Choose a unique name for the leaderboard. 3\u201320 characters, letters, numbers, and underscores only.",
    xp_reward: 5,
    required: true,
  },
  {
    id: "follow_arc",
    label: "Follow Arc on X",
    description: "Follow the official Arc account on X to stay updated.",
    xp_reward: 5,
    required: true,
  },
  {
    id: "follow_arcterminal",
    label: "Follow Arc Terminal on X",
    description:
      "Follow Arc Terminal on X for quest updates and announcements.",
    xp_reward: 5,
    required: true,
  },
  {
    id: "follow_founders",
    label: "Follow Founders on X",
    description:
      "Follow the Arc founders on X to connect with the team behind the ecosystem.",
    xp_reward: 10,
    required: true,
  },
];

/** Total XP awarded across all mandatory onboarding steps: 25 */
export const TOTAL_ONBOARDING_XP = ONBOARDING_STEPS.reduce(
  (sum, step) => sum + step.xp_reward,
  0,
);
