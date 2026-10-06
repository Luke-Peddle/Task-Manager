import { httpClient } from "@/lib/httpClient/HTTPClient";
import { queryOptions } from "@tanstack/react-query";
import { Task } from "@/types/task";

export const QUERY_KEY = "task-timeline";

const getTimeline = async () => httpClient.GET<Task[]>("/tasks/timeline");

export const getTimelineOptions = () =>
  queryOptions({
    queryKey: [QUERY_KEY],
    queryFn: () => getTimeline(),
  });