"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ListChecks,
  MoreHorizontal,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTasks } from "../../hooks/useTasks";
import {
  TASK_STATUS_LABEL,
  formatDate,
  formatRelative,
  getPageItems,
  getRangeLabel,
  getTaskStatus,
} from "../../lib/utils";
import type { Task, TaskStatus } from "@/types/task";

const PAGE_SIZE = 10;

const STATUS_CLASS: Record<TaskStatus, string> = {
  overdue: "",
  "due-soon": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "on-track": "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "no-date": "text-muted-foreground",
};

export function TasksCard() {
  const [page, setPage] = useState(1);
  const { tasks, total, totalPages, hasData, loading, error } = useTasks(page, PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All tasks</CardTitle>
        <CardDescription>Every task with its steps, due date, and status.</CardDescription>
        {hasData && (
          <CardAction>
            <Badge variant="secondary" className="tabular-nums">
              {total} total
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Couldn&apos;t load tasks</AlertTitle>
            <AlertDescription>{error} Check that the API is running and try again.</AlertDescription>
          </Alert>
        )}

        {!hasData && loading && <TasksTableSkeleton />}

        {hasData && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-14 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <ClipboardList className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first task and it will show up here, along with its steps and due date.
            </p>
          </div>
        )}

        {hasData && tasks.length > 0 && (
          <>
            <div
              aria-busy={loading}
              className={`transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}
            >
              <TasksTable tasks={tasks} />
            </div>

            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-muted-foreground tabular-nums">
                {getRangeLabel(page, PAGE_SIZE, total)}
              </p>

              <nav aria-label="Task pages" className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft />
                  Previous
                </Button>

                <div className="hidden items-center gap-1 sm:flex">
                  {getPageItems(page, totalPages).map((item, i) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${i}`} className="flex size-8 items-center justify-center">
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                      </span>
                    ) : (
                      <Button
                        key={item}
                        variant={item === page ? "default" : "ghost"}
                        size="sm"
                        className="w-8 tabular-nums"
                        aria-current={item === page ? "page" : undefined}
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </Button>
                    ),
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </nav>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TasksTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="min-w-56">Task</TableHead>
            <TableHead className="w-24">Steps</TableHead>
            <TableHead className="w-40">Due date</TableHead>
            <TableHead className="w-28">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const status = getTaskStatus(task.dueDate);
            return (
              <TableRow key={task.id}>
                <TableCell className="max-w-md whitespace-normal">
                  <p className="font-medium">{task.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {task.description || "No description"}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1 tabular-nums">
                    <ListChecks />
                    {task.steps?.length ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums">
                  {task.dueDate ? (
                    <>
                      <p>{formatDate(task.dueDate)}</p>
                      <p
                        className={`text-xs ${
                          status === "overdue" ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {formatRelative(task.dueDate)}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={status === "overdue" ? "destructive" : "outline"}
                    className={STATUS_CLASS[status]}
                  >
                    {TASK_STATUS_LABEL[status]}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function TasksTableSkeleton() {
  return (
    <div className="rounded-md border" aria-busy="true" aria-label="Loading tasks">
      <div className="border-b bg-muted/50 px-4 py-3">
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}