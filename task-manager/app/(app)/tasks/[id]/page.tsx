import { TaskDetail } from "@/modules/task/componets/detail/TaskDetail";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <TaskDetail taskId={Number(id)} />
    </div>
  );
}