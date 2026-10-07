import type { Step, StepFormFields, Task, TaskGroup, TaskStatus, Milestone } from "@/types/task";

const DAY_MS = 86_400_000;
const DUE_SOON_DAYS = 3;
const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatRelative(value: string, now = Date.now()): string {
  const days = Math.round((new Date(value).getTime() - now) / DAY_MS);
  if (Math.abs(days) >= 60) return relativeFormatter.format(Math.round(days / 30), "month");
  if (Math.abs(days) >= 14) return relativeFormatter.format(Math.round(days / 7), "week");
  return relativeFormatter.format(days, "day");
}

export function dateInputToIso(value: string): string | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59).toISOString();
}

export function isoToDateInput(value: string | null): string {
  return value ? toDateKey(new Date(value)) : "";
}

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

export function getTaskMilestones(
  task: Task,
  isStepChecked: (step: Step) => boolean,
  completed: boolean,
  now = Date.now(),
): Milestone[] {
  const isPast = (date: string) => new Date(date).getTime() < now;
  const milestones: Milestone[] = [];
 
  for (const step of task.steps) {
    if (!step.dueDate) continue;
    const done = isStepChecked(step);
    milestones.push({
      id: `step-${step.id}`,
      kind: "step",
      dueDate: step.dueDate,
      label: step.name,
      done,
      overdue: !done && isPast(step.dueDate),
    });
  }
 
  if (task.dueDate) {
    milestones.push({
      id: "due",
      kind: "due",
      dueDate: task.dueDate,
      label: "Task due",
      done: completed,
      overdue: !completed && isPast(task.dueDate),
    });
  }
 
  return milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export const EMPTY_STEP_FIELDS: StepFormFields = { name: "", description: "", dueDate: "" };

export function stepToFormFields(step: Step): StepFormFields {
  return {
    name: step.name,
    description: step.description ?? "",
    dueDate: isoToDateInput(step.dueDate),
  };
}

export function formFieldsToStepPayload(fields: StepFormFields) {
  return {
    name: fields.name.trim(),
    description: fields.description.trim() || null,
    dueDate: dateInputToIso(fields.dueDate),
  };
}

export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getMonthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  return Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

export function groupByDateKey<T extends { dueDate: string | null }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    if (!item.dueDate) continue;
    const key = toDateKey(new Date(item.dueDate));
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return map;
}

export function statusText(milestone: Milestone) {
  if (milestone.done) return "Done";
  if (milestone.overdue) return `Overdue, ${formatRelative(milestone.dueDate)}`;
  return formatRelative(milestone.dueDate);
}

interface Span {
  from: Date;
  to: Date;
}

export function getSpan(milestones: Milestone[]): Span | undefined {
  if (milestones.length === 0) return undefined;
  const today = new Date();
  const first = new Date(milestones[0].dueDate);
  const last = new Date(milestones[milestones.length - 1].dueDate);
  return { from: today < first ? today : first, to: last };
}

export function initialMonth(span: Span | undefined) {
  const today = new Date();
  if (!span || (today >= span.from && today <= span.to)) return startOfMonth(today);
  return startOfMonth(today > span.to ? span.to : span.from);
}