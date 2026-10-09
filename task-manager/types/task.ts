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

export interface CalendarTask extends Task {
  dueDate: string;
}

export interface StepParent {
  name: string;
  dueDate: string | null;
  completed: boolean;
}

export interface CalendarStep extends Step {
  task: { id: number; name: string; dueDate: string | null; completed: boolean };
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

export interface StepFormFields {
  name: string;
  description: string;
  dueDate: string;
}

export type MilestoneKind = "step" | "due";

export interface Milestone {
  id: string;
  kind: MilestoneKind;
  dueDate: string;
  label: string;
  done: boolean;
  overdue: boolean;
}

export interface StepDraft extends StepFormFields {
  key: number;
  id?: number;
}

export interface TaskFormFields {
  name: string;
  description: string;
  dueDate: string;
}