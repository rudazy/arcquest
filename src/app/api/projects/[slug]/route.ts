import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { Project, ProjectTask, ProjectTaskType, ProjectStatus } from "@/types/project";

/**
 * GET /api/projects/[slug] — Single project with tasks.
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;
  const supabase = createServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      `slug, name, description, long_description, status, category,
       website, x_handle, logo_placeholder, accent_color, total_xp, participants,
       project_tasks(id, title, description, xp_reward, task_type, cta_label, cta_href, sort_order)`,
    )
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const rawTasks = (data.project_tasks ?? []) as Array<{
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

  const project: Project = {
    slug: data.slug as string,
    name: data.name as string,
    description: data.description as string,
    long_description: (data.long_description as string) ?? "",
    status: data.status as ProjectStatus,
    category: data.category as string,
    website: (data.website as string) ?? "",
    x_handle: (data.x_handle as string) ?? "",
    logo_placeholder: (data.logo_placeholder as string) ?? "",
    accent_color: (data.accent_color as string) ?? "#7B5EA7",
    total_xp: (data.total_xp as number) ?? 0,
    participants: (data.participants as number) ?? 0,
    tasks,
  };

  return NextResponse.json({ data: project });
}
