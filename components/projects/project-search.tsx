"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  web_url: string;
  path_with_namespace: string;
}

export function ProjectSearch({
  onAdd,
}: {
  onAdd: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GitLabProject[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/projects/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  async function handleAdd(project: GitLabProject) {
    setAdding(project.id);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gitlabProjectId: project.id,
          name: project.name,
          nameWithNamespace: project.name_with_namespace,
          webUrl: project.web_url,
        }),
      });
      if (res.ok) {
        onAdd();
        setQuery("");
        setResults([]);
      }
    } finally {
      setAdding(null);
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleInput(value: string) {
    setQuery(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(value), 300);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search GitLab projects..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {searching && (
          <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {results.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white">
          {results.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {project.name}
                </p>
                <p className="text-xs text-gray-500">
                  {project.path_with_namespace}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAdd(project)}
                disabled={adding === project.id}
              >
                {adding === project.id ? "Adding..." : "Add"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
