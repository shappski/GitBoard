"use client";

import { useState, useCallback } from "react";
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
}

export function BoardColumn({ label, issues, color }: BoardColumnProps) {
  const storageKey = `board-col-collapsed:${label}`;
  const [collapsed, setCollapsedRaw] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });
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
            className="mt-3 text-xs font-semibold whitespace-nowrap border rounded px-0.5 py-1"
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
    <div className="flex w-[280px] min-w-[280px] flex-col bg-background">
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
              className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold border truncate"
              style={{
                color: color,
                borderColor: color,
                backgroundColor: color + "1a",
              }}
            >
              {label}
            </span>
          ) : (
            <h3 className="text-sm font-semibold text-gray-700 truncate">{label}</h3>
          )}
        </div>
        <span className="ml-2 inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
          {issues.length}
        </span>
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
          />
        ))}
      </div>
    </div>
  );
}
