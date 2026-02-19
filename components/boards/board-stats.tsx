import { Card, CardContent } from "@/components/ui/card";

interface BoardStatsProps {
  stats: {
    totalIssues: number;
    issuesWithMRs: number;
    issuesWithoutMRs: number;
    issuesWithStaleMRs: number;
  };
}

const statCards = [
  { key: "totalIssues" as const, label: "Total Issues", color: "text-gray-900" },
  { key: "issuesWithMRs" as const, label: "With MRs", color: "text-green-600" },
  { key: "issuesWithoutMRs" as const, label: "Without MRs", color: "text-yellow-600" },
  { key: "issuesWithStaleMRs" as const, label: "With Stale MRs", color: "text-red-600" },
];

export function BoardStats({ stats }: BoardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <Card key={card.key}>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>
              {stats[card.key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
