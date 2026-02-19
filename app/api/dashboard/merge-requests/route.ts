import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STALE_THRESHOLD_DAYS } from "@/lib/constants";
import { idleDays } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.monitoredProject.findMany({
    where: { userId: session.user.id, syncEnabled: true },
    select: { id: true },
  });

  const projectIds = projects.map((p) => p.id);

  const mergeRequests = await prisma.mergeRequest.findMany({
    where: {
      projectId: { in: projectIds },
      state: "opened",
    },
    include: {
      project: {
        select: { name: true, nameWithNamespace: true, webUrl: true },
      },
    },
    orderBy: { gitlabUpdatedAt: "asc" },
  });

  const enriched = mergeRequests.map((mr) => ({
    ...mr,
    idleDays: idleDays(mr.gitlabUpdatedAt),
    isStale: idleDays(mr.gitlabUpdatedAt) >= STALE_THRESHOLD_DAYS,
  }));

  const stats = {
    total: enriched.length,
    stale: enriched.filter((mr) => mr.isStale).length,
    active: enriched.filter((mr) => !mr.isStale).length,
    draft: enriched.filter((mr) => mr.draft).length,
  };

  return NextResponse.json({ mergeRequests: enriched, stats });
}
