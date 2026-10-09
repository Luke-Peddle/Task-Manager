import { DAY_MS } from "../../../lib/dates";
import type { Task, TaskGroup, TaskStatus } from "@/types/task";

const DUE_SOON_DAYS = 3;

export function getTaskStatus(dueDate: string | null, now = Date.now()): TaskStatus {
  if (!dueDate) return "no-date";
  const diff = new Date(dueDate).getTime() - now;
  if (diff < 0) return "overdue";
  if (diff <= DUE_SOON_DAYS * DAY_MS) return "due-soon";
  return "on-track";
}

export function groupTasks(tasks: Task[], now = Date.now()): TaskGroup[] {
  const weekEnd = now + 7 * DAY_MS;
  const groups: TaskGroup[] = [
    { id: "overdue", label: "Overdue", tasks: [] },
    { id: "this-week", label: "This week", tasks: [] },
    { id: "later", label: "Later", tasks: [] },
    { id: "no-date", label: "No due date", tasks: [] },
    { id: "completed", label: "Completed", tasks: [] },
  ];
  const [overdue, thisWeek, later, noDate, completed] = groups;

  for (const task of tasks) {
    if (task.completed) completed.tasks.push(task);
    else if (!task.dueDate) noDate.tasks.push(task);
    else {
      const due = new Date(task.dueDate).getTime();
      if (due < now) overdue.tasks.push(task);
      else if (due <= weekEnd) thisWeek.tasks.push(task);
      else later.tasks.push(task);
    }
  }

  return groups.filter((group) => group.tasks.length > 0);
}

interface ProgressStep {
  id: number;
  name: string;
  completed: boolean;
}

export function getStepProgress<S extends ProgressStep>(
  steps: S[],
  isChecked: (step: S) => boolean = (step) => step.completed,
) {
  const remaining = steps.filter((step) => !isChecked(step));
  return {
    total: steps.length,
    done: steps.length - remaining.length,
    nextStep: remaining[0] ?? null,
  };
}

export type StepProgress = ReturnType<typeof getStepProgress>;

export function getTaskSummary(completed: boolean, progress: StepProgress): string {
  if (completed) return "Completed";
  if (progress.total === 0) return "No steps";
  return progress.nextStep ? `Next: ${progress.nextStep.name}` : "All steps done";
}