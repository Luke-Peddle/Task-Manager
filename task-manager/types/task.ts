export interface Step {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  taskId: number;
}

export interface Task {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  steps: Step[];
}

export interface CompletableTask {
  id: number;
  name: string;
  completed: boolean;
  steps: { id: number; name: string; completed: boolean }[];
}

export interface CalendarTask extends CompletableTask {
  dueDate: string;
}

export interface CalendarStep extends Step {
  task: { id: number; name: string };
}

export interface CalendarData {
  tasks: CalendarTask[];
  steps: CalendarStep[];
}

export type TaskStatus = "overdue" | "due-soon" | "on-track" | "no-date";

export interface TaskGroup {
  id: "overdue" | "this-week" | "later" | "no-date" | "completed";
  label: string;
  tasks: Task[];
}