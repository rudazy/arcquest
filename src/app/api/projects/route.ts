import { NextResponse } from "next/server";
import { MOCK_PROJECTS } from "@/lib/projects-mock";

/**
 * GET /api/projects — List all projects.
 * Query params: ?status=verified|community
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let projects = [...MOCK_PROJECTS];

  if (status === "verified" || status === "community") {
    projects = projects.filter((p) => p.status === status);
  }

  return NextResponse.json({
    data: projects,
    total: projects.length,
  });
}
