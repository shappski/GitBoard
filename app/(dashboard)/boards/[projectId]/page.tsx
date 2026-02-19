"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BoardStats } from "@/components/boards/board-stats";
import { BoardColumns } from "@/components/boards/board-columns";
import { BoardFilterBar } from "@/components/boards/board-filter-bar";
import { Assignee } from "@/components/boards/board-issue-card";

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
  assignees: Assignee[];
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
  meta: {
    labels: string[];
    assignees: Assignee[];
  };
}

export default function BoardPage() {
  const params = useParams<{ projectId: string }>();
  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/${params.projectId}/issues`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Project not found");
          return;
        }
        const body = await res.json().catch(() => null);
        setError(body?.error || "Failed to load board");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [params.projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredIssues = useMemo(() => {
    if (!data) return [];
    let issues = data.issues;

    if (selectedAssignee) {
      issues = issues.filter((issue) =>
        issue.assignees.some((a) => a.username === selectedAssignee)
      );
    }

    if (selectedLabels.length > 0) {
      issues = issues.filter((issue) =>
        selectedLabels.some((l) => (issue.labels as string[]).includes(l))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      issues = issues.filter((issue) =>
        issue.title.toLowerCase().includes(q)
      );
    }

    return issues;
  }, [data, selectedAssignee, selectedLabels, searchQuery]);

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
    <div className="space-y-4">
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

      <BoardFilterBar
        assignees={data.meta.assignees}
        labels={data.meta.labels}
        selectedAssignee={selectedAssignee}
        selectedLabels={selectedLabels}
        searchQuery={searchQuery}
        onAssigneeChange={setSelectedAssignee}
        onLabelsChange={setSelectedLabels}
        onSearchChange={setSearchQuery}
      />

      <BoardColumns issues={filteredIssues} labels={data.meta.labels} />
    </div>
  );
}
