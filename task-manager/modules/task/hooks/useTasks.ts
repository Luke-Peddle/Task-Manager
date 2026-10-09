import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Result } from "@/types/Result";
import { createTask, type CreateTaskPayload } from "../mutation/createTask";
import { updateStep, type UpdateStepPayload } from "../mutation/updateStep";
import { updateTask, type UpdateTaskPayload } from "../mutation/updateTask";
import { QUERY_KEY as CALENDAR_KEY, getCalendarOptions } from "../queries/getCalendar";
import { QUERY_KEY as TASK_KEY, getTaskOptions } from "../queries/getTask";
import { QUERY_KEY as TIMELINE_KEY, getTimelineOptions } from "../queries/getTimeline";

function fromResult<T>(result: Result<T> | undefined) {
  if (!result) return { data: undefined, error: null };
  if (result.error !== null) return { data: undefined, error: result.error.message };
  return { data: result.data, error: null };
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: [TIMELINE_KEY] }),
      queryClient.invalidateQueries({ queryKey: [CALENDAR_KEY] }),
      queryClient.invalidateQueries({ queryKey: [TASK_KEY] }),
    ]);
}

function useSaveMutation<P, T>(mutationFn: (payload: P) => Promise<Result<T>>) {
  const invalidate = useInvalidateTasks();

  const mutation = useMutation({
    mutationFn,
    onSuccess: (result) => {
      if (result.error === null) return invalidate();
    },
  });

  return {
    save: async (payload: P) => {
      const result = await mutation.mutateAsync(payload);
      return result.error === null ? result.data : null;
    },
    submitting: mutation.isPending,
    error: fromResult(mutation.data).error,
    resetError: mutation.reset,
  };
}

export function useTimeline() {
  const query = useQuery(getTimelineOptions());
  const { data, error } = fromResult(query.data);

  return {
    tasks: data ?? [],
    hasData: data !== undefined,
    loading: query.isPending,
    error,
  };
}

export function useTask(id: number) {
  const validId = Number.isInteger(id) && id > 0;
  const query = useQuery({ ...getTaskOptions(id), enabled: validId });
  const { data, error } = fromResult(query.data);

  return {
    task: data ?? null,
    loading: validId && query.isPending,
    notFound: !validId || query.data?.error?.statusCode === 404,
    error,
  };
}

export function useCalendar(from: string, to: string) {
  const query = useQuery({ ...getCalendarOptions(from, to), placeholderData: keepPreviousData });
  const { data, error } = fromResult(query.data);

  return { data: data ?? null, loading: query.isPending, error };
}

export function useCreateTask() {
  return useSaveMutation((payload: CreateTaskPayload) => createTask(payload));
}

export function useSaveTask() {
  return useSaveMutation((payload: UpdateTaskPayload) => updateTask(payload));
}

export function useSaveStep() {
  return useSaveMutation((payload: UpdateStepPayload) => updateStep(payload));
}

export function useUpdateStep() {
  const invalidate = useInvalidateTasks();

  const mutation = useMutation({
    mutationFn: (payload: UpdateStepPayload) => updateStep(payload),
    onSettled: () => invalidate(),
  });

  const pending = mutation.isPending ? mutation.variables : undefined;

  return {
    setCompleted: (stepId: number, completed: boolean) => mutation.mutate({ stepId, completed }),
    isChecked: (step: { id: number; completed: boolean }) =>
      pending?.stepId === step.id ? (pending.completed ?? step.completed) : step.completed,
    error: fromResult(mutation.data).error,
  };
}

export function useTaskCompletion() {
  const invalidate = useInvalidateTasks();

  const mutation = useMutation({
    mutationFn: (payload: UpdateTaskPayload) => updateTask(payload),
    onSettled: () => invalidate(),
  });

  const pending = mutation.isPending ? mutation.variables : undefined;

  return {
    setCompleted: (taskId: number, completed: boolean, completeSteps?: boolean) =>
      mutation.mutate({ taskId, completed, completeSteps }),
    isChecked: (task: { id: number; completed: boolean }) =>
      pending?.taskId === task.id ? (pending.completed ?? task.completed) : task.completed,
    error: fromResult(mutation.data).error,
  };
}