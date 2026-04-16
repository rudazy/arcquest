"use client";

import React, { Component, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Link2,
  BookOpen,
  Wallet,
  Zap,
} from "lucide-react";
import { taskStorageKey } from "@/lib/tasks-helpers";
import { XpToast } from "@/components/ui/xp-toast";
import { cn } from "@/lib/utils";
import type { ProjectTaskType } from "@/types/project";
import type { TaskWithProject } from "@/lib/tasks-helpers";

// ─── Constants ───────────────────────────────────────────────────────

const TASK_TYPE_BADGE: Record<
  ProjectTaskType,
  { label: string; className: string; icon: React.ElementType }
> = {
  onchain: {
    label: "Onchain",
    className: "bg-purple-400/15 text-purple-400",
    icon: Link2,
  },
  social: {
    label: "Social",
    className: "bg-blue-400/15 text-blue-400",
    icon: ExternalLink,
  },
  educational: {
    label: "Educational",
    className: "bg-yellow-400/15 text-yellow-400",
    icon: BookOpen,
  },
};

// ─── Privy error boundary ────────────────────────────────────────────

class PrivyBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-sm rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Wallet provider is unavailable. Check your configuration.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Completion helpers ──────────────────────────────────────────────

function getCompletionDate(projectSlug: string, taskId: string): string | null {
  try {
    const val = localStorage.getItem(taskStorageKey(projectSlug, taskId));
    if (!val) return null;
    if (val === "true") return "Completed";
    return val;
  } catch {
    return null;
  }
}

function markCompleted(projectSlug: string, taskId: string): string {
  const date = new Date().toISOString().split("T")[0] ?? "";
  try {
    localStorage.setItem(taskStorageKey(projectSlug, taskId), date);
  } catch {
    // localStorage unavailable
  }
  return date;
}

// ─── Related Task Card ───────────────────────────────────────────────

function RelatedCard({ task }: { task: TaskWithProject }) {
  const badge = TASK_TYPE_BADGE[task.task_type];

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-[#7B5EA7]/40">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${task.project_accent}, ${task.project_accent}cc)`,
          }}
        >
          {task.project_logo}
        </div>
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold leading-none",
              badge.className,
            )}
          >
            {badge.label}
          </span>
          <h4 className="mt-1 truncate text-sm font-medium text-foreground group-hover:text-white">
            {task.title}
          </h4>
        </div>
        <span
          className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold"
          style={{ color: "#f5c842", backgroundColor: "rgba(245, 200, 66, 0.1)" }}
        >
          +{task.xp_reward} XP
        </span>
      </div>
    </Link>
  );
}

// ─── Task Detail Content ─────────────────────────────────────────────

function TaskDetailContent({ taskId }: { taskId: string }) {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();

  const [task, setTask] = useState<TaskWithProject | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionDate, setCompletionDate] = useState<string | null>(null);
  const [socialChecked, setSocialChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastAmount, setToastAmount] = useState(0);
  const [toastTrigger, setToastTrigger] = useState(0);

  const showXpToast = useCallback((amount: number) => {
    setToastAmount(amount);
    setToastTrigger((t) => t + 1);
  }, []);

  const walletAddress = wallets[0]?.address?.toLowerCase() ?? null;

  // Fetch task from API
  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((json: { data?: TaskWithProject; related?: TaskWithProject[] }) => {
        if (json.data) setTask(json.data);
        if (json.related) setRelatedTasks(json.related);
      })
      .catch(() => {
        // Server unavailable
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  // Load completion from localStorage
  useEffect(() => {
    if (!task) return;
    const date = getCompletionDate(task.project_slug, task.id);
    setCompletionDate(date);
  }, [task]);

  // Server hydration: verify completion state from DB when wallet connects
  useEffect(() => {
    if (!task || !walletAddress) return;
    fetch(`/api/user/tasks?wallet=${walletAddress}`)
      .then((r) => r.json())
      .then((json: { data?: { task_id: string; completed_at: string }[] }) => {
        const found = (json.data ?? []).find((d) => d.task_id === task.id);
        if (found) {
          const dateStr = found.completed_at.split("T")[0] ?? "Completed";
          setCompletionDate((prev) => prev ?? dateStr);
          try {
            localStorage.setItem(taskStorageKey(task.project_slug, task.id), dateStr);
          } catch {
            // localStorage unavailable
          }
        }
      })
      .catch(() => {
        // Server unavailable — localStorage state stands
      });
  }, [task, walletAddress]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Task not found</p>
          <Link
            href="/tasks"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#7B5EA7] hover:text-[#9b7ec8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Tasks
          </Link>
        </div>
      </main>
    );
  }

  const badge = TASK_TYPE_BADGE[task.task_type];
  const BadgeIcon = badge.icon;
  const isCompleted = completionDate !== null;

  const handleComplete = () => {
    const date = markCompleted(task.project_slug, task.id);
    setCompletionDate(date);

    if (!walletAddress || isSubmitting) return;
    setIsSubmitting(true);

    // TODO: after server confirms, call XPRegistry.sol.awardXP() onchain (Step 21+)
    fetch("/api/tasks/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address: walletAddress, task_id: task.id }),
    })
      .then((r) => r.json())
      .then((data: { success: boolean; xp_awarded?: number }) => {
        if (data.success && data.xp_awarded) {
          showXpToast(data.xp_awarded);
        }
      })
      .catch(() => {
        // Server unavailable — localStorage update still applied above
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleSocialConfirm = () => {
    if (!socialChecked) return;
    handleComplete();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Tasks
      </Link>

      {/* Task header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6"
      >
        <div className="flex items-start gap-4">
          {/* Project logo */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${task.project_accent}, ${task.project_accent}cc)`,
            }}
          >
            {task.project_logo}
          </div>

          <div className="flex-1">
            {/* Type badge + project link */}
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold leading-none",
                  badge.className,
                )}
              >
                <BadgeIcon className="h-3 w-3" />
                {badge.label}
              </span>
              <Link
                href={`/projects/${task.project_slug}`}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {task.project_name}
              </Link>
            </div>

            {/* Title */}
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {task.title}
            </h1>

            {/* Description */}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {task.description}
            </p>

            {/* XP badge */}
            <div className="mt-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold"
                style={{
                  color: "#f5c842",
                  backgroundColor: "rgba(245, 200, 66, 0.1)",
                }}
              >
                <Zap className="h-3.5 w-3.5" />
                +{task.xp_reward} XP
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action area */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-8"
      >
        {isCompleted ? (
          /* ─── Completed state ─────────────────────────────────── */
          <div className="rounded-lg border border-green-900/40 bg-green-950/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-400">
                  Task Completed
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  +{task.xp_reward} XP earned
                  {completionDate && completionDate !== "Completed" && (
                    <span className="mx-1.5 text-border">|</span>
                  )}
                  {completionDate && completionDate !== "Completed" && (
                    <span>{completionDate}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : task.task_type === "onchain" ? (
          /* ─── Onchain task ───────────────────────────────────── */
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Complete Onchain
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This task will be verified onchain via Arc RPC.
            </p>

            {!ready ? (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : !authenticated ? (
              <button
                onClick={login}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#7B5EA7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet to Complete
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#7B5EA7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
              >
                Complete Task
              </button>
            )}
          </div>
        ) : task.task_type === "social" ? (
          /* ─── Social task ────────────────────────────────────── */
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Complete on X
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Visit the link below, then confirm you completed the action.
            </p>

            <a
              href={task.cta_href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#7B5EA7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
            >
              Go to X
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setSocialChecked(!socialChecked)}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                  socialChecked
                    ? "border-[#7B5EA7] bg-[#7B5EA7]"
                    : "border-zinc-600 bg-transparent hover:border-zinc-500",
                )}
                aria-label="Mark task as complete"
              >
                {socialChecked && <Check className="h-3 w-3 text-white" />}
              </button>
              <span className="text-xs text-muted-foreground">
                I completed this task
              </span>
            </div>

            <button
              onClick={handleSocialConfirm}
              disabled={!socialChecked}
              className={cn(
                "mt-4 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors",
                socialChecked
                  ? "bg-[#7B5EA7] text-white hover:bg-[#6a4e94]"
                  : "cursor-not-allowed bg-zinc-800 text-zinc-500",
              )}
            >
              Confirm Completion
            </button>
          </div>
        ) : (
          /* ─── Educational task ───────────────────────────────── */
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Take the Quiz
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Complete the quiz to earn XP. You must answer all questions
              correctly.
            </p>

            <Link
              href="/quiz"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#7B5EA7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6a4e94]"
            >
              Take Quiz
              <BookOpen className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </motion.div>

      {/* Related tasks */}
      {relatedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-10"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            More from {task.project_name}
          </h2>
          <div className="mt-3 space-y-2">
            {relatedTasks.map((related) => (
              <RelatedCard key={related.id} task={related} />
            ))}
          </div>
        </motion.div>
      )}

      <XpToast amount={toastAmount} trigger={toastTrigger} />
    </main>
  );
}

// ─── Export ──────────────────────────────────────────────────────────

export default function TaskDetail({ taskId }: { taskId: string }) {
  return (
    <PrivyBoundary>
      <TaskDetailContent taskId={taskId} />
    </PrivyBoundary>
  );
}
