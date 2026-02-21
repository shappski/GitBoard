"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
}

export default function BoardsPage() {
  const router = useRouter();
  const [noProjects, setNoProjects] = useState(false);

  const resolve = useCallback(async () => {
    const lastBoard = localStorage.getItem("last-board");
    if (lastBoard) {
      router.replace(`/boards/${lastBoard}`);
      return;
    }

    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const projects: Project[] = await res.json();
        if (projects.length > 0) {
          router.replace(`/boards/${projects[0].id}`);
          return;
        }
      }
    } catch {
      // fall through to no-projects state
    }
    setNoProjects(true);
  }, [router]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  if (noProjects) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <h3 className="text-sm font-medium text-gray-900">No projects</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add projects from the Projects page to see their issue boards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
