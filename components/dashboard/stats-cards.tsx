"use client";

import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  stale: number;
  active: number;
  draft: number;
}

export function StatsCards({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "Total Open MRs",
      value: stats.total,
      color: "text-gray-900",
      bg: "bg-gray-50",
    },
    {
      label: "Stalled (3+ days)",
      value: stats.stale,
      color: "text-red-700",
      bg: "bg-red-50",
    },
    {
      label: "Active",
      value: stats.active,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Drafts",
      value: stats.draft,
      color: "text-yellow-700",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <p className={`mt-1 text-3xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
