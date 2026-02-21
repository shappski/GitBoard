import { prisma } from "@/lib/prisma";
import {
  getValidToken,
  fetchOpenMergeRequests,
  fetchRecentlyClosedMergeRequests,
  fetchOpenIssues,
  fetchRecentlyClosedIssues,
  fetchIssueRelatedMRs,
  fetchProjectBoards,
  fetchBoardLists,
} from "./client";
import { mapMergeRequest, mapIssue } from "./mappers";

export async function syncUserProjects(userId: string): Promise<{
  status: string;
  mrsFetched: number;
  issuesFetched: number;
  error?: string;
}> {
  const startTime = Date.now();
  let totalMrsFetched = 0;
  let totalIssuesFetched = 0;

  try {
    const token = await getValidToken(userId);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { gitlabId: true },
    });

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

      // Fetch and upsert open issues
      const openIssues = await fetchOpenIssues(
        token,
        project.gitlabProjectId,
        updatedAfter
      );

      for (const issue of openIssues) {
        const data = mapIssue(issue, project.id);
        const upsertedIssue = await prisma.issue.upsert({
          where: {
            projectId_gitlabIssueIid: {
              projectId: project.id,
              gitlabIssueIid: issue.iid,
            },
          },
          update: data,
          create: data,
        });

        // Fetch related MRs and reconcile junction table
        const relatedMRs = await fetchIssueRelatedMRs(
          token,
          project.gitlabProjectId,
          issue.iid
        );

        // Delete existing links for this issue
        await prisma.issueMergeRequest.deleteMany({
          where: { issueId: upsertedIssue.id },
        });

        // Create new links for MRs that exist in our DB
        for (const relatedMR of relatedMRs) {
          const dbMR = await prisma.mergeRequest.findUnique({
            where: {
              projectId_gitlabMrIid: {
                projectId: project.id,
                gitlabMrIid: relatedMR.iid,
              },
            },
          });
          if (dbMR) {
            await prisma.issueMergeRequest.create({
              data: {
                issueId: upsertedIssue.id,
                mergeRequestId: dbMR.id,
              },
            });
          }
        }
      }

      totalIssuesFetched += openIssues.length;

      // Upsert recently closed issues so they appear in the Closed column
      const closedIssues = await fetchRecentlyClosedIssues(
        token,
        project.gitlabProjectId,
        updatedAfter
      );

      for (const issue of closedIssues) {
        const data = mapIssue(issue, project.id);
        await prisma.issue.upsert({
          where: {
            projectId_gitlabIssueIid: {
              projectId: project.id,
              gitlabIssueIid: issue.iid,
            },
          },
          update: data,
          create: data,
        });
      }

      // Fetch and store board configuration
      const boards = await fetchProjectBoards(token, project.gitlabProjectId);
      if (boards.length > 0) {
        const board =
          (user.gitlabId && boards.find((b) => b.assignee?.id === user.gitlabId))
          || boards[0];
        const lists = await fetchBoardLists(token, project.gitlabProjectId, board.id);
        await prisma.boardList.deleteMany({ where: { projectId: project.id } });
        for (const list of lists) {
          await prisma.boardList.create({
            data: {
              projectId: project.id,
              gitlabBoardId: board.id,
              label: list.label.name,
              color: list.label.color,
              position: list.position,
            },
          });
        }
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
        issuesFetched: totalIssuesFetched,
        duration,
      },
    });

    return { status: "completed", mrsFetched: totalMrsFetched, issuesFetched: totalIssuesFetched };
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
        issuesFetched: totalIssuesFetched,
        duration,
      },
    });

    return { status: "failed", mrsFetched: totalMrsFetched, issuesFetched: totalIssuesFetched, error: errorMessage };
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
