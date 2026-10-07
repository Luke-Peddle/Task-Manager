import { useState } from "react";
import type { Step, Task } from "@/types/task";
import { useTaskCompletion, useUpdateStep } from "./useTasks";

type OpenDialog = "task" | "step" | null;

export function useTaskEditor() {
  const completion = useTaskCompletion();
  const stepToggle = useUpdateStep();
  const [task, setTask] = useState<Task | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [open, setOpen] = useState<OpenDialog>(null);
  const [dialogKey, setDialogKey] = useState(0);

  function show(dialog: Exclude<OpenDialog, null>) {
    setDialogKey((current) => current + 1);
    setOpen(dialog);
  }

  return {
    completion,
    stepToggle,
    error: completion.error ?? stepToggle.error,
    editTask: (next: Task) => {
      setTask(next);
      show("task");
    },
    editStep: (next: Step) => {
      setStep(next);
      show("step");
    },
    dialogs: { task, step, open, dialogKey, close: () => setOpen(null) },
  };
}

export type TaskEditor = ReturnType<typeof useTaskEditor>;