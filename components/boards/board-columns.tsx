import { BoardColumn } from "./board-column";
import { Assignee } from "./board-issue-card";

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
  state: string;
  labels: string[];
  assignees: Assignee[];
  mergeRequests: MergeRequestData[];
}

interface BoardListDef {
  label: string;
  color: string;
  position: number;
}

interface BoardColumnsProps {
  issues: IssueData[];
  labels: string[];
  boardLists: BoardListDef[];
}

function assignIssueToColumn(issue: IssueData, columnLabels: string[]): string {
  const issueLabels = (issue.labels as string[]).filter((l) =>
    columnLabels.includes(l)
  );
  if (issueLabels.length === 0) return "Open";
  // Pick the label that appears latest in the column order (highest position)
  issueLabels.sort(
    (a, b) => columnLabels.indexOf(b) - columnLabels.indexOf(a)
  );
  return issueLabels[0];
}

export function BoardColumns({ issues, labels, boardLists }: BoardColumnsProps) {
  const useBoardLists = boardLists.length > 0;
  const hasClosed = issues.some((i) => i.state === "closed");

  const columns: { label: string; color?: string; issues: IssueData[] }[] = useBoardLists
    ? [
        { label: "Open", issues: [] },
        ...boardLists.map((bl) => ({ label: bl.label, color: bl.color, issues: [] as IssueData[] })),
        ...(hasClosed ? [{ label: "Closed", issues: [] as IssueData[] }] : []),
      ]
    : [
        { label: "Open", issues: [] },
        ...labels.map((l) => ({ label: l, issues: [] as IssueData[] })),
        ...(hasClosed ? [{ label: "Closed", issues: [] as IssueData[] }] : []),
      ];

  const columnLabels = useBoardLists ? boardLists.map((bl) => bl.label) : labels;
  const columnMap = new Map(columns.map((c) => [c.label, c]));

  // Derive the scoped-label prefix (e.g. "Stage::") so we can hide all
  // labels in that scope from cards, not just the ones used as columns.
  let scopePrefix: string | null = null;
  if (useBoardLists && boardLists.length > 0) {
    const sep = boardLists[0].label.lastIndexOf("::");
    if (sep !== -1) scopePrefix = boardLists[0].label.substring(0, sep + 2);
  }

  for (const issue of issues) {
    // Closed issues always go to the Closed column
    if (issue.state === "closed") {
      const col = columnMap.get("Closed");
      if (col) {
        col.issues.push({
          ...issue,
          labels: issue.labels.filter((l) =>
            scopePrefix ? !l.startsWith(scopePrefix) : !columnLabels.includes(l)
          ),
        });
      }
      continue;
    }

    const columnLabel = assignIssueToColumn(issue, columnLabels);
    const col = columnMap.get(columnLabel);
    if (col) {
      col.issues.push({
        ...issue,
        labels: issue.labels.filter((l) =>
          scopePrefix ? !l.startsWith(scopePrefix) : !columnLabels.includes(l)
        ),
      });
    }
  }

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No open issues</h3>
        <p className="mt-1 text-sm text-gray-500">
          This project has no open issues, or they haven&apos;t been synced yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex">
        {columns.map((col, i) => (
          <div key={col.label} className="flex">
            {i > 0 && <div className="w-1 self-stretch bg-white" />}
            <BoardColumn label={col.label} issues={col.issues} color={col.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
