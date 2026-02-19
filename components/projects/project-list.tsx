"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  nameWithNamespace: string | null;
  webUrl: string;
  syncEnabled: boolean;
  lastSyncAt: string | null;
  _count: { mergeRequests: number };
}

export function ProjectList({
  projects,
  onRemove,
}: {
  projects: Project[];
  onRemove: () => void;
}) {
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setRemoving(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRemove();
      }
    } finally {
      setRemoving(null);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12">
        <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-900">
          No projects monitored
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Search and add GitLab projects above to start monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="min-w-0 flex-1">
              <a
                href={project.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-indigo-600"
              >
                {project.nameWithNamespace ?? project.name}
              </a>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span>{project._count.mergeRequests} open MRs</span>
                {project.lastSyncAt && (
                  <span>
                    Last sync: {formatRelativeDate(new Date(project.lastSyncAt))}
                  </span>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleRemove(project.id)}
              disabled={removing === project.id}
            >
              {removing === project.id ? "Removing..." : "Remove"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
