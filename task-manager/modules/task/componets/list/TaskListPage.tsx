"use client";

import { useState } from "react";
import { AlertCircle, ClipboardList, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTaskEditor } from "../../hooks/useTaskEditor";
import { useTimeline } from "../../hooks/useTasks";
import { groupTasks } from "../../lib/utils";
import type { Task } from "@/types/task";
import { AddTask } from "../AddTask";
import { TaskDialogs } from "../dialogs/TaskDialogs";
import { TaskRow } from "./TaskRow";

type Filter = "active" | "completed" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
];

function matches(task: Task, filter: Filter, search: string) {
  const matchesFilter = filter === "all" || (filter === "completed") === task.completed;
  const matchesSearch =
    !search ||
    task.name.toLowerCase().includes(search) ||
    (task.description ?? "").toLowerCase().includes(search) ||
    task.steps.some((step) => step.name.toLowerCase().includes(search));
  return matchesFilter && matchesSearch;
}

export function TaskListPage() {
  const { tasks, hasData, loading, error } = useTimeline();
  const editor = useTaskEditor();
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();
  const counts = {
    active: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
    all: tasks.length,
  };
  const groups = groupTasks(tasks.filter((task) => matches(task, filter, search)));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-muted-foreground">
            {hasData
              ? `${counts.active} active, ${counts.completed} completed`
              : "Everything on your list."}
          </p>
        </div>
        <AddTask />
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Show tasks"
          className="inline-flex w-fit rounded-lg border bg-card p-1"
        >
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                filter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
              <span className="ml-1.5 tabular-nums opacity-70">{counts[option.value]}</span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks and steps"
            aria-label="Search tasks and steps"
            className="bg-card pl-9"
          />
        </div>
      </div>

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
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {hasData && groups.length === 0 && (
        <EmptyState search={query.trim()} filter={filter} hasAnyTasks={tasks.length > 0} />
      )}

      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`list-group-${group.id}`}>
          <h2
            id={`list-group-${group.id}`}
            className={cn(
              "mb-2 flex items-center gap-2 text-sm font-medium",
              group.id === "overdue" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {group.label}
            <span className="tabular-nums opacity-70">{group.tasks.length}</span>
          </h2>
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {group.tasks.map((task) => (
                <TaskRow key={task.id} task={task} editor={editor} />
              ))}
            </ul>
          </Card>
        </section>
      ))}

      <TaskDialogs editor={editor} />
    </div>
  );
}

function EmptyState({
  search,
  filter,
  hasAnyTasks,
}: {
  search: string;
  filter: Filter;
  hasAnyTasks: boolean;
}) {
  const [title, body] = search
    ? [`No tasks match “${search}”`, "Try a different word, or clear the search."]
    : !hasAnyTasks
      ? ["No tasks yet", "Use Add task to create your first one."]
      : filter === "completed"
        ? ["Nothing completed yet", "Finished tasks will show up here."]
        : ["No active tasks", "Everything's done. Nice work."];

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-14 text-center">
      <ClipboardList className="mb-3 size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}