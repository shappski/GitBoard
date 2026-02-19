"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BoardStats } from "@/components/boards/board-stats";
import { IssueList } from "@/components/boards/issue-list";

interface MergeRequestData {
  id: string;
  title: string;
  webUrl: string;
  pipelineStatus: string | null;
  gitlabUpdatedAt: string;
  idleDays: number;
  isStale: boolean;
}

interface IssueData {
  id: string;
  title: string;
  webUrl: string;
  authorName: string | null;
  authorUsername: string | null;
  labels: string[];
  mergeRequests: MergeRequestData[];
}

interface BoardData {
  project: {
    id: string;
    name: string;
    nameWithNamespace: string | null;
    webUrl: string;
  };
  issues: IssueData[];
  stats: {
    totalIssues: number;
    issuesWithMRs: number;
    issuesWithoutMRs: number;
    issuesWithStaleMRs: number;
  };
}

export default function BoardPage() {
  const params = useParams<{ projectId: string }>();
  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/${params.projectId}/issues`);
      if (!res.ok) {
        setError(res.status === 404 ? "Project not found" : "Failed to load board");
        return;
      }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [params.projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
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

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <h3 className="text-sm font-medium text-gray-900">{error}</h3>
        <Link href="/boards" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
          Back to boards
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/boards" className="hover:text-indigo-600">Boards</Link>
          <span>/</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{data.project.name}</h1>
        {data.project.nameWithNamespace && (
          <p className="mt-1 text-sm text-gray-500">
            {data.project.nameWithNamespace}
          </p>
        )}
      </div>

      <BoardStats stats={data.stats} />
      <IssueList issues={data.issues} />
    </div>
  );
}
