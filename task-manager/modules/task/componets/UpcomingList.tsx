"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, ChevronDown, ClipboardList } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type TaskEditor, useTaskEditor } from "../hooks/useTaskEditor";
import { useTimeline } from "../hooks/useTasks";
import { groupTasks } from "../lib/utils";
import type { TaskGroup } from "@/types/task";
import { TaskDialogs } from "./dialogs/TaskDialogs";
import { TaskRow } from "./TaskRow";

export function UpcomingList() {
  const { tasks, hasData, loading, error } = useTimeline();
  const editor = useTaskEditor();
  const groups = groupTasks(tasks);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg">Tasks</CardTitle>
        <CardDescription>By due date. Open one to see its steps.</CardDescription>
        <CardAction>
          <Link
            href="/tasks"
            aria-label="Go to the Tasks page"
            title="All tasks"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ArrowRight className="size-4" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto">
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Couldn&apos;t load tasks</AlertTitle>
            <AlertDescription>{error} Check that the API is running and try again.</AlertDescription>
          </Alert>
        )}

        {editor.error && (
          <p role="alert" className="text-sm text-destructive">
            Couldn&apos;t save that change. {editor.error}
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
          <TaskGroupSection key={group.id} group={group} editor={editor} />
        ))}
      </CardContent>

      <TaskDialogs editor={editor} />
    </Card>
  );
}

function TaskGroupSection({ group, editor }: { group: TaskGroup; editor: TaskEditor }) {
  const collapsible = group.id === "completed";
  const [expanded, setExpanded] = useState(!collapsible);
  const headingClass = cn(
    "flex items-center gap-2 text-sm font-medium",
    group.id === "overdue" ? "text-destructive" : "text-muted-foreground",
  );
  const label = (
    <>
      {group.label}
      <span className="tabular-nums opacity-70">{group.tasks.length}</span>
    </>
  );

  return (
    <section aria-labelledby={`group-${group.id}`}>
      <h3 id={`group-${group.id}`} className={cn("mb-2", !collapsible && headingClass)}>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className={cn(
              headingClass,
              "rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
            )}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform motion-reduce:transition-none",
                !expanded && "-rotate-90",
              )}
            />
            {label}
          </button>
        ) : (
          label
        )}
      </h3>

      {expanded && (
        <ul className="divide-y overflow-hidden rounded-lg border">
          {group.tasks.map((task) => (
            <TaskRow key={task.id} task={task} editor={editor} />
          ))}
        </ul>
      )}
    </section>
  );
}