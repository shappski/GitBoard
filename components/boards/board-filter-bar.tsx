"use client";

import { useState, useRef, useEffect } from "react";
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
  const [openDropdown, setOpenDropdown] = useState<"assignee" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleLabel(label: string) {
    if (selectedLabels.includes(label)) {
      onLabelsChange(selectedLabels.filter((l) => l !== label));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  }

  const selectedAssigneeName = assignees.find((a) => a.username === selectedAssignee)?.name;

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5"
    >
      {/* Active filter tokens */}
      {selectedAssigneeName && (
        <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
          Assignee = {selectedAssigneeName}
          <button
            onClick={() => onAssigneeChange("")}
            className="ml-0.5 text-indigo-400 hover:text-indigo-600"
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </span>
      )}
      {/* Assignee dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === "assignee" ? null : "assignee")}
          className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          Assignee
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
        {openDropdown === "assignee" && (
          <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => { onAssigneeChange(""); setOpenDropdown(null); }}
              className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${!selectedAssignee ? "font-medium text-indigo-600" : "text-gray-700"}`}
            >
              All
            </button>
            {assignees.map((a) => (
              <button
                key={a.username}
                onClick={() => { onAssigneeChange(a.username); setOpenDropdown(null); }}
                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${selectedAssignee === a.username ? "font-medium text-indigo-600" : "text-gray-700"}`}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-5 w-px bg-gray-200" />

      {/* Label pills */}
      <div className="flex flex-wrap items-center gap-1">
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
          <span className="text-xs text-gray-400">No labels</span>
        )}
      </div>

      {/* Search input */}
      <div className="relative ml-auto flex-1">
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
          className="w-full min-w-[120px] border-0 bg-transparent px-1.5 py-0.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-1 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
