import { prisma } from "@/lib/prisma";
import {
  getValidToken,
  fetchOpenMergeRequests,
  fetchRecentlyClosedMergeRequests,
} from "./client";
import { mapMergeRequest } from "./mappers";

export async function syncUserProjects(userId: string): Promise<{
  status: string;
  mrsFetched: number;
  error?: string;
}> {
  const startTime = Date.now();
  let totalMrsFetched = 0;

  try {
    const token = await getValidToken(userId);

    const projects = await prisma.monitoredProject.findMany({
      where: { userId, syncEnabled: true },
    });

    for (const project of projects) {
      const updatedAfter = project.lastSyncAt?.toISOString();

      // Fetch open MRs
      const openMrs = await fetchOpenMergeRequests(
        token,
        project.gitlabProjectId,
        updatedAfter
      );

      // Upsert open MRs
      for (const mr of openMrs) {
        const data = mapMergeRequest(mr, project.id);
        await prisma.mergeRequest.upsert({
          where: {
            projectId_gitlabMrIid: {
              projectId: project.id,
              gitlabMrIid: mr.iid,
            },
          },
          update: data,
          create: data,
        });
      }

      totalMrsFetched += openMrs.length;

      // Clean up closed/merged MRs
      const closedMrs = await fetchRecentlyClosedMergeRequests(
        token,
        project.gitlabProjectId,
        updatedAfter
      );

      if (closedMrs.length > 0) {
        await prisma.mergeRequest.deleteMany({
          where: {
            projectId: project.id,
            gitlabMrIid: { in: closedMrs.map((mr) => mr.iid) },
          },
        });
      }

      // Update lastSyncAt
      await prisma.monitoredProject.update({
        where: { id: project.id },
        data: { lastSyncAt: new Date() },
      });
    }

    const duration = Date.now() - startTime;

    await prisma.syncLog.create({
      data: {
        userId,
        status: "completed",
        mrsFetched: totalMrsFetched,
        duration,
      },
    });

    return { status: "completed", mrsFetched: totalMrsFetched };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await prisma.syncLog.create({
      data: {
        userId,
        status: "failed",
        error: errorMessage,
        mrsFetched: totalMrsFetched,
        duration,
      },
    });

    return { status: "failed", mrsFetched: totalMrsFetched, error: errorMessage };
  }
}

export async function syncAllUsers(): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      monitoredProjects: {
        some: { syncEnabled: true },
      },
    },
    select: { id: true },
  });

  for (const user of users) {
    try {
      await syncUserProjects(user.id);
    } catch (error) {
      console.error(`Sync failed for user ${user.id}:`, error);
    }
  }
}
