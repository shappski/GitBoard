"use client";

import { useEffect, useState, useCallback } from "react";
import { ProjectSearch } from "@/components/projects/project-search";
import { ProjectList } from "@/components/projects/project-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  nameWithNamespace: string | null;
  webUrl: string;
  syncEnabled: boolean;
  lastSyncAt: string | null;
  _count: { mergeRequests: number };
}

export default function ProjectsPage() {
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
        <div className="h-20 animate-pulse rounded-xl border border-gray-200 bg-white" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search and add GitLab projects to monitor for stalled merge requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Project</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectSearch onAdd={fetchProjects} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Monitored Projects ({projects.length})
        </h2>
        <ProjectList projects={projects} onRemove={fetchProjects} />
      </div>
    </div>
  );
}
