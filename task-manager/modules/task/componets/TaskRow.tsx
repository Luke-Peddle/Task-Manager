"use client";

import { useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import { ProgressBar } from "@/components/progressBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskEditor } from "../hooks/useTaskEditor";
import {
  formatRelative,
  formatShortDate,
  getStepProgress,
  getTaskStatus,
  getTaskSummary,
} from "../lib/utils";
import type { Task } from "@/types/task";
import { StepCheckbox } from "./StepCheckbox";

export function TaskRow({ task, editor }: { task: Task; editor: TaskEditor }) {
  const [open, setOpen] = useState(false);
  const { completion, stepToggle } = editor;
  const checked = completion.isChecked(task);
  const overdue = !checked && getTaskStatus(task.dueDate) === "overdue";
  const progress = getStepProgress(task.steps, stepToggle.isChecked);

  return (
    <li className="bg-card">
      <div className="flex items-start gap-3 px-4 py-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => completion.toggle(task, value === true)}
          aria-label={checked ? `Mark ${task.name} as not done` : `Complete ${task.name}`}
          className="mt-0.5"
        />

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={`task-${task.id}-steps`}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div className="min-w-0 flex-1">
            <p className={cn("font-medium", checked && "text-muted-foreground line-through")}>
              {task.name}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {getTaskSummary(checked, progress)}
            </p>
            {progress.total > 0 && !checked && (
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar
                  value={progress.done}
                  max={progress.total}
                  label={`${task.name} steps done`}
                  className="w-20"
                />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {progress.done}/{progress.total}
                </span>
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className="shrink-0 text-right tabular-nums">
              <p className={cn("text-sm", overdue && "font-medium text-destructive")}>
                {formatShortDate(task.dueDate)}
              </p>
              {!checked && (
                <p className={cn("text-xs", overdue ? "text-destructive" : "text-muted-foreground")}>
                  {formatRelative(task.dueDate)}
                </p>
              )}
            </div>
          )}

          <ChevronDown
            className={cn(
              "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-mt-1 -mr-2 size-8 shrink-0 text-muted-foreground"
          aria-label={`Edit ${task.name}`}
          title="Edit task"
          onClick={() => editor.editTask(task)}
        >
          <Pencil />
        </Button>
      </div>

      {open && (
        <div id={`task-${task.id}-steps`} className="border-t bg-muted/30 py-2 pr-4 pl-9">
          {task.description && (
            <p className="mb-2 px-2 text-sm whitespace-pre-line text-muted-foreground">
              {task.description}
            </p>
          )}
          {task.steps.length === 0 ? (
            <p className="px-2 py-1 text-sm text-muted-foreground">This task has no steps.</p>
          ) : (
            <ul className="space-y-0.5">
              {task.steps.map((step) => (
                <li key={step.id}>
                  <StepCheckbox
                    step={step}
                    checked={stepToggle.isChecked(step)}
                    onCheckedChange={(value) => stepToggle.toggleStep(step.id, value)}
                    onEdit={() => editor.editStep(step)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}