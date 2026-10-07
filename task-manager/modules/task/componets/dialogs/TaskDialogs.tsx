"use client";

import type { TaskEditor } from "../../hooks/useTaskEditor";
import { CompleteTaskDialog } from "./CompleteTaskDialog";
import { EditStepDialog } from "./StepDialog";
import { TaskFormDialog } from "./TaskFormDialog";

interface TaskDialogsProps {
  editor: TaskEditor;
}

export function TaskDialogs(props: TaskDialogsProps) {
  const { completion, dialogs } = props.editor;
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
      />
    </>
  );
}