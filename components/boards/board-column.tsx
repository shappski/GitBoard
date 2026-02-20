import { BoardIssueCard, Assignee } from "./board-issue-card";

interface MergeRequestData {
  id: string;
  title: string;
  webUrl: string;
  pipelineStatus: string | null;
  idleDays: number;
  isStale: boolean;
}

interface IssueData {
  id: string;
  title: string;
  webUrl: string;
  labels: string[];
  assignees: Assignee[];
  mergeRequests: MergeRequestData[];
}

interface BoardColumnProps {
  label: string;
  issues: IssueData[];
  color?: string;
}

export function BoardColumn({ label, issues, color }: BoardColumnProps) {
  return (
    <div className="flex w-[280px] min-w-[280px] flex-col rounded-lg bg-gray-50 border border-gray-200">
      {color && (
        <div className="h-1 rounded-t-lg" style={{ backgroundColor: color }} />
      )}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 truncate">{label}</h3>
        <span className="ml-2 inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
          {issues.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ maxHeight: "calc(100vh - 320px)" }}>
        {issues.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">No issues</p>
        )}
        {issues.map((issue) => (
          <BoardIssueCard
            key={issue.id}
            title={issue.title}
            webUrl={issue.webUrl}
            labels={issue.labels}
            assignees={issue.assignees}
            mergeRequests={issue.mergeRequests}
          />
        ))}
      </div>
    </div>
  );
}
