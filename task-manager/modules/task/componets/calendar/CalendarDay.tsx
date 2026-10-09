"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TaskEditor } from "../../hooks/useTaskEditor";
import { getStepProgress } from "./../../lib/tasks"; 
import type { CalendarStep, CalendarTask } from "@/types/task";
import { StepCheckbox } from "../StepCheckbox";

const MAX_VISIBLE_TASKS = 2;
const MAX_VISIBLE_ITEMS = 3;

const CHIP_CLASS = {
  done: "bg-muted text-muted-foreground line-through",
  overdue: "bg-destructive/10 text-destructive",
  task: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  step: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

interface CalendarDayProps {
  day: Date;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  tasks: CalendarTask[];
  steps: CalendarStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: TaskEditor;
  showStepNames?: boolean;
}

export function CalendarDay(props: CalendarDayProps) {
  const { day, inMonth, isToday, isPast, tasks, steps, open, onOpenChange, editor, showStepNames } =
    props;
  const visibleTasks = tasks.slice(0, showStepNames ? MAX_VISIBLE_ITEMS : MAX_VISIBLE_TASKS);
  const visibleSteps = showStepNames
    ? steps.slice(0, Math.max(0, MAX_VISIBLE_ITEMS - visibleTasks.length))
    : [];
  const hiddenCount =
    tasks.length - visibleTasks.length + (showStepNames ? steps.length - visibleSteps.length : 0);
  const itemCount = tasks.length + steps.length;

  function chipClass(kind: "task" | "step", done: boolean) {
    if (done) return CHIP_CLASS.done;
    if (isPast) return CHIP_CLASS.overdue;
    return CHIP_CLASS[kind];
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-label={`${day.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}, ${itemCount === 0 ? "nothing due" : `${itemCount} due`}`}
        className={cn(
          "flex min-h-16 flex-col items-stretch gap-1 border-r border-b p-1.5 text-left transition-colors hover:bg-muted/50 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:min-h-28",
          !inMonth && "bg-muted/30 text-muted-foreground",
          open && "bg-muted/60",
        )}
      >
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full text-sm tabular-nums",
            isToday && "bg-primary font-semibold text-primary-foreground",
          )}
        >
          {day.getDate()}
        </span>

        <span className="hidden min-w-0 flex-col gap-1 md:flex">
          {visibleTasks.map((task) => (
            <span
              key={task.id}
              className={cn("truncate rounded px-1.5 py-0.5 text-xs font-medium", chipClass("task", editor.completion.isChecked(task)))}
            >
              {task.name}
            </span>
          ))}
          {visibleSteps.map((step) => (
            <span
              key={step.id}
              className={cn("truncate rounded px-1.5 py-0.5 text-xs font-medium", chipClass("step", editor.stepToggle.isChecked(step)))}
            >
              {step.name}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="px-1.5 text-xs text-muted-foreground">+{hiddenCount} more</span>
          )}
          {!showStepNames && steps.length > 0 && (
            <span className="px-1.5 text-xs text-muted-foreground">
              {steps.length} {steps.length === 1 ? "step" : "steps"}
            </span>
          )}
        </span>

        {itemCount > 0 && (
          <span className="flex justify-center gap-0.5 md:hidden" aria-hidden="true">
            {tasks.length > 0 && (
              <span className={cn("size-1.5 rounded-full", isPast ? "bg-destructive" : "bg-sky-500")} />
            )}
            {steps.length > 0 && <span className="size-1.5 rounded-full bg-muted-foreground/50" />}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <DayDetails day={day} tasks={tasks} steps={steps} editor={editor} />
      </PopoverContent>
    </Popover>
  );
}

interface DayDetailsProps {
  day: Date;
  tasks: CalendarTask[];
  steps: CalendarStep[];
  editor: TaskEditor;
}

function DayDetails({ day, tasks, steps, editor }: DayDetailsProps) {
  const { completion, stepToggle } = editor;

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold">
          {day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        {tasks.length === 0 && steps.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing due this day.</p>
        )}
      </div>

      {tasks.length > 0 && (
        <section aria-label="Tasks due">
          <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Tasks</h3>
          <ul className="space-y-0.5">
            {tasks.map((task) => {
              const checked = completion.isChecked(task);
              const progress = getStepProgress(task.steps);
              return (
                <li
                  key={task.id}
                  className="group flex items-start rounded-md transition-colors hover:bg-muted/60"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 px-2 py-1.5">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => completion.toggle(task, value === true)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className={cn("font-medium", checked && "text-muted-foreground line-through")}>
                        {task.name}
                      </span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {progress.total === 0
                          ? "No steps"
                          : `${progress.done} of ${progress.total} steps done`}
                      </span>
                    </span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 size-7 shrink-0 text-muted-foreground focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    aria-label={`Edit ${task.name}`}
                    onClick={() => editor.editTask(task)}
                  >
                    <Pencil />
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {steps.length > 0 && (
        <section aria-label="Steps due">
          <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Steps</h3>
          <ul className="space-y-0.5">
            {steps.map((step) => (
              <li key={step.id}>
                <StepCheckbox
                  step={step}
                  taskName={step.task.name}
                  checked={stepToggle.isChecked(step)}
                  onCheckedChange={(value) => stepToggle.toggleStep(step, value, step.task)}
                  onEdit={() => editor.editStep(step, step.task)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}