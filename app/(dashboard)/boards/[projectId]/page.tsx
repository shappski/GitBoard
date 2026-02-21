"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  state: string;
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
    boardLists: { label: string; color: string; position: number }[];
  };
}

interface SwitcherProject {
  id: string;
  name: string;
  nameWithNamespace: string | null;
}

export default function BoardPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switcherProjects, setSwitcherProjects] = useState<SwitcherProject[] | null>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  const assigneeKey = `board-assignee:${params.projectId}`;
  const [selectedAssignee, setSelectedAssigneeRaw] = useState("");
  useEffect(() => {
    const stored = localStorage.getItem(assigneeKey);
    if (stored) setSelectedAssigneeRaw(stored);
  }, [assigneeKey]);
  const setSelectedAssignee = useCallback(
    (v: string) => {
      setSelectedAssigneeRaw(v);
      if (v) {
        localStorage.setItem(assigneeKey, v);
      } else {
        localStorage.removeItem(assigneeKey);
      }
    },
    [assigneeKey]
  );
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

  // Persist selected board for redirect from /boards
  useEffect(() => {
    if (data) {
      localStorage.setItem("last-board", params.projectId);
    }
  }, [data, params.projectId]);

  // Fetch projects for switcher dropdown
  const fetchSwitcherProjects = useCallback(async () => {
    if (switcherProjects !== null) return;
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        setSwitcherProjects(await res.json());
      }
    } catch {
      // ignore
    }
  }, [switcherProjects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!switcherOpen) return;
    function handleClick(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [switcherOpen]);

  const toggleSwitcher = useCallback(() => {
    setSwitcherOpen((prev) => {
      if (!prev) fetchSwitcherProjects();
      return !prev;
    });
  }, [fetchSwitcherProjects]);

  const columnLabelPrefix = useMemo(() => {
    if (!data || data.meta.boardLists.length === 0) return null;
    const first = data.meta.boardLists[0].label;
    const sep = first.lastIndexOf("::");
    return sep !== -1 ? first.substring(0, sep + 2) : null;
  }, [data]);

  const assigneeFilteredIssues = useMemo(() => {
    if (!data) return [];
    if (!selectedAssignee) return data.issues;
    return data.issues.filter((issue) =>
      issue.assignees.some((a) => a.username === selectedAssignee)
    );
  }, [data, selectedAssignee]);

  const filterBarLabels = useMemo(() => {
    const used = new Set(assigneeFilteredIssues.flatMap((i) => i.labels));
    if (columnLabelPrefix) {
      return [...used].filter((l) => !l.startsWith(columnLabelPrefix)).sort();
    }
    return [...used].sort();
  }, [assigneeFilteredIssues, columnLabelPrefix]);

  const filteredIssues = useMemo(() => {
    let issues = assigneeFilteredIssues;

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
  }, [assigneeFilteredIssues, selectedLabels, searchQuery]);

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
      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          {data.project.nameWithNamespace
            ? data.project.nameWithNamespace.split(" / ").map((part, i, arr) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span>/</span>}
                  {i === arr.length - 1 ? (<>
                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H13.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" />
                    </svg>
                    <div className="relative" ref={switcherRef}>
                      <button onClick={toggleSwitcher} className="flex items-center gap-1 hover:text-indigo-600">
                        {part}
                        <svg className={`h-3 w-3 transition-transform ${switcherOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {switcherOpen && (
                        <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          {switcherProjects === null ? (
                            <div className="px-3 py-2 text-xs text-gray-400">Loading...</div>
                          ) : switcherProjects.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-gray-400">No projects</div>
                          ) : (
                            switcherProjects.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setSwitcherOpen(false);
                                  if (p.id !== params.projectId) router.push(`/boards/${p.id}`);
                                }}
                                className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${p.id === params.projectId ? "font-medium text-indigo-600" : "text-gray-700"}`}
                              >
                                {p.nameWithNamespace ?? p.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </>) : (<>
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h3.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 8.62 3H14.5A1.5 1.5 0 0 1 16 4.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 0-.5-.5H8.621a2.5 2.5 0 0 1-1.768-.732L5.732 2.146A.5.5 0 0 0 5.379 2H1.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V7.5a.5.5 0 0 1 1 0v6A1.5 1.5 0 0 1 14.5 15h-13A1.5 1.5 0 0 1 0 13.5v-11Z" />
                    </svg>
                    <span>{part}</span>
                  </>)}
                </span>
              ))
            : <>
                <svg className="h-4 w-4 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H13.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" />
                </svg>
                <div className="relative" ref={switcherRef}>
                  <button onClick={toggleSwitcher} className="flex items-center gap-1 hover:text-indigo-600">
                    {data.project.name}
                    <svg className={`h-3 w-3 transition-transform ${switcherOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {switcherOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {switcherProjects === null ? (
                        <div className="px-3 py-2 text-xs text-gray-400">Loading...</div>
                      ) : switcherProjects.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400">No projects</div>
                      ) : (
                        switcherProjects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSwitcherOpen(false);
                              if (p.id !== params.projectId) router.push(`/boards/${p.id}`);
                            }}
                            className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${p.id === params.projectId ? "font-medium text-indigo-600" : "text-gray-700"}`}
                          >
                            {p.nameWithNamespace ?? p.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
          }
          <span>/</span>
          <span className="font-semibold text-gray-900">Issue Board</span>
        </nav>
        <BoardStats stats={data.stats} />
      </div>

      <BoardFilterBar
        assignees={data.meta.assignees}
        labels={filterBarLabels}
        selectedAssignee={selectedAssignee}
        selectedLabels={selectedLabels}
        searchQuery={searchQuery}
        onAssigneeChange={setSelectedAssignee}
        onLabelsChange={setSelectedLabels}
        onSearchChange={setSearchQuery}
      />

      <BoardColumns issues={filteredIssues} labels={data.meta.labels} boardLists={data.meta.boardLists} />
    </div>
  );
}
