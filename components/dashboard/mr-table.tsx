"use client";

import { Badge } from "@/components/ui/badge";
import { PipelineStatus } from "./pipeline-status";
import { formatRelativeDate } from "@/lib/utils";

interface MergeRequestRow {
  id: string;
  title: string;
  webUrl: string;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  draft: boolean;
  sourceBranch: string | null;
  targetBranch: string | null;
  gitlabUpdatedAt: string;
  pipelineStatus: string | null;
  labels: string[];
  reviewers: { name: string; username: string; avatar_url: string }[];
  idleDays: number;
  isStale: boolean;
  project: {
    name: string;
    nameWithNamespace: string | null;
    webUrl: string;
  };
}

export function MRTable({ mergeRequests }: { mergeRequests: MergeRequestRow[] }) {
  if (mergeRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
        <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-900">No merge requests</p>
        <p className="mt-1 text-sm text-gray-500">
          Add projects to monitor and sync to see merge requests here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Merge Request
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Last Activity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Idle Days
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Pipeline
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {mergeRequests.map((mr) => (
            <tr key={mr.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <a
                      href={mr.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {mr.title}
                    </a>
                    <div className="mt-1 flex items-center gap-2">
                      {mr.draft && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {(mr.labels as string[]).slice(0, 3).map((label) => (
                        <Badge key={label} variant="info">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <a
                  href={mr.project.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  {mr.project.name}
                </a>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                  {mr.authorAvatarUrl && (
                    <img
                      src={mr.authorAvatarUrl}
                      alt=""
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {mr.authorName ?? mr.authorUsername ?? "Unknown"}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatRelativeDate(new Date(mr.gitlabUpdatedAt))}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold ${
                    mr.isStale
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {mr.idleDays}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <PipelineStatus status={mr.pipelineStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
