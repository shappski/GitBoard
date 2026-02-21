"use client";

import { Assignee } from "./board-issue-card";

interface BoardFilterBarProps {
  assignees: Assignee[];
  labels: string[];
  selectedAssignee: string;
  selectedLabels: string[];
  searchQuery: string;
  onAssigneeChange: (username: string) => void;
  onLabelsChange: (labels: string[]) => void;
  onSearchChange: (query: string) => void;
}

export function BoardFilterBar({
  assignees,
  labels,
  selectedAssignee,
  selectedLabels,
  searchQuery,
  onAssigneeChange,
  onLabelsChange,
  onSearchChange,
}: BoardFilterBarProps) {
  function toggleLabel(label: string) {
    if (selectedLabels.includes(label)) {
      onLabelsChange(selectedLabels.filter((l) => l !== label));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <label htmlFor="assignee-filter" className="text-xs font-medium text-gray-500">
          Assignee
        </label>
        <select
          id="assignee-filter"
          value={selectedAssignee}
          onChange={(e) => onAssigneeChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All</option>
          {assignees.map((a) => (
            <option key={a.username} value={a.username}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Labels</span>
        <div className="flex flex-wrap gap-1">
          {labels.map((label) => {
            const active = selectedLabels.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
          {labels.length === 0 && (
            <span className="text-xs text-gray-400">None</span>
          )}
        </div>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && searchQuery) {
              onSearchChange("");
            }
          }}
          className="w-full min-w-[160px] rounded-md border border-gray-300 px-2.5 py-1 pr-7 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-1.5 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
