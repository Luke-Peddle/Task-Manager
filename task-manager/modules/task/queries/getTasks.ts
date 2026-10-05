import { httpClient } from "@/lib/httpClient/HTTPClient";
import { queryOptions } from "@tanstack/react-query";
import { PaginatedResponse, Task } from "@/types/task";

export const QUERY_KEY = "tasks";

const getTasks = async (page: number, limit: number) =>
  httpClient.GET<PaginatedResponse<Task>>(`/tasks?page=${page}&limit=${limit}`);

export const getTasksOptions = (page: number, limit: number) =>
  queryOptions({
    queryKey: [QUERY_KEY, page, limit],
    queryFn: () => getTasks(page, limit),
  });