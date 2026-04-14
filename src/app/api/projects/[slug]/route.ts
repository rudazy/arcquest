import { NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/projects-mock";

/**
 * GET /api/projects/[slug] — Single project with tasks.
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: project });
}
