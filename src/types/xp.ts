export type TaskType = "social" | "onchain" | "quiz" | "visit";

export type VerifierType =
  | "x_oauth"
  | "discord_oauth"
  | "arc_rpc"
  | "backend"
  | "timer";

export interface TaskDefinition {
  readonly id: string;
  readonly xp: number;
  readonly type: TaskType;
  readonly verifier: VerifierType;
  readonly optional: boolean;
  readonly expiryDays: number | null;
  readonly label: string;
  readonly description: string;
}

export interface LevelDefinition {
  readonly level: number;
  readonly xp: number;
  readonly title: string;
}

export interface NftMilestone {
  readonly threshold: number;
  readonly name: string;
  readonly tier: "bronze" | "silver" | "gold";
  readonly tradeable: boolean;
  readonly tokenStandard: "ERC-1155";
}

export interface OnboardingStep {
  readonly order: number;
  readonly taskId: string;
  readonly required: boolean;
  readonly label: string;
}

export interface QuizOption {
  readonly id: string;
  readonly text: string;
}

export interface QuizQuestion {
  readonly id: string;
  readonly order: number;
  readonly question: string;
  readonly options: readonly [QuizOption, QuizOption, QuizOption, QuizOption];
  readonly correctOptionId: string;
}

export interface XpConfig {
  readonly tasks: Record<string, TaskDefinition>;
  readonly levels: readonly LevelDefinition[];
  readonly nfts: readonly NftMilestone[];
  readonly onboarding: readonly OnboardingStep[];
  readonly quiz: {
    readonly totalQuestions: 10;
    readonly xpReward: number;
    readonly failBehavior: "restart";
    readonly maxAwards: 1;
    readonly questions: readonly QuizQuestion[];
  };
  readonly rateLimits: {
    readonly maxVerificationsPerMinute: number;
    readonly verificationPollIntervalMs: number;
    readonly verificationPollMaxMs: number;
    readonly visitTimerSeconds: number;
  };
}
