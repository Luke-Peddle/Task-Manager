import type { TaskStatus } from "@/types/task";

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

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  overdue: "Overdue",
  "due-soon": "Due soon",
  "on-track": "On track",
  "no-date": "No due date",
};

export type PageItem = number | "ellipsis";

export function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis");

  items.push(total);
  return items;
}

export function getRangeLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) return "No tasks";
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `Showing ${from}–${to} of ${total}`;
}