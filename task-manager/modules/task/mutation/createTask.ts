import { Result } from "@/types/Result";
import { httpClient } from "@/lib/httpClient/HTTPClient";
import { Task } from "@/types/task";

export interface CreateStepPayload {
  name: string;
  description: string | null;
  dueDate: string | null;
}

export interface CreateTaskPayload {
  name: string;
  description: string | null;
  dueDate: string | null;
  steps: CreateStepPayload[];
}

export const createTask = async (
  props: CreateTaskPayload
): Promise<Result<Task>> => {
  return await httpClient.POST<Task>("/tasks", JSON.stringify(props));
};