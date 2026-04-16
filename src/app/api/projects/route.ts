import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { Project, ProjectTask, ProjectTaskType, ProjectStatus } from "@/types/project";

/**
 * GET /api/projects — List all projects.
 * Query params: ?status=verified|community
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const supabase = createServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  let query = supabase
    .from("projects")
    .select(
      `slug, name, description, long_description, status, category,
       website, x_handle, logo_placeholder, accent_color, total_xp, participants,
       project_tasks(id, title, description, xp_reward, task_type, cta_label, cta_href, sort_order)`,
    )
    .order("created_at", { ascending: false });

  if (status === "verified" || status === "community") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }

  const projects: Project[] = (data ?? []).map((row) => {
    const rawTasks = (row.project_tasks ?? []) as Array<{
      id: string;
      title: string;
      description: string;
      xp_reward: number;
      task_type: string;
      cta_label: string;
      cta_href: string;
      sort_order: number;
    }>;

    const tasks: ProjectTask[] = rawTasks
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        xp_reward: t.xp_reward,
        task_type: t.task_type as ProjectTaskType,
        cta_label: t.cta_label,
        cta_href: t.cta_href,
      }));

    return {
      slug: row.slug as string,
      name: row.name as string,
      description: row.description as string,
      long_description: (row.long_description as string) ?? "",
      status: row.status as ProjectStatus,
      category: row.category as string,
      website: (row.website as string) ?? "",
      x_handle: (row.x_handle as string) ?? "",
      logo_placeholder: (row.logo_placeholder as string) ?? "",
      accent_color: (row.accent_color as string) ?? "#7B5EA7",
      total_xp: (row.total_xp as number) ?? 0,
      participants: (row.participants as number) ?? 0,
      tasks,
    };
  });

  return NextResponse.json({ data: projects, total: projects.length });
}
