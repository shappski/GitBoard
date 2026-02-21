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
 * hex background color using relative luminance.
 */
function contrastColor(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const luminance =
    0.2126 * (r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4) +
    0.7152 * (g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4) +
    0.0722 * (b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4);
  return luminance > 0.179 ? "#000000" : "#ffffff";
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
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
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
            className="h-3.5 w-3.5 text-gray-400"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9-3a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM8 6.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 6.75Z" />
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
