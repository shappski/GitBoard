interface BoardStatsProps {
  stats: {
    totalIssues: number;
    issuesWithMRs: number;
    issuesWithoutMRs: number;
    issuesWithStaleMRs: number;
  };
}

const statItems = [
  { key: "totalIssues" as const, label: "Issues", color: "text-gray-900" },
  { key: "issuesWithMRs" as const, label: "With MRs", color: "text-green-600" },
  { key: "issuesWithoutMRs" as const, label: "Without MRs", color: "text-yellow-600" },
  { key: "issuesWithStaleMRs" as const, label: "Stale MRs", color: "text-red-600" },
];

export function BoardStats({ stats }: BoardStatsProps) {
  return (
    <div className="flex items-center gap-4">
      {statItems.map((item) => (
        <span key={item.key} className="text-sm text-gray-500">
          {item.label}{" "}
          <span className={`font-semibold ${item.color}`}>{stats[item.key]}</span>
        </span>
      ))}
    </div>
  );
}
