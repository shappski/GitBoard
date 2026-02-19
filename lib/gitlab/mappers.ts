import type { GitLabMergeRequest } from "./types";

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
