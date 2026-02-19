import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STALE_THRESHOLD_DAYS } from "@/lib/constants";
import { idleDays } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    const project = await prisma.monitoredProject.findFirst({
      where: { id: projectId, userId: session.user.id },
      select: { id: true, name: true, nameWithNamespace: true, webUrl: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const issues = await prisma.issue.findMany({
      where: { projectId, state: "opened" },
      include: {
        mergeRequests: {
          include: {
            mergeRequest: true,
          },
        },
      },
      orderBy: { gitlabUpdatedAt: "desc" },
    });

    const enriched = issues.map((issue) => ({
      ...issue,
      mergeRequests: issue.mergeRequests.map((imr) => ({
        ...imr.mergeRequest,
        idleDays: idleDays(imr.mergeRequest.gitlabUpdatedAt),
        isStale:
          idleDays(imr.mergeRequest.gitlabUpdatedAt) >= STALE_THRESHOLD_DAYS,
      })),
    }));

    const stats = {
      totalIssues: enriched.length,
      issuesWithMRs: enriched.filter((i) => i.mergeRequests.length > 0).length,
      issuesWithoutMRs: enriched.filter((i) => i.mergeRequests.length === 0)
        .length,
      issuesWithStaleMRs: enriched.filter((i) =>
        i.mergeRequests.some((mr) => mr.isStale)
      ).length,
    };

    return NextResponse.json({ project, issues: enriched, stats });
  } catch (error) {
    console.error("Board issues API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
