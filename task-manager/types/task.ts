export interface Step {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  taskId: number;
}

export interface Task {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  steps?: Step[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TaskStats {
  total: number;
  overdue: number;
  dueThisWeek: number;
  totalSteps: number;
}

export type TaskStatus = "overdue" | "due-soon" | "on-track" | "no-date";