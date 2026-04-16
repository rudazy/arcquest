import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { ProjectTaskType, ProjectStatus } from "@/types/project";

/**
 * GET /api/tasks — All tasks across all projects.
 * Returns tasks in TaskWithProject shape for the tasks listing page.
 */
export async function GET() {
  const supabase = createServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("project_tasks")
    .select(
      `id, title, description, xp_reward, task_type, cta_label, cta_href,
       project_slug,
       projects!inner(slug, name, logo_placeholder, accent_color, status)`,
    )
    .order("xp_reward", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }

  const tasks = (data ?? []).map((row) => {
    const project = (row.projects as unknown) as {
      slug: string;
      name: string;
      logo_placeholder: string;
      accent_color: string;
      status: string;
    } | null;

    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      xp_reward: row.xp_reward as number,
      task_type: row.task_type as ProjectTaskType,
      cta_label: row.cta_label as string,
      cta_href: row.cta_href as string,
      project_slug: (row.project_slug as string) ?? project?.slug ?? "",
      project_name: project?.name ?? "",
      project_logo: project?.logo_placeholder ?? "",
      project_accent: project?.accent_color ?? "#7B5EA7",
      project_status: (project?.status ?? "verified") as ProjectStatus,
    };
  });

  return NextResponse.json({ data: tasks });
}
