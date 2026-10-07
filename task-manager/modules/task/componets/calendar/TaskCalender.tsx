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
import { cn } from "@/lib/utils";
import { useTaskEditor } from "../../hooks/useTaskEditor";
import { useCalendar } from "../../hooks/useTasks";
import {
  addMonths,
  getMonthGrid,
  groupByDateKey,
  startOfMonth,
  toDateKey,
} from "../../lib/utils";
import { TaskDialogs } from "../dialogs/TaskDialogs";
import { CalendarDay } from "./CalendarDay";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TaskCalendar() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [openKey, setOpenKey] = useState<string | null>(null);
  const editor = useTaskEditor();

  const days = getMonthGrid(month);
  const lastDay = days[days.length - 1];
  const to = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1);
  const { data, error } = useCalendar(days[0].toISOString(), to.toISOString());

  const tasksByDay = groupByDateKey(data?.tasks ?? []);
  const stepsByDay = groupByDateKey(data?.steps ?? []);
  const todayKey = toDateKey(new Date());

  const dayEditor = {
    ...editor,
    editTask: (task: Parameters<typeof editor.editTask>[0]) => {
      setOpenKey(null);
      editor.editTask(task);
    },
    editStep: (step: Parameters<typeof editor.editStep>[0]) => {
      setOpenKey(null);
      editor.editStep(step);
    },
  };

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
        {(error || editor.error) && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error ? `Couldn't load this month. ${error}` : `Couldn't save that change. ${editor.error}`}
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
              <CalendarDay
                key={key}
                day={day}
                inMonth={day.getMonth() === month.getMonth()}
                isToday={key === todayKey}
                isPast={key < todayKey}
                tasks={tasksByDay.get(key) ?? []}
                steps={stepsByDay.get(key) ?? []}
                open={openKey === key}
                onOpenChange={(open) => setOpenKey(open ? key : null)}
                editor={dayEditor}
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

      <TaskDialogs editor={editor} />
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