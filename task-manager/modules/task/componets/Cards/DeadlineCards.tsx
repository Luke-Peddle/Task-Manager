"use client";

import { AlertCircle, AlertTriangle, CalendarClock, ListChecks } from "lucide-react";
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
import { useDeadlineTasks } from "../../hooks/useTasks";
import { formatDate, formatRelative } from "@/modules/task/lib/utils";

type Variant = "upcoming" | "overdue";

const CONFIG = {
  upcoming: {
    title: "Upcoming deadlines",
    description: "The next tasks coming due.",
    empty: "Nothing coming up. Tasks with a future due date will appear here.",
    icon: CalendarClock,
    iconClass: "text-sky-600 dark:text-sky-400",
    accentClass: "border-sky-500",
    relativeClass: "text-muted-foreground",
  },
  overdue: {
    title: "Overdue",
    description: "Past their due date, oldest first.",
    empty: "You're all caught up. Nothing is overdue.",
    icon: AlertTriangle,
    iconClass: "text-destructive",
    accentClass: "border-destructive",
    relativeClass: "text-destructive",
  },
} as const;

export function DeadlineCard({ variant }: { variant: Variant }) {
  const config = CONFIG[variant];
  const Icon = config.icon;
  const { data: tasks, loading, error } = useDeadlineTasks(variant, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
        <CardAction>
          <Icon className={`size-5 ${config.iconClass}`} />
        </CardAction>
      </CardHeader>

      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Couldn&apos;t load {config.title.toLowerCase()}</AlertTitle>
            <AlertDescription>{error} Check that the API is running and try again.</AlertDescription>
          </Alert>
        ) : loading && !tasks ? (
          <div className="space-y-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{config.empty}</p>
        ) : (
          <ul className="divide-y">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className={`min-w-0 border-l-2 pl-3 ${config.accentClass}`}>
                  <p className="truncate font-medium">{task.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <ListChecks className="size-3.5" />
                    {task.steps?.length ?? 0} steps
                  </p>
                </div>
                {task.dueDate && (
                  <div className="shrink-0 text-right tabular-nums">
                    <p className="text-sm">{formatDate(task.dueDate)}</p>
                    <p className={`text-xs ${config.relativeClass}`}>
                      {formatRelative(task.dueDate)}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}