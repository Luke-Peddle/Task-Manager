import { Result } from "@/types/Result";
import { httpClient } from "@/lib/httpClient/HTTPClient";
import { Task } from "@/types/task";
import { CreateStepPayload } from "./createTask";

export interface TaskStepPayload extends CreateStepPayload {
  id?: number;
}

export interface UpdateTaskPayload {
  taskId: number;
  name?: string;
  description?: string | null;
  dueDate?: string | null;
  completed?: boolean;
  completeSteps?: boolean;
  steps?: TaskStepPayload[];
}

export const updateTask = async (
  props: UpdateTaskPayload
): Promise<Result<Task>> => {
  const { taskId, ...body } = props;
  return await httpClient.PATCH<Task>(`/tasks/${taskId}`, JSON.stringify(body));
};