import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkedMR } from "./linked-mr";

interface MergeRequestData {
  id: string;
  title: string;
  webUrl: string;
  pipelineStatus: string | null;
  gitlabUpdatedAt: string;
  idleDays: number;
  isStale: boolean;
}

interface IssueCardProps {
  title: string;
  webUrl: string;
  authorName: string | null;
  authorUsername: string | null;
  labels: string[];
  mergeRequests: MergeRequestData[];
}

export function IssueCard({ title, webUrl, authorName, authorUsername, labels, mergeRequests }: IssueCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <a
              href={webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-900 hover:text-indigo-600"
            >
              {title}
            </a>
            {(authorName || authorUsername) && (
              <p className="mt-0.5 text-xs text-gray-500">
                by {authorName ?? authorUsername}
              </p>
            )}
          </div>
          {labels.length > 0 && (
            <div className="flex shrink-0 flex-wrap gap-1">
              {labels.map((label) => (
                <Badge key={label} variant="secondary">{label}</Badge>
              ))}
            </div>
          )}
        </div>

        {mergeRequests.length > 0 && (
          <div className="mt-3 space-y-2">
            {mergeRequests.map((mr) => (
              <LinkedMR
                key={mr.id}
                title={mr.title}
                webUrl={mr.webUrl}
                pipelineStatus={mr.pipelineStatus}
                gitlabUpdatedAt={mr.gitlabUpdatedAt}
                idleDays={mr.idleDays}
                isStale={mr.isStale}
              />
            ))}
          </div>
        )}

        {mergeRequests.length === 0 && (
          <p className="mt-2 text-xs text-gray-400">No linked merge requests</p>
        )}
      </CardContent>
    </Card>
  );
}
