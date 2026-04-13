export type ProjectStatus = "verified" | "community";

export type ProjectTaskType = "onchain" | "social" | "educational";

export interface ProjectTask {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly xp_reward: number;
  readonly task_type: ProjectTaskType;
  readonly cta_label: string;
  readonly cta_href: string;
  readonly completed?: boolean;
}

export interface Project {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly long_description: string;
  readonly status: ProjectStatus;
  readonly category: string;
  readonly website: string;
  readonly x_handle: string;
  readonly logo_placeholder: string;
  readonly accent_color: string;
  readonly tasks: readonly ProjectTask[];
  readonly total_xp: number;
  readonly participants: number;
}
