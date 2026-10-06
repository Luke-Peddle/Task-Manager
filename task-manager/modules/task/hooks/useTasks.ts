import { useState } from "react";
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
import { QUERY_KEY as TIMELINE_KEY, getTimelineOptions } from "../queries/getTimeline";
import type { CompletableTask } from "@/types/task";

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
    ]);
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

export function useCalendar(from: string, to: string) {
  const query = useQuery({ ...getCalendarOptions(from, to), placeholderData: keepPreviousData });
  const { data, error } = fromResult(query.data);

  return { data: data ?? null, loading: query.isPending, error };
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();

  const mutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (result) => {
      if (result.error === null) return invalidate();
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

export function useUpdateStep() {
  const invalidate = useInvalidateTasks();

  const mutation = useMutation({
    mutationFn: (payload: UpdateStepPayload) => updateStep(payload),
    onSettled: () => invalidate(),
  });

  const pending = mutation.isPending ? mutation.variables : undefined;

  return {
    toggleStep: (stepId: number, completed: boolean) => mutation.mutate({ stepId, completed }),
    isChecked: (step: { id: number; completed: boolean }) =>
      pending?.stepId === step.id ? pending.completed : step.completed,
    error: fromResult(mutation.data).error,
  };
}

export function useTaskCompletion() {
  const invalidate = useInvalidateTasks();
  const [confirming, setConfirming] = useState<CompletableTask | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: UpdateTaskPayload) => updateTask(payload),
    onSettled: () => invalidate(),
  });

  const pending = mutation.isPending ? mutation.variables : undefined;

  function toggle(task: CompletableTask, checked: boolean) {
    if (checked && task.steps.some((step) => !step.completed)) {
      setConfirming(task);
      return;
    }
    mutation.mutate({ taskId: task.id, completed: checked });
  }

  function confirm(completeSteps: boolean) {
    if (!confirming) return;
    mutation.mutate({ taskId: confirming.id, completed: true, completeSteps });
    setConfirming(null);
  }

  return {
    toggle,
    confirm,
    cancel: () => setConfirming(null),
    confirming,
    isChecked: (task: { id: number; completed: boolean }) =>
      pending?.taskId === task.id ? pending.completed : task.completed,
    error: fromResult(mutation.data).error,
  };
}

export type StepToggle = ReturnType<typeof useUpdateStep>;
export type TaskCompletion = ReturnType<typeof useTaskCompletion>;