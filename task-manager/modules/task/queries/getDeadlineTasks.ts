import { httpClient } from "@/lib/httpClient/HTTPClient";
import { queryOptions } from "@tanstack/react-query";
import { Task } from "@/types/task";

export const QUERY_KEY = "deadline-tasks";

const getDeadlineTasks = async (kind: "upcoming" | "overdue", limit: number) =>
  httpClient.GET<Task[]>(`/tasks/${kind}?limit=${limit}`);

export const getDeadlineTasksOptions = (kind: "upcoming" | "overdue", limit: number) =>
  queryOptions({
    queryKey: [QUERY_KEY, kind, limit],
    queryFn: () => getDeadlineTasks(kind, limit),
  });