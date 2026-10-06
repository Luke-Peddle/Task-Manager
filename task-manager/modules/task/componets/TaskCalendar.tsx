"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  type StepToggle,
  type TaskCompletion,
  useCalendar,
  useTaskCompletion,
  useUpdateStep,
} from "../hooks/useTasks";
import {
  addMonths,
  getMonthGrid,
  groupByDateKey,
  startOfMonth,
  toDateKey,
} from "../lib/utils";
import type { CalendarStep, CalendarTask } from "@/types/task";
import { CompleteTaskDialog } from "./CompleteTaskDialog";
import { StepCheckbox } from "./StepCheckbox";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_TASKS = 2;

export function TaskCalendar() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [openKey, setOpenKey] = useState<string | null>(null);
  const stepToggle = useUpdateStep();
  const completion = useTaskCompletion();

  const days = getMonthGrid(month);
  const lastDay = days[days.length - 1];
  const from = days[0];
  const to = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1);
  const { data, error } = useCalendar(from.toISOString(), to.toISOString());

  const tasksByDay = groupByDateKey(data?.tasks ?? []);
  const stepsByDay = groupByDateKey(data?.steps ?? []);
  const todayKey = toDateKey(new Date());
  const updateError = completion.error ?? stepToggle.error;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">
          {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </CardTitle>
        <CardAction className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Previous month"
            onClick={() => setMonth(addMonths(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Next month"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <ChevronRight />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {(error || updateError) && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error ? `Couldn't load this month. ${error}` : `Couldn't save that change. ${updateError}`}
          </p>
        )}

        <div className="grid grid-cols-7 pb-2 text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 overflow-hidden rounded-lg border [&>*:nth-child(7n)]:border-r-0 [&>*:nth-last-child(-n+7)]:border-b-0">
          {days.map((day) => {
            const key = toDateKey(day);
            return (
              <DayCell
                key={key}
                day={day}
                inMonth={day.getMonth() === month.getMonth()}
                isToday={key === todayKey}
                isPast={key < todayKey}
                tasks={tasksByDay.get(key) ?? []}
                steps={stepsByDay.get(key) ?? []}
                open={openKey === key}
                onOpenChange={(open) => setOpenKey(open ? key : null)}
                stepToggle={stepToggle}
                completion={completion}
              />
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Legend className="bg-sky-500/15 ring-1 ring-sky-500/40" label="Task due" />
          <Legend className="bg-destructive/15 ring-1 ring-destructive/40" label="Overdue" />
          <Legend className="bg-muted ring-1 ring-border" label="Completed" />
        </div>
      </CardContent>

      <CompleteTaskDialog
        key={completion.confirming?.id ?? "none"}
        task={completion.confirming}
        onConfirm={completion.confirm}
        onCancel={completion.cancel}
      />
    </Card>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-3 rounded-sm", className)} />
      {label}
    </span>
  );
}

interface DayCellProps {
  day: Date;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  tasks: CalendarTask[];
  steps: CalendarStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepToggle: StepToggle;
  completion: TaskCompletion;
}

function DayCell(props: DayCellProps) {
  const { day, inMonth, isToday, isPast, tasks, steps, open, onOpenChange, stepToggle, completion } =
    props;
  const visibleTasks = tasks.slice(0, MAX_VISIBLE_TASKS);
  const hiddenCount = tasks.length - visibleTasks.length;
  const itemCount = tasks.length + steps.length;

  function chipClass(task: CalendarTask) {
    if (completion.isChecked(task)) return "bg-muted text-muted-foreground line-through";
    if (isPast) return "bg-destructive/10 text-destructive";
    return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
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
              className={cn("truncate rounded px-1.5 py-0.5 text-xs font-medium", chipClass(task))}
            >
              {task.name}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="px-1.5 text-xs text-muted-foreground">+{hiddenCount} more</span>
          )}
          {steps.length > 0 && (
            <span className="px-1.5 text-xs text-muted-foreground">
              {steps.length} {steps.length === 1 ? "step" : "steps"}
            </span>
          )}
        </span>

        {itemCount > 0 && (
          <span className="flex justify-center gap-0.5 md:hidden" aria-hidden="true">
            {tasks.length > 0 && (
              <span
                className={cn("size-1.5 rounded-full", isPast ? "bg-destructive" : "bg-sky-500")}
              />
            )}
            {steps.length > 0 && <span className="size-1.5 rounded-full bg-muted-foreground/50" />}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <DayDetails
          day={day}
          tasks={tasks}
          steps={steps}
          stepToggle={stepToggle}
          completion={completion}
        />
      </PopoverContent>
    </Popover>
  );
}

interface DayDetailsProps {
  day: Date;
  tasks: CalendarTask[];
  steps: CalendarStep[];
  stepToggle: StepToggle;
  completion: TaskCompletion;
}

function DayDetails({ day, tasks, steps, stepToggle, completion }: DayDetailsProps) {
  const isEmpty = tasks.length === 0 && steps.length === 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold">
          {day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        {isEmpty && <p className="text-sm text-muted-foreground">Nothing due this day.</p>}
      </div>

      {tasks.length > 0 && (
        <section aria-label="Tasks due">
          <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Tasks</h3>
          <ul className="space-y-0.5">
            {tasks.map((task) => {
              const checked = completion.isChecked(task);
              const done = task.steps.filter((step) => step.completed).length;
              return (
                <li key={task.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => completion.toggle(task, value === true)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span
                        className={cn("font-medium", checked && "text-muted-foreground line-through")}
                      >
                        {task.name}
                      </span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {task.steps.length === 0
                          ? "No steps"
                          : `${done} of ${task.steps.length} steps done`}
                      </span>
                    </span>
                  </label>
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
                  onCheckedChange={(value) => stepToggle.toggleStep(step.id, value)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}