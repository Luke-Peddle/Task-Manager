"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatShortDate } from "@/lib/dates";
import type { Step } from "@/types/task";

interface StepCheckboxProps {
  step: Step;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onEdit?: () => void;
  taskName?: string;
}

export function StepCheckbox({ step, checked, onCheckedChange, onEdit, taskName }: StepCheckboxProps) {
  const overdue = !checked && step.dueDate !== null && new Date(step.dueDate).getTime() < Date.now();

  return (
    <div className="group flex items-start rounded-md transition-colors hover:bg-muted/60">
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 px-2 py-1.5">
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
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-0.5 size-7 shrink-0 text-muted-foreground focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          aria-label={`Edit ${step.name}`}
          onClick={onEdit}
        >
          <Pencil />
        </Button>
      )}
    </div>
  );
}