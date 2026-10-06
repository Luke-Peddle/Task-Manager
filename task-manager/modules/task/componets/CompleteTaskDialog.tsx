"use client";

import { useState } from "react";
import { Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CompletableTask } from "@/types/task";

interface CompleteTaskDialogProps {
  task: CompletableTask | null;
  onConfirm: (completeSteps: boolean) => void;
  onCancel: () => void;
}

export function CompleteTaskDialog({ task, onConfirm, onCancel }: CompleteTaskDialogProps) {
  const [completeSteps, setCompleteSteps] = useState(true);
  const remaining = task?.steps.filter((step) => !step.completed) ?? [];

  return (
    <Dialog
      open={task !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete &ldquo;{task?.name}&rdquo;?</DialogTitle>
          <DialogDescription>
            {remaining.length === 1
              ? "This step isn't done yet:"
              : `These ${remaining.length} steps aren't done yet:`}
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-sm">
          {remaining.map((step) => (
            <li key={step.id} className="flex items-center gap-2">
              <Circle className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {step.name}
            </li>
          ))}
        </ul>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={completeSteps}
            onCheckedChange={(value) => setCompleteSteps(value === true)}
          />
          Mark {remaining.length === 1 ? "this step" : "these steps"} as done too
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Keep working
          </Button>
          <Button onClick={() => onConfirm(completeSteps)}>Complete task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}