"use client";

import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  ListChecks,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
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
import { useTaskStats } from "@/modules/task/hooks/useTasks";

const TONE_CLASS = {
  default: "bg-muted text-foreground",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
};

export function OverviewStatsCards() {
  const { data: stats, loading, error } = useTaskStats();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Couldn&apos;t load task stats</AlertTitle>
        <AlertDescription>{error} Check that the API is running and try again.</AlertDescription>
      </Alert>
    );
  }

  const avgSteps = stats && stats.total > 0 ? (stats.totalSteps / stats.total).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total tasks"
        value={stats?.total}
        description="Everything on your list"
        icon={ListTodo}
        loading={loading}
      />
      <StatCard
        title="Due this week"
        value={stats?.dueThisWeek}
        description="Due in the next 7 days"
        icon={CalendarClock}
        tone="info"
        loading={loading}
      />
      <StatCard
        title="Overdue"
        value={stats?.overdue}
        description={stats?.overdue ? "Past their due date" : "Nothing is overdue"}
        icon={AlertTriangle}
        tone={stats?.overdue ? "danger" : "default"}
        loading={loading}
      />
      <StatCard
        title="Total steps"
        value={stats?.totalSteps}
        description={`${avgSteps} steps per task on average`}
        icon={ListChecks}
        tone="warning"
        loading={loading}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | undefined;
  description: string;
  icon: LucideIcon;
  tone?: keyof typeof TONE_CLASS;
  loading: boolean;
}

function StatCard(props: StatCardProps) {
  const { title, value, description, icon: Icon, tone = "default", loading } = props;

  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {loading || value === undefined ? <Skeleton className="h-9 w-16" /> : value}
        </CardTitle>
        <CardAction>
          <div className={`rounded-lg p-2 ${TONE_CLASS[tone]}`}>
            <Icon className="size-5" />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {loading ? <Skeleton className="h-4 w-32" /> : description}
      </CardContent>
    </Card>
  );
}