export const dynamic = "force-dynamic";

import TaskDetail from "./task-detail";

export default function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TaskDetail taskId={params.id} />;
}
