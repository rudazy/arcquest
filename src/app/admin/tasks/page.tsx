"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ListChecks, Pencil, Ban } from "lucide-react";
import { getAllTasks } from "@/lib/tasks-helpers";
import { MOCK_PROJECTS } from "@/lib/projects-mock";
import { cn } from "@/lib/utils";
import type { ProjectTaskType } from "@/types/project";

// ─── Constants ───────────────────────────────────────────────────────

const TASK_TYPE_BADGE: Record<
  ProjectTaskType,
  { label: string; className: string }
> = {
  onchain: {
    label: "Onchain",
    className: "bg-purple-400/15 text-purple-400",
  },
  social: {
    label: "Social",
    className: "bg-blue-400/15 text-blue-400",
  },
  educational: {
    label: "Educational",
    className: "bg-yellow-400/15 text-yellow-400",
  },
};

// Deterministic mock completions per task ID
function mockCompletions(taskId: string): number {
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    hash = (hash * 31 + taskId.charCodeAt(i)) | 0;
  }
  return 10 + Math.abs(hash % 191);
}

// ─── Page ────────────────────────────────────────────────────────────

export default function AdminTasksPage() {
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const allTasks = useMemo(() => getAllTasks(), []);
  const projectNames = useMemo(
    () => MOCK_PROJECTS.map((p) => ({ slug: p.slug, name: p.name })),
    [],
  );

  const filteredTasks = useMemo(() => {
    if (projectFilter === "all") return allTasks;
    return allTasks.filter((t) => t.project_slug === projectFilter);
  }, [allTasks, projectFilter]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Admin
      </Link>

      {/* Header */}
      <div className="mt-6 flex items-center gap-3">
        <ListChecks className="h-6 w-6 text-[#7B5EA7]" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Tasks
        </h1>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {allTasks.length} tasks across {projectNames.length} projects
      </p>

      {/* Filter */}
      <div className="mt-6">
        <label
          htmlFor="project-filter"
          className="block text-xs font-medium text-muted-foreground"
        >
          Filter by project
        </label>
        <select
          id="project-filter"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="mt-1.5 w-full max-w-xs rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-[#7B5EA7] focus:outline-none focus:ring-1 focus:ring-[#7B5EA7]"
        >
          <option value="all">All Projects</option>
          {projectNames.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-card/60">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Task Title
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Project
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
                XP
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
                Completions
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, i) => {
              const badge = TASK_TYPE_BADGE[task.task_type];
              const completions = mockCompletions(task.id);

              return (
                <tr
                  key={task.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-card/40",
                    i === filteredTasks.length - 1 && "border-b-0",
                  )}
                >
                  {/* Title */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-foreground hover:text-white"
                    >
                      {task.title}
                    </Link>
                  </td>

                  {/* Project */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${task.project_slug}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {task.project_name}
                    </Link>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                  </td>

                  {/* XP */}
                  <td className="px-4 py-3 tabular-nums">
                    <span
                      className="font-bold"
                      style={{ color: "#f5c842" }}
                    >
                      {task.xp_reward}
                    </span>
                  </td>

                  {/* Completions */}
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {completions}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-[#7B5EA7]/40 hover:text-foreground"
                        aria-label={`Edit ${task.title}`}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-red-900/40 hover:text-red-400"
                        aria-label={`Disable ${task.title}`}
                      >
                        <Ban className="h-3 w-3" />
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredTasks.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            No tasks found for this project.
          </p>
        </div>
      )}

      {/* Count */}
      <p className="mt-4 text-xs text-muted-foreground">
        Showing {filteredTasks.length} of {allTasks.length} tasks
      </p>
    </main>
  );
}
