"use client";

import { useState, useCallback, useEffect } from "react";
import { BoardIssueCard, Assignee } from "./board-issue-card";

interface MergeRequestData {
  id: string;
  title: string;
  webUrl: string;
  pipelineStatus: string | null;
  idleDays: number;
  isStale: boolean;
}

interface IssueData {
  id: string;
  gitlabIssueIid: number;
  title: string;
  webUrl: string;
  labels: string[];
  assignees: Assignee[];
  mergeRequests: MergeRequestData[];
}

interface BoardColumnProps {
  label: string;
  issues: IssueData[];
  color?: string;
  labelColors: Record<string, string>;
}

export function BoardColumn({ label, issues, color, labelColors }: BoardColumnProps) {
  const storageKey = `board-col-collapsed:${label}`;
  const [collapsed, setCollapsedRaw] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "1") setCollapsedRaw(true);
  }, [storageKey]);
  const setCollapsed = useCallback(
    (v: boolean) => {
      setCollapsedRaw(v);
      localStorage.setItem(storageKey, v ? "1" : "0");
    },
    [storageKey]
  );

  if (collapsed) {
    return (
      <div className="flex w-[40px] min-w-[40px] flex-col items-center bg-background">
        {color && (
          <div className="h-1 w-full rounded-t-lg" style={{ backgroundColor: color }} />
        )}
        <button
          onClick={() => setCollapsed(false)}
          className="mt-2 flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          aria-label={`Expand ${label}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
          </svg>
        </button>
        <span className="mt-2 inline-flex items-center justify-center rounded-full bg-gray-200 h-5 w-5 text-[10px] font-medium text-gray-700">
          {issues.length}
        </span>
        {color ? (
          <span
            className="mt-3 text-xs font-semibold whitespace-nowrap border rounded-full px-0.5 py-1"
            style={{
              writingMode: "vertical-rl",
              color: color,
              borderColor: color,
              backgroundColor: color + "1a",
            }}
          >
            {label}
          </span>
        ) : (
          <span
            className="mt-3 text-xs font-semibold text-gray-700 whitespace-nowrap"
            style={{ writingMode: "vertical-rl" }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-[375px] min-w-[375px] flex-col bg-background">
      {color && (
        <div className="h-1 rounded-t-lg" style={{ backgroundColor: color }} />
      )}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={() => setCollapsed(true)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            aria-label={`Collapse ${label}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
            </svg>
          </button>
          {color ? (
            <span
              className="inline-flex items-center overflow-hidden rounded-full border truncate"
              style={{ borderColor: color }}
            >
              <span
                className="px-2 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                Stage
              </span>
              <span
                className="px-2 py-0.5 text-xs font-semibold text-black bg-white"
              >
                {label}
              </span>
            </span>
          ) : (
            <h3 className="text-sm font-semibold text-gray-700 truncate">{label}</h3>
          )}
        </div>
        <div className="ml-2 flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-0.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 1.5A1.5 1.5 0 0 1 4.5 0h5.379a1.5 1.5 0 0 1 1.06.44l2.122 2.12A1.5 1.5 0 0 1 13.5 3.622V14.5A1.5 1.5 0 0 1 12 16H4.5A1.5 1.5 0 0 1 3 14.5V1.5Zm1.5 0v13h7.5V4H9.5A1.5 1.5 0 0 1 8 2.5V1.5H4.5Z" />
            </svg>
            {issues.length}
          </span>
          <span className="flex items-center gap-0.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.25 2.25 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z" />
            </svg>
            {issues.reduce((sum, i) => sum + i.mergeRequests.length, 0)}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ maxHeight: "calc(100vh - 320px)" }}>
        {issues.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">No issues</p>
        )}
        {issues.map((issue) => (
          <BoardIssueCard
            key={issue.id}
            title={issue.title}
            webUrl={issue.webUrl}
            labels={issue.labels}
            assignees={issue.assignees}
            mergeRequests={issue.mergeRequests}
            gitlabIssueIid={issue.gitlabIssueIid}
            labelColors={labelColors}
          />
        ))}
      </div>
    </div>
  );
}
