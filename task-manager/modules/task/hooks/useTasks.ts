import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Result } from "@/types/Result";
import { createTask, type CreateTaskPayload } from "../mutation/createTask";
import {
  QUERY_KEY as DEADLINE_TASKS_KEY,
  getDeadlineTasksOptions,
} from "../queries/getDeadlineTasks";
import { QUERY_KEY as TASK_STATS_KEY, getTaskStatsOptions } from "../queries/getTaskStats";
import { QUERY_KEY as TASKS_KEY, getTasksOptions } from "../queries/getTasks";

function fromResult<T>(result: Result<T> | undefined) {
  if (!result) return { data: undefined, error: null };
  if (result.error !== null) return { data: undefined, error: result.error.message };
  return { data: result.data, error: null };
}

export function useTasks(page: number, limit: number) {
  const query = useQuery({ ...getTasksOptions(page, limit), placeholderData: keepPreviousData });
  const { data, error } = fromResult(query.data);
  const total = data?.total ?? 0;

  return {
    tasks: data?.data ?? [],
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasData: data !== undefined,
    loading: query.isFetching,
    error,
  };
}

export function useTaskStats() {
  const query = useQuery(getTaskStatsOptions());
  const { data, error } = fromResult(query.data);

  return { data: data ?? null, loading: query.isPending, error };
}

export function useDeadlineTasks(kind: "upcoming" | "overdue", limit = 5) {
  const query = useQuery(getDeadlineTasksOptions(kind, limit));
  const { data, error } = fromResult(query.data);

  return { data: data ?? null, loading: query.isPending, error };
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (result) => {
      if (result.error !== null) return;
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEADLINE_TASKS_KEY] });
    },
  });

  return {
    createTask: async (payload: CreateTaskPayload) => {
      const result = await mutation.mutateAsync(payload);
      return result.error === null ? result.data : null;
    },
    submitting: mutation.isPending,
    error: fromResult(mutation.data).error,
    resetError: mutation.reset,
  };
}