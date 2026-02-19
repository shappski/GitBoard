import { Badge } from "@/components/ui/badge";

interface MergeRequestData {
  id: string;
  title: string;
  webUrl: string;
  pipelineStatus: string | null;
  idleDays: number;
  isStale: boolean;
}

export interface Assignee {
  name: string;
  username: string;
  avatar_url: string;
}

interface BoardIssueCardProps {
  title: string;
  webUrl: string;
  labels: string[];
  assignees: Assignee[];
  mergeRequests: MergeRequestData[];
}

function getMrStatusColor(mergeRequests: MergeRequestData[]): {
  color: string;
  label: string;
} {
  if (mergeRequests.length === 0) {
    return { color: "bg-gray-400", label: "No MR" };
  }

  const hasStale = mergeRequests.some((mr) => mr.isStale);
  const hasFailed = mergeRequests.some(
    (mr) => mr.pipelineStatus === "failed"
  );
  if (hasFailed || hasStale) {
    return { color: "bg-red-500", label: "Failed/Stale" };
  }

  const hasRunning = mergeRequests.some(
    (mr) =>
      mr.pipelineStatus === "running" || mr.pipelineStatus === "pending"
  );
  if (hasRunning) {
    return { color: "bg-yellow-500", label: "Running" };
  }

  const hasPassed = mergeRequests.some(
    (mr) => mr.pipelineStatus === "success"
  );
  if (hasPassed) {
    return { color: "bg-green-500", label: "Passed" };
  }

  return { color: "bg-gray-400", label: "No pipeline" };
}

function AssigneeAvatar({ assignee }: { assignee: Assignee }) {
  if (assignee.avatar_url) {
    return (
      <img
        src={assignee.avatar_url}
        alt={assignee.name}
        title={assignee.name}
        className="h-5 w-5 rounded-full ring-2 ring-white"
      />
    );
  }
  const initials = assignee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      title={assignee.name}
      className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-medium text-indigo-700 ring-2 ring-white"
    >
      {initials}
    </span>
  );
}

export function BoardIssueCard({
  title,
  webUrl,
  labels,
  assignees,
  mergeRequests,
}: BoardIssueCardProps) {
  const mrStatus = getMrStatusColor(mergeRequests);
  const staleMr = mergeRequests.find((mr) => mr.isStale);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${mrStatus.color}`}
          title={mrStatus.label}
        />
        <a
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-2"
        >
          {title}
        </a>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {assignees.length > 0 && (
            <div className="flex -space-x-1">
              {assignees.slice(0, 3).map((a) => (
                <AssigneeAvatar key={a.username} assignee={a} />
              ))}
              {assignees.length > 3 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600 ring-2 ring-white">
                  +{assignees.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {staleMr && (
            <Badge variant="danger">{staleMr.idleDays}d idle</Badge>
          )}
          {mergeRequests.length > 0 && (
            <span className="text-xs text-gray-500">
              {mergeRequests.length} MR{mergeRequests.length !== 1 && "s"}
            </span>
          )}
        </div>
      </div>

      {labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
