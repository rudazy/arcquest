"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ListChecks, Check, Zap } from "lucide-react";
import { taskStorageKey } from "@/lib/tasks-helpers";
import { WalletBoundary } from "@/components/wallet-detector";
import { cn } from "@/lib/utils";
import type { ProjectTaskType } from "@/types/project";
import type { TaskWithProject } from "@/lib/tasks-helpers";

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

type FilterType = "all" | ProjectTaskType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "onchain", label: "Onchain" },
  { key: "social", label: "Social" },
  { key: "educational", label: "Educational" },
];

// ─── Task Card ───────────────────────────────────────────────────────

function TaskListCard({
  task,
  isCompleted,
}: {
  task: TaskWithProject;
  isCompleted: boolean;
}) {
  const badge = TASK_TYPE_BADGE[task.task_type];

  return (
    <Link href={`/tasks/${task.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-[#7B5EA7]/40 hover:bg-card/80",
          isCompleted ? "border-green-900/40 bg-green-950/5" : "border-border",
        )}
      >
        {/* Project logo */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${task.project_accent}, ${task.project_accent}cc)`,
          }}
        >
          {task.project_logo}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
                badge.className,
              )}
            >
              {badge.label}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {task.project_name}
            </span>
          </div>
          <h3 className="mt-1 truncate text-sm font-semibold text-foreground group-hover:text-white">
            {task.title}
          </h3>
        </div>

        {/* Right side: XP + status */}
        <div className="flex shrink-0 items-center gap-3">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
              <Check className="h-3.5 w-3.5" />
              Done
            </span>
          ) : (
            <span
              className="rounded-md px-2.5 py-1 text-xs font-bold"
              style={{
                color: "#f5c842",
                backgroundColor: "rgba(245, 200, 66, 0.1)",
              }}
            >
              +{task.xp_reward} XP
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [allTasks, setAllTasks] = useState<TaskWithProject[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Fetch tasks from API
  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((json: { data?: TaskWithProject[] }) => {
        if (Array.isArray(json.data)) setAllTasks(json.data);
      })
      .catch(() => {
        // Server unavailable
      });
  }, []);

  // Load completed state from localStorage (fast, immediate)
  useEffect(() => {
    if (allTasks.length === 0) return;
    const completed = new Set<string>();
    for (const task of allTasks) {
      try {
        const val = localStorage.getItem(
          taskStorageKey(task.project_slug, task.id),
        );
        if (val) completed.add(task.id);
      } catch {
        // localStorage unavailable
      }
    }
    setCompletedIds(completed);
  }, [allTasks]);

  // Server hydration: merge DB completion state when wallet connects
  useEffect(() => {
    if (!walletAddress || allTasks.length === 0) return;
    fetch(`/api/user/tasks?wallet=${walletAddress}`)
      .then((r) => r.json())
      .then((json: { data?: { task_id: string }[] }) => {
        const serverIds = new Set((json.data ?? []).map((d) => d.task_id));
        if (serverIds.size === 0) return;
        setCompletedIds((prev) => {
          const merged = new Set(prev);
          serverIds.forEach((id) => merged.add(id));
          return merged;
        });
        // Sync localStorage with server truth
        for (const task of allTasks) {
          if (serverIds.has(task.id)) {
            try {
              localStorage.setItem(taskStorageKey(task.project_slug, task.id), "true");
            } catch {
              // localStorage unavailable
            }
          }
        }
      })
      .catch(() => {
        // Server unavailable — localStorage state stands
      });
  }, [walletAddress, allTasks]);

  // Filter then sort by XP descending
  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];
    if (filter !== "all") {
      tasks = tasks.filter((t) => t.task_type === filter);
    }
    tasks.sort((a, b) => b.xp_reward - a.xp_reward);
    return tasks;
  }, [allTasks, filter]);

  const totalXp = allTasks.reduce((sum, t) => sum + t.xp_reward, 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <WalletBoundary onWalletAddress={setWalletAddress} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-[#7B5EA7]" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            All Tasks
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {allTasks.length} tasks across all projects
          <span className="mx-2 text-border">|</span>
          <span className="font-medium" style={{ color: "#f5c842" }}>
            {totalXp} XP
          </span>{" "}
          available
        </p>
      </motion.div>

      {/* Filter bar */}
      <div className="mt-6 flex items-center gap-1 rounded-lg border border-border bg-card/50 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-[#7B5EA7] text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort indicator */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Zap className="h-3 w-3" style={{ color: "#f5c842" }} />
          Sorted by Most XP
        </div>
      </div>

      {/* Task list */}
      <div className="mt-3 space-y-2">
        {filteredTasks.map((task) => (
          <TaskListCard
            key={task.id}
            task={task}
            isCompleted={completedIds.has(task.id)}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && allTasks.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            No tasks match this filter.
          </p>
        </div>
      )}
    </main>
  );
}
