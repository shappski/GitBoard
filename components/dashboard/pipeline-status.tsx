import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "warning" | "info" | "secondary" }> = {
  success: { label: "Passed", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  running: { label: "Running", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  canceled: { label: "Canceled", variant: "secondary" },
  skipped: { label: "Skipped", variant: "secondary" },
  manual: { label: "Manual", variant: "secondary" },
  created: { label: "Created", variant: "secondary" },
};

export function PipelineStatus({ status }: { status: string | null }) {
  if (!status) {
    return <Badge variant="secondary">No pipeline</Badge>;
  }

  const config = statusConfig[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
