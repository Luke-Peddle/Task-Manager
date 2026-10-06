import type { Task, TaskGroup, TaskStatus } from "@/types/task";

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