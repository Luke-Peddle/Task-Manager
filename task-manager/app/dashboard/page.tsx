import { OverviewStatsCards } from "@/modules/task/componets/Cards/OverviewCard";
import { DeadlineCard } from "@/modules/task/componets/Cards/DeadlineCards";
import { AddTask } from "@/modules/task/componets/AddTask"
import {TasksCard} from "@/modules/task/componets/Cards/TasksCard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
      <header className="space-y-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            What&apos;s due, what&apos;s late, and everything else on your list.
          </p>
        </div>
        <AddTask />
      </header>

      <OverviewStatsCards />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TasksCard />
        </div>

        <div className="space-y-5">
          <DeadlineCard variant="upcoming" />
          <DeadlineCard variant="overdue" />
        </div>
      </div>
    </div>
  );
}