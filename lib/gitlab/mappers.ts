import type { GitLabMergeRequest, GitLabIssue } from "./types";

export function mapMergeRequest(
  mr: GitLabMergeRequest,
  projectId: string
) {
  return {
    projectId,
    gitlabMrIid: mr.iid,
    gitlabMrId: mr.id,
    title: mr.title,
    webUrl: mr.web_url,
    state: mr.state,
    authorName: mr.author?.name ?? null,
    authorUsername: mr.author?.username ?? null,
    authorAvatarUrl: mr.author?.avatar_url ?? null,
    draft: mr.draft,
    sourceBranch: mr.source_branch,
    targetBranch: mr.target_branch,
    gitlabCreatedAt: new Date(mr.created_at),
    gitlabUpdatedAt: new Date(mr.updated_at),
    pipelineStatus: mr.head_pipeline?.status ?? null,
    labels: mr.labels ?? [],
    reviewers: (mr.reviewers ?? []).map((r) => ({
      name: r.name,
      username: r.username,
      avatar_url: r.avatar_url,
    })),
  };
}

export function mapIssue(issue: GitLabIssue, projectId: string) {
  return {
    projectId,
    gitlabIssueIid: issue.iid,
    gitlabIssueId: issue.id,
    title: issue.title,
    webUrl: issue.web_url,
    state: issue.state,
    authorName: issue.author?.name ?? null,
    authorUsername: issue.author?.username ?? null,
    authorAvatarUrl: issue.author?.avatar_url ?? null,
    labels: issue.labels ?? [],
    gitlabCreatedAt: new Date(issue.created_at),
    gitlabUpdatedAt: new Date(issue.updated_at),
  };
}
