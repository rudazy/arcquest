"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  ExternalLink,
  Zap,
  Users,
  ListChecks,
} from "lucide-react";
import { getProjectBySlug } from "@/lib/projects-mock";
import { cn } from "@/lib/utils";
import type { ProjectTask, ProjectTaskType } from "@/types/project";

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

function storageKey(projectSlug: string, taskId: string): string {
  return `arc_task_${projectSlug}_${taskId}`;
}

function TaskCard({
  task,
  completedTasks,
  onComplete,
}: {
  task: ProjectTask;
  completedTasks: Set<string>;
  onComplete: (taskId: string) => void;
}) {
  const badge = TASK_TYPE_BADGE[task.task_type];
  const isCompleted = completedTasks.has(task.id);

  const handleCta = () => {
    onComplete(task.id);
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5 transition-colors",
        isCompleted ? "border-green-900/40 bg-green-950/5" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Type badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold leading-none",
              badge.className,
            )}
          >
            {badge.label}
          </span>

          {/* Title + description */}
          <h3 className="mt-2 text-sm font-semibold text-foreground">
            {task.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        </div>

        {/* XP reward */}
        <span
          className="shrink-0 rounded-md px-2.5 py-1 text-xs font-bold"
          style={{
            color: "#f5c842",
            backgroundColor: "rgba(245, 200, 66, 0.1)",
          }}
        >
          +{task.xp_reward} XP
        </span>
      </div>

      {/* CTA / Completed state */}
      <div className="mt-4">
        {isCompleted ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
            <Check className="h-3.5 w-3.5" />
            Completed
          </div>
        ) : (
          <a
            href={task.cta_href}
            target={task.cta_href.startsWith("/") ? undefined : "_blank"}
            rel={
              task.cta_href.startsWith("/")
                ? undefined
                : "noopener noreferrer"
            }
            onClick={handleCta}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#7B5EA7] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#6a4e94]"
          >
            {task.cta_label}
            {task.task_type === "social" && (
              <ExternalLink className="h-3 w-3" />
            )}
            {task.task_type === "educational" && (
              <Zap className="h-3 w-3" />
            )}
          </a>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail({ slug }: { slug: string }) {
  const project = getProjectBySlug(slug);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Load completed tasks from localStorage on mount
  useEffect(() => {
    if (!project) return;
    const completed = new Set<string>();
    for (const task of project.tasks) {
      try {
        if (localStorage.getItem(storageKey(slug, task.id)) === "true") {
          completed.add(task.id);
        }
      } catch {
        // localStorage unavailable
      }
    }
    setCompletedTasks(completed);
  }, [project, slug]);

  const handleComplete = (taskId: string) => {
    try {
      localStorage.setItem(storageKey(slug, taskId), "true");
    } catch {
      // localStorage unavailable
    }
    setCompletedTasks((prev) => new Set(prev).add(taskId));
  };

  if (!project) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Project not found</p>
          <Link
            href="/projects"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#7B5EA7] hover:text-[#9b7ec8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Projects
          </Link>
        </div>
      </main>
    );
  }

  const isCommunity = project.status === "community";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Projects
      </Link>

      {/* Community warning banner */}
      {isCommunity && (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-amber-200/80">
            Community Project — This project has not been officially verified
            by Arc Terminal. DYOR before interacting.
          </p>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6"
      >
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${project.accent_color}, ${project.accent_color}cc)`,
            }}
          >
            {project.logo_placeholder}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              {isCommunity ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  Community
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400">
                  <Check className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Category + links */}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium uppercase tracking-wider">
                {project.category}
              </span>
              <span className="text-border">|</span>
              <a
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`https://x.com/${project.x_handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {project.x_handle}
              </a>
            </div>
          </div>
        </div>

        {/* Long description */}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {project.long_description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" style={{ color: "#f5c842" }} />
            <span className="font-medium" style={{ color: "#f5c842" }}>
              {project.total_xp}
            </span>{" "}
            XP available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">
              {project.tasks.length}
            </span>{" "}
            tasks
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">
              {project.participants}
            </span>{" "}
            participants
          </span>
        </div>
      </motion.div>

      {/* Task list */}
      <div className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Tasks
        </h2>
        {project.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            completedTasks={completedTasks}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </main>
  );
}
