"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CircleCheck,
  Pencil,
  RotateCcw,
  SearchX,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/progressBar";
import { cn } from "@/lib/utils";
import { useTaskEditor } from "../../hooks/useTaskEditor";
import { useTask } from "../../hooks/useTasks";
import { formatDate, formatRelative, getStepProgress, getTaskStatus } from "../../lib/utils";
import { TaskDialogs } from "../dialogs/TaskDialogs";
import { StepCheckbox } from "../StepCheckbox";
import { TaskCalendar } from "../calendar/TaskCalender";

const STATUS_TEXT = {
  overdue: "Overdue",
  "due-soon": "Due soon",
  "on-track": "On track",
  "no-date": "No due date",
} as const;

export function TaskDetail({ taskId }: { taskId: number }) {
  const { task, loading, notFound, error } = useTask(taskId);
  const editor = useTaskEditor();
  const { completion, stepToggle } = editor;

  const backLink = (
    <Link
      href="/tasks"
      className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ArrowLeft className="size-4" />
      All tasks
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading task">
        {backLink}
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        {backLink}
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
          <SearchX className="mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">This task doesn&apos;t exist</p>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been deleted, or the link is wrong.
          </p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        {backLink}
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn&apos;t load this task</AlertTitle>
          <AlertDescription>
            {error ?? "Something went wrong."} Check that the API is running and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const checked = completion.isChecked(task);
  const status = getTaskStatus(task.dueDate);
  const overdue = !checked && status === "overdue";
  const progress = getStepProgress(task.steps, stepToggle.isChecked);
  const openEditTask = () => editor.editTask(task);

  return (
    <div className="space-y-6">
      {backLink}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {checked && (
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Check className="size-3.5" />
              Completed
            </span>
          )}
          <h1
            className={cn(
              "text-3xl font-semibold tracking-tight text-balance",
              checked && "text-muted-foreground",
            )}
          >
            {task.name}
          </h1>
          {task.description && (
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{task.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={openEditTask}>
            <Pencil />
            Edit
          </Button>
          {checked ? (
            <Button variant="outline" onClick={() => completion.toggle(task, false)}>
              <RotateCcw />
              Reopen
            </Button>
          ) : (
            <Button onClick={() => completion.toggle(task, true)}>
              <CircleCheck />
              Complete task
            </Button>
          )}
        </div>
      </header>

      {editor.error && (
        <p role="alert" className="text-sm text-destructive">
          Couldn&apos;t save that change. {editor.error}
        </p>
      )}

      <dl className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
        <div className="bg-card p-4">
          <dt className="text-sm text-muted-foreground">Due</dt>
          <dd
            className={cn("mt-1 text-lg font-semibold tabular-nums", overdue && "text-destructive")}
          >
            {task.dueDate ? formatDate(task.dueDate) : "No date"}
          </dd>
          <dd className={cn("text-sm", overdue ? "text-destructive" : "text-muted-foreground")}>
            {checked
              ? "Completed"
              : task.dueDate
                ? `${STATUS_TEXT[status]}, ${formatRelative(task.dueDate)}`
                : "Add a date by editing the task"}
          </dd>
        </div>

        <div className="bg-card p-4">
          <dt className="text-sm text-muted-foreground">Progress</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">
            {progress.total === 0 ? "No steps" : `${progress.done} of ${progress.total} steps`}
          </dd>
          {progress.total > 0 && (
            <dd className="mt-2">
              <ProgressBar value={progress.done} max={progress.total} label="Steps done" />
            </dd>
          )}
        </div>
      </dl>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steps</CardTitle>
          <CardDescription>
            {progress.total === 0
              ? "Break this task into smaller pieces by editing it."
              : progress.nextStep
                ? `Next up: ${progress.nextStep.name}`
                : "Every step is done."}
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" onClick={openEditTask}>
              Add or remove steps
            </Button>
          </CardAction>
        </CardHeader>
        {task.steps.length > 0 && (
          <CardContent>
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
          </CardContent>
        )}
      </Card>

      <TaskCalendar taskId={task.id} />

      <TaskDialogs editor={editor} />
    </div>
  );
}