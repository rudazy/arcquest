import { NextResponse } from "next/server";
import { getTaskById } from "@/lib/tasks-helpers";

/**
 * GET /api/tasks/[id] — Single task details with project context.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const task = getTaskById(params.id);

  if (!task) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: task });
}
