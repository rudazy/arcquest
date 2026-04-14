import { MOCK_PROJECTS } from "@/lib/projects-mock";
import type { ProjectTask, ProjectStatus } from "@/types/project";

export interface TaskWithProject extends ProjectTask {
  readonly project_slug: string;
  readonly project_name: string;
  readonly project_logo: string;
  readonly project_accent: string;
  readonly project_status: ProjectStatus;
}

export function getAllTasks(): TaskWithProject[] {
  const tasks: TaskWithProject[] = [];
  for (const project of MOCK_PROJECTS) {
    for (const task of project.tasks) {
      tasks.push({
        ...task,
        project_slug: project.slug,
        project_name: project.name,
        project_logo: project.logo_placeholder,
        project_accent: project.accent_color,
        project_status: project.status,
      });
    }
  }
  return tasks;
}

export function getTaskById(id: string): TaskWithProject | undefined {
  return getAllTasks().find((t) => t.id === id);
}

export function getRelatedTasks(taskId: string, limit = 2): TaskWithProject[] {
  const task = getTaskById(taskId);
  if (!task) return [];
  return getAllTasks()
    .filter((t) => t.project_slug === task.project_slug && t.id !== taskId)
    .slice(0, limit);
}

export function getAllTaskIds(): string[] {
  return getAllTasks().map((t) => t.id);
}

export function taskStorageKey(projectSlug: string, taskId: string): string {
  return `arc_task_${projectSlug}_${taskId}`;
}
