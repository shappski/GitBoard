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
  gitlabIssueIid: number;
  labelColors: Record<string, string>;
}

/**
 * Compute a readable foreground color (black or white) for a given
 * hex background color using perceived brightness.
 */
function contrastColor(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
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

function LabelBadge({
  label,
  color,
}: {
  label: string;
  color: string | undefined;
}) {
  const scopeIdx = label.indexOf("::");
  const isScoped = scopeIdx !== -1;

  if (!color) {
    // No color data — render a simple gray pill
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
        {label}
      </span>
    );
  }

  if (!isScoped) {
    // Simple label: colored pill
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{
          backgroundColor: color,
          color: contrastColor(color),
        }}
      >
        {label}
      </span>
    );
  }

  // Scoped label: left part colored, right part white with colored border
  const leftText = label.substring(0, scopeIdx);
  const rightText = label.substring(scopeIdx + 2);
  return (
    <span
      className="inline-flex items-center overflow-hidden rounded-full border text-[11px] font-medium"
      style={{ borderColor: color }}
    >
      <span
        className="px-1.5 py-0.5"
        style={{ backgroundColor: color, color: contrastColor(color) }}
      >
        {leftText}
      </span>
      <span className="px-1.5 py-0.5 bg-white" style={{ color: color }}>
        {rightText}
      </span>
    </span>
  );
}

export function BoardIssueCard({
  title,
  webUrl,
  labels,
  assignees,
  mergeRequests,
  gitlabIssueIid,
  labelColors,
}: BoardIssueCardProps) {
  const staleMr = mergeRequests.find((mr) => mr.isStale);

  return (
    <div className="rounded border border-gray-200 bg-white p-3 shadow-sm">
      {/* Title */}
      <a
        href={webUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-2"
      >
        {title}
      </a>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {labels.map((label) => (
            <LabelBadge key={label} label={label} color={labelColors[label]} />
          ))}
        </div>
      )}

      {/* Bottom row: issue number + stale badge (left), avatars (right) */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <svg
            className="h-3.5 w-3.5 text-green-600"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M3 1.5A1.5 1.5 0 0 1 4.5 0h5.379a1.5 1.5 0 0 1 1.06.44l2.122 2.12A1.5 1.5 0 0 1 13.5 3.622V14.5A1.5 1.5 0 0 1 12 16H4.5A1.5 1.5 0 0 1 3 14.5V1.5Zm1.5 0v13h7.5V4H9.5A1.5 1.5 0 0 1 8 2.5V1.5H4.5Z" />
          </svg>
          <span className="text-xs text-gray-500">#{gitlabIssueIid}</span>
          {staleMr && (
            <Badge variant="danger">{staleMr.idleDays}d idle</Badge>
          )}
        </div>
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
    </div>
  );
}
