import { AddTask } from "@/modules/task/componets/AddTask";
import { TaskCalendar } from "@/modules/task/componets/TaskCalendar";
import { UpcomingList } from "@/modules/task/componets/UpcomingList";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-360 space-y-6 px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            What&apos;s due, what&apos;s next, and what you&apos;ve finished.
          </p>
        </div>
        <AddTask />
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <TaskCalendar />
        <aside className="xl:sticky xl:top-6">
          <UpcomingList />
        </aside>
      </div>
    </div>
  );
}