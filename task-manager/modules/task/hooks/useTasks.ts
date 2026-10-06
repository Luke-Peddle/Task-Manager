import { type DependencyList, useEffect, useState } from "react";
import type { PaginatedResponse, Task, TaskStats } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`The server responded with ${res.status}.`);
  return res.json();
}

function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fn()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}

export function useTasks(page: number, limit: number) {
  const { data, loading, error } = useAsync(
    () => apiGet<PaginatedResponse<Task>>(`/tasks?page=${page}&limit=${limit}`),
    [page, limit],
  );
  const total = data?.total ?? 0;

  return {
    tasks: data?.data ?? [],
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasData: data !== null,
    loading,
    error,
  };
}

export function useTaskStats() {
  return useAsync(() => apiGet<TaskStats>("/tasks/stats"), []);
}

export function useDeadlineTasks(kind: "upcoming" | "overdue", limit = 5) {
  return useAsync(() => apiGet<Task[]>(`/tasks/${kind}?limit=${limit}`), [kind, limit]);
}