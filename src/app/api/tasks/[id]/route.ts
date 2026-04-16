import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { ProjectTaskType, ProjectStatus } from "@/types/project";

/**
 * GET /api/tasks/[id] — Single task with project context and related tasks.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
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
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const project = (data.projects as unknown) as {
    slug: string;
    name: string;
    logo_placeholder: string;
    accent_color: string;
    status: string;
  } | null;

  const projectSlug = (data.project_slug as string) ?? project?.slug ?? "";

  // Fetch up to 2 related tasks from the same project
  const { data: relatedRaw } = await supabase
    .from("project_tasks")
    .select(
      `id, title, description, xp_reward, task_type, cta_label, cta_href,
       project_slug,
       projects!inner(slug, name, logo_placeholder, accent_color, status)`,
    )
    .eq("project_slug", projectSlug)
    .neq("id", id)
    .limit(2);

  const mapTask = (row: typeof data) => {
    const p = (row.projects as unknown) as typeof project;
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      xp_reward: row.xp_reward as number,
      task_type: row.task_type as ProjectTaskType,
      cta_label: row.cta_label as string,
      cta_href: row.cta_href as string,
      project_slug: (row.project_slug as string) ?? p?.slug ?? "",
      project_name: p?.name ?? "",
      project_logo: p?.logo_placeholder ?? "",
      project_accent: p?.accent_color ?? "#7B5EA7",
      project_status: (p?.status ?? "verified") as ProjectStatus,
    };
  };

  return NextResponse.json({
    data: mapTask(data),
    related: (relatedRaw ?? []).map(mapTask),
  });
}
