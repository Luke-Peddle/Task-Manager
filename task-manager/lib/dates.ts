export const DAY_MS = 86_400_000;

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
    const group = map.get(key);
    if (group) group.push(item);
    else map.set(key, [item]);
  }
  return map;
}