import { httpClient } from "@/lib/httpClient/HTTPClient";
import { queryOptions } from "@tanstack/react-query";
import { Task } from "@/types/task";

export const QUERY_KEY = "task";

const getTask = async (id: number) => httpClient.GET<Task>(`/tasks/${id}`);

export const getTaskOptions = (id: number) =>
  queryOptions({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getTask(id),
  });