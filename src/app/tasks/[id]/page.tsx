import { getAllTaskIds } from "@/lib/tasks-helpers";
import TaskDetail from "./task-detail";

export function generateStaticParams() {
  return getAllTaskIds().map((id) => ({ id }));
}

export default function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TaskDetail taskId={params.id} />;
}
