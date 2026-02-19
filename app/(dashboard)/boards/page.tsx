"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  nameWithNamespace: string | null;
  webUrl: string;
  syncEnabled: boolean;
  lastSyncAt: string | null;
  _count: { mergeRequests: number };
}

export default function BoardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        setProjects(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Issue Boards</h1>
        <p className="mt-1 text-sm text-gray-500">
          View issues and their linked merge request statuses
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <h3 className="text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add projects from the Projects page to see their issue boards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/boards/${project.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  {project.nameWithNamespace && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {project.nameWithNamespace}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {project._count.mergeRequests} open MRs
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
