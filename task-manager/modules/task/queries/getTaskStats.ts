import { httpClient } from "@/lib/httpClient/HTTPClient";
import { queryOptions } from "@tanstack/react-query";
import { TaskStats } from "@/types/task";

export const QUERY_KEY = "task-stats";

const getTaskStats = async () => httpClient.GET<TaskStats>("/tasks/stats");

export const getTaskStatsOptions = () =>
  queryOptions({
    queryKey: [QUERY_KEY],
    queryFn: () => getTaskStats(),
  });