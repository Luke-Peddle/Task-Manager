"use client";

import type { TaskEditor } from "../../hooks/useTaskEditor";
import { CompleteTaskDialog } from "./CompleteTaskDialog";
import { ReopenTaskDialog } from "./ReopenTaskDialog";
import { EditStepDialog } from "./StepDialog";
import { TaskFormDialog } from "./TaskFormDialog";

export function TaskDialogs({ editor }: { editor: TaskEditor }) {
  const { completion, stepToggle, dialogs } = editor;
  const closeOnDismiss = (open: boolean) => {
    if (!open) dialogs.close();
  };

  return (
    <>
      <CompleteTaskDialog
        key={completion.confirming?.id ?? "none"}
        task={completion.confirming}
        onConfirm={completion.confirm}
        onCancel={completion.cancel}
      />
      <TaskFormDialog
        key={`task-${dialogs.dialogKey}`}
        open={dialogs.open === "task"}
        onOpenChange={closeOnDismiss}
        task={dialogs.task}
      />
      <EditStepDialog
        key={`step-${dialogs.dialogKey}`}
        open={dialogs.open === "step"}
        onOpenChange={closeOnDismiss}
        step={dialogs.step}
        taskDueDate={dialogs.stepTaskDueDate}
      />
      <ReopenTaskDialog
        confirming={stepToggle.confirming}
        onConfirm={stepToggle.confirmReopen}
        onCancel={stepToggle.cancelReopen}
      />
    </>
  );
}