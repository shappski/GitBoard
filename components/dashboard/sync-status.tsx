"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";

interface SyncLog {
  id: string;
  status: string;
  mrsFetched: number;
  duration: number;
  createdAt: string;
  error?: string | null;
}

export function SyncStatus({
  logs,
  onSync,
}: {
  logs: SyncLog[];
  onSync: () => Promise<void>;
}) {
  const [syncing, setSyncing] = useState(false);

  const lastSync = logs[0];

  async function handleSync() {
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {lastSync && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span
            className={`h-2 w-2 rounded-full ${
              lastSync.status === "completed" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span>
            Last sync: {formatRelativeDate(new Date(lastSync.createdAt))}
            {lastSync.status === "completed"
              ? ` (${lastSync.mrsFetched} MRs)`
              : ` (failed)`}
          </span>
        </div>
      )}
      <Button
        size="sm"
        variant="secondary"
        onClick={handleSync}
        disabled={syncing}
      >
        {syncing ? (
          <>
            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Syncing...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 4.356v4.992" />
            </svg>
            Sync Now
          </>
        )}
      </Button>
    </div>
  );
}
