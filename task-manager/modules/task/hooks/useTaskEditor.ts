import { useState } from "react";
import type { CompletableTask, Step, StepParent, Task } from "@/types/task";
import { useTaskCompletion, useUpdateStep } from "./useTasks";

type OpenDialog = "task" | "step" | null;

interface StepConfirmation {
  step: Step;
  task: StepParent;
}

export function useTaskEditor() {
  const taskSaver = useTaskCompletion();
  const stepSaver = useUpdateStep();

  const [task, setTask] = useState<Task | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [stepTaskDueDate, setStepTaskDueDate] = useState<string | null>(null);
  const [open, setOpen] = useState<OpenDialog>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmingTask, setConfirmingTask] = useState<CompletableTask | null>(null);
  const [confirmingStep, setConfirmingStep] = useState<StepConfirmation | null>(null);

  function show(dialog: Exclude<OpenDialog, null>) {
    setDialogKey((current) => current + 1);
    setOpen(dialog);
  }

  const completion = {
    toggle: (next: CompletableTask, checked: boolean) => {
      if (checked && next.steps.some((s) => !s.completed)) {
        setConfirmingTask(next);
        return;
      }
      taskSaver.setCompleted(next.id, checked);
    },
    confirm: (completeSteps: boolean) => {
      if (!confirmingTask) return;
      taskSaver.setCompleted(confirmingTask.id, true, completeSteps);
      setConfirmingTask(null);
    },
    cancel: () => setConfirmingTask(null),
    confirming: confirmingTask,
    isChecked: taskSaver.isChecked,
    error: taskSaver.error,
  };

  const stepToggle = {
    toggleStep: (next: Step, completed: boolean, parent: StepParent) => {
      if (!completed && parent.completed) {
        setConfirmingStep({ step: next, task: parent });
        return;
      }
      stepSaver.setCompleted(next.id, completed);
    },
    confirmReopen: () => {
      if (!confirmingStep) return;
      stepSaver.setCompleted(confirmingStep.step.id, false);
      setConfirmingStep(null);
    },
    cancelReopen: () => setConfirmingStep(null),
    confirming: confirmingStep,
    isChecked: stepSaver.isChecked,
    error: stepSaver.error,
  };

  return {
    completion,
    stepToggle,
    error: completion.error ?? stepToggle.error,
    editTask: (next: Task) => {
      setTask(next);
      show("task");
    },
    editStep: (next: Step, parent: StepParent) => {
      setStep(next);
      setStepTaskDueDate(parent.dueDate);
      show("step");
    },
    dialogs: { task, step, stepTaskDueDate, open, dialogKey, close: () => setOpen(null) },
  };
}

export type TaskEditor = ReturnType<typeof useTaskEditor>;
export type TaskCompletion = TaskEditor["completion"];
export type StepToggle = TaskEditor["stepToggle"];