import { PipelineStatus } from "@/components/dashboard/pipeline-status";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";

interface LinkedMRProps {
  title: string;
  webUrl: string;
  pipelineStatus: string | null;
  gitlabUpdatedAt: string;
  idleDays: number;
  isStale: boolean;
}

export function LinkedMR({ title, webUrl, pipelineStatus, gitlabUpdatedAt, idleDays, isStale }: LinkedMRProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
        <a
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm text-indigo-600 hover:underline"
        >
          {title}
        </a>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <PipelineStatus status={pipelineStatus} />
        <span className="text-xs text-gray-500">
          {formatRelativeDate(new Date(gitlabUpdatedAt))}
        </span>
        {isStale && (
          <Badge variant="danger">{idleDays}d idle</Badge>
        )}
      </div>
    </div>
  );
}
