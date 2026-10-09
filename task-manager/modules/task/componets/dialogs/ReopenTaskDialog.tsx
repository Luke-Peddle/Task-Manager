"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Step, StepParent } from "@/types/task";

interface ReopenTaskDialogProps {
  confirming: { step: Step; task: StepParent } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReopenTaskDialog({ confirming, onConfirm, onCancel }: ReopenTaskDialogProps) {
  return (
    <Dialog
      open={confirming !== null}
      onOpenChange={(open: boolean) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reopen &ldquo;{confirming?.task.name}&rdquo;?</DialogTitle>
          <DialogDescription>
            This task is marked as completed. Unchecking &ldquo;{confirming?.step.name}&rdquo; will
            mark the task as not done too.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Keep it completed
          </Button>
          <Button onClick={onConfirm}>Reopen task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}