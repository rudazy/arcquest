"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutGrid, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { getProjectsByStatus } from "@/lib/projects-mock";
import { cn } from "@/lib/utils";
import type { ProjectStatus, Project } from "@/types/project";

const TABS: { id: ProjectStatus; label: string; icon: typeof Check }[] = [
  { id: "verified", label: "Official", icon: Check },
  { id: "community", label: "Community", icon: AlertTriangle },
];

function ProjectCard({ project }: { project: Project }) {
  const isCommunity = project.status === "community";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col rounded-lg border bg-card transition-colors hover:bg-muted/20",
        isCommunity ? "border-l-2 border-l-amber-500 border-t-border border-r-border border-b-border" : "border-border",
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        {/* Logo + status */}
        <div className="flex items-start justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${project.accent_color}, ${project.accent_color}cc)` }}
          >
            {project.logo_placeholder}
          </div>
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

        {/* Name + category */}
        <h3 className="mt-3 text-base font-semibold text-foreground">
          {project.name}
        </h3>
        <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {project.category}
        </span>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-medium" style={{ color: "#f5c842" }}>
              {project.total_xp}
            </span>{" "}
            XP
          </span>
          <span className="text-border">|</span>
          <span>
            <span className="font-medium text-foreground">
              {project.tasks.length}
            </span>{" "}
            tasks
          </span>
          <span className="text-border">|</span>
          <span>
            <span className="font-medium text-foreground">
              {project.participants}
            </span>{" "}
            joined
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border px-5 py-3">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7B5EA7] transition-colors hover:text-[#9b7ec8]"
        >
          View Tasks
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<ProjectStatus>("verified");
  const projects = getProjectsByStatus(activeTab);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-6 w-6 text-[#7B5EA7]" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Projects
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete tasks on Arc ecosystem projects to earn XP
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-[#7B5EA7] text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Community warning */}
      {activeTab === "community" && (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-amber-200/80">
            Community projects have not been officially verified by Arc
            Terminal. Always do your own research before interacting.
          </p>
        </div>
      )}

      {/* Project grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </main>
  );
}
