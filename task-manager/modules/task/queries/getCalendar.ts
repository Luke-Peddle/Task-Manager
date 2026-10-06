import { httpClient } from "@/lib/httpClient/HTTPClient";
import { queryOptions } from "@tanstack/react-query";
import { CalendarData } from "@/types/task";

export const QUERY_KEY = "task-calendar";

const getCalendar = async (from: string, to: string) =>
  httpClient.GET<CalendarData>(
    `/tasks/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );

export const getCalendarOptions = (from: string, to: string) =>
  queryOptions({
    queryKey: [QUERY_KEY, from, to],
    queryFn: () => getCalendar(from, to),
  });