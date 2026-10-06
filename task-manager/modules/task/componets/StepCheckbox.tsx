"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { formatShortDate } from "../lib/utils";
import type { Step } from "@/types/task";

interface StepCheckboxProps {
  step: Step;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  taskName?: string;
}

export function StepCheckbox({ step, checked, onCheckedChange, taskName }: StepCheckboxProps) {
  const overdue = !checked && step.dueDate !== null && new Date(step.dueDate).getTime() < Date.now();

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <span className="min-w-0 flex-1 text-sm">
        <span className={checked ? "text-muted-foreground line-through" : ""}>{step.name}</span>
        {taskName && <span className="block text-xs text-muted-foreground">{taskName}</span>}
        {step.description && !taskName && (
          <span className="block text-xs text-muted-foreground">{step.description}</span>
        )}
      </span>
      {step.dueDate && (
        <span
          className={`shrink-0 text-xs tabular-nums ${overdue ? "text-destructive" : "text-muted-foreground"}`}
        >
          {formatShortDate(step.dueDate)}
        </span>
      )}
    </label>
  );
}