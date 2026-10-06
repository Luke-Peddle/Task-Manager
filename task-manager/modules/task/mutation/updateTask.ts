import { Result } from "@/types/Result";
import { httpClient } from "@/lib/httpClient/HTTPClient";
import { Task } from "@/types/task";

export interface UpdateTaskPayload {
  taskId: number;
  completed: boolean;
  completeSteps?: boolean;
}

export const updateTask = async (
  props: UpdateTaskPayload
): Promise<Result<Task>> => {
  const { taskId, ...body } = props;
  return await httpClient.PATCH<Task>(`/tasks/${taskId}`, JSON.stringify(body));
};