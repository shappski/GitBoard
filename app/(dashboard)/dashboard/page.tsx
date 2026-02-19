"use client";

import { useEffect, useState, useCallback } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { MRTable } from "@/components/dashboard/mr-table";
import { SyncStatus } from "@/components/dashboard/sync-status";

interface DashboardData {
  mergeRequests: Array<{
    id: string;
    title: string;
    webUrl: string;
    authorName: string | null;
    authorUsername: string | null;
    authorAvatarUrl: string | null;
    draft: boolean;
    sourceBranch: string | null;
    targetBranch: string | null;
    gitlabUpdatedAt: string;
    pipelineStatus: string | null;
    labels: string[];
    reviewers: { name: string; username: string; avatar_url: string }[];
    idleDays: number;
    isStale: boolean;
    project: {
      name: string;
      nameWithNamespace: string | null;
      webUrl: string;
    };
  }>;
  stats: {
    total: number;
    stale: number;
    active: number;
    draft: number;
  };
}

interface SyncLog {
  id: string;
  status: string;
  mrsFetched: number;
  duration: number;
  createdAt: string;
  error?: string | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [mrRes, syncRes] = await Promise.all([
        fetch("/api/dashboard/merge-requests"),
        fetch("/api/sync/status"),
      ]);
      if (mrRes.ok) setData(await mrRes.json());
      if (syncRes.ok) setSyncLogs(await syncRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSync() {
    await fetch("/api/sync", { method: "POST" });
    await fetchData();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor stalled merge requests across your projects
          </p>
        </div>
        <SyncStatus logs={syncLogs} onSync={handleSync} />
      </div>

      {data && (
        <>
          <StatsCards stats={data.stats} />
          <MRTable mergeRequests={data.mergeRequests} />
        </>
      )}
    </div>
  );
}
