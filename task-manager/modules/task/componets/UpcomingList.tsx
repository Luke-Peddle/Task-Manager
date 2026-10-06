"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ClipboardList } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type StepToggle,
  type TaskCompletion,
  useTaskCompletion,
  useTimeline,
  useUpdateStep,
} from "../hooks/useTasks";
import { formatRelative, formatShortDate, getTaskStatus, groupTasks } from "../lib/utils";
import type { Task, TaskGroup } from "@/types/task";
import { CompleteTaskDialog } from "./CompleteTaskDialog";
import { StepCheckbox } from "./StepCheckbox";

export function UpcomingList() {
  const { tasks, hasData, loading, error } = useTimeline();
  const stepToggle = useUpdateStep();
  const completion = useTaskCompletion();
  const groups = groupTasks(tasks);
  const updateError = completion.error ?? stepToggle.error;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg">Tasks</CardTitle>
        <CardDescription>By due date. Open one to see its steps.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto">
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Couldn&apos;t load tasks</AlertTitle>
            <AlertDescription>{error} Check that the API is running and try again.</AlertDescription>
          </Alert>
        )}

        {updateError && (
          <p role="alert" className="text-sm text-destructive">
            Couldn&apos;t save that change. {updateError}
          </p>
        )}

        {loading && (
          <div className="space-y-2" aria-busy="true" aria-label="Loading tasks">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {hasData && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
            <ClipboardList className="mb-3 size-8 text-muted-foreground" />
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Use Add task to create one.</p>
          </div>
        )}

        {groups.map((group) => (
          <TaskGroupSection
            key={group.id}
            group={group}
            stepToggle={stepToggle}
            completion={completion}
          />
        ))}
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

interface TaskGroupSectionProps {
  group: TaskGroup;
  stepToggle: StepToggle;
  completion: TaskCompletion;
}

function TaskGroupSection({ group, stepToggle, completion }: TaskGroupSectionProps) {
  const collapsible = group.id === "completed";
  const [expanded, setExpanded] = useState(!collapsible);
  const headingClass = `flex items-center gap-2 text-sm font-medium ${
    group.id === "overdue" ? "text-destructive" : "text-muted-foreground"
  }`;

  return (
    <section aria-labelledby={`group-${group.id}`}>
      {collapsible ? (
        <h3 id={`group-${group.id}`} className="mb-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className={`${headingClass} rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring`}
          >
            <ChevronDown
              className={`size-4 transition-transform motion-reduce:transition-none ${
                expanded ? "" : "-rotate-90"
              }`}
            />
            {group.label}
            <span className="tabular-nums opacity-70">{group.tasks.length}</span>
          </button>
        </h3>
      ) : (
        <h3 id={`group-${group.id}`} className={`mb-2 ${headingClass}`}>
          {group.label}
          <span className="tabular-nums opacity-70">{group.tasks.length}</span>
        </h3>
      )}

      {expanded && (
        <ul className="divide-y overflow-hidden rounded-lg border">
          {group.tasks.map((task) => (
            <TaskRow key={task.id} task={task} stepToggle={stepToggle} completion={completion} />
          ))}
        </ul>
      )}
    </section>
  );
}

interface TaskRowProps {
  task: Task;
  stepToggle: StepToggle;
  completion: TaskCompletion;
}

function TaskRow({ task, stepToggle, completion }: TaskRowProps) {
  const [open, setOpen] = useState(false);
  const checked = completion.isChecked(task);
  const overdue = !checked && getTaskStatus(task.dueDate) === "overdue";
  const total = task.steps.length;
  const done = task.steps.filter((step) => stepToggle.isChecked(step)).length;
  const nextStep = task.steps.find((step) => !stepToggle.isChecked(step));

  const summary = checked
    ? "Completed"
    : total === 0
      ? "No steps"
      : nextStep
        ? `Next: ${nextStep.name}`
        : "All steps done";

  return (
    <li className="bg-card">
      <div className="flex items-start gap-3 px-3 py-3">
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
          className="flex min-w-0 flex-1 items-start gap-2 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div className="min-w-0 flex-1">
            <p className={`font-medium ${checked ? "text-muted-foreground line-through" : ""}`}>
              {task.name}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{summary}</p>
            {total > 0 && !checked && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
                    style={{ width: `${(done / total) * 100}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {done}/{total}
                </span>
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className="shrink-0 text-right tabular-nums">
              <p className={`text-sm ${overdue ? "font-medium text-destructive" : ""}`}>
                {formatShortDate(task.dueDate)}
              </p>
              {!checked && (
                <p className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                  {formatRelative(task.dueDate)}
                </p>
              )}
            </div>
          )}

          <ChevronDown
            className={`mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div id={`task-${task.id}-steps`} className="border-t bg-muted/30 py-2 pr-3 pl-8">
          {task.description && (
            <p className="mb-2 px-2 text-sm text-muted-foreground">{task.description}</p>
          )}
          {total === 0 ? (
            <p className="px-2 py-1 text-sm text-muted-foreground">This task has no steps.</p>
          ) : (
            <ul className="space-y-0.5">
              {task.steps.map((step) => (
                <li key={step.id}>
                  <StepCheckbox
                    step={step}
                    checked={stepToggle.isChecked(step)}
                    onCheckedChange={(value) => stepToggle.toggleStep(step.id, value)}
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