import { GITLAB_API_BASE, RATE_LIMIT_THRESHOLD } from "@/lib/constants";
import type { GitLabProject, GitLabMergeRequest, GitLabIssue, GitLabBoard, GitLabBoardList, GitLabTokenResponse } from "./types";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDecryptedToken(userId: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  accountId: string;
  expiresAt: number | null;
}> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "gitlab" },
  });
  if (!account || !account.access_token) {
    throw new Error("No GitLab account found for user");
  }
  return {
    accessToken: decrypt(account.access_token),
    refreshToken: account.refresh_token ? decrypt(account.refresh_token) : null,
    accountId: account.id,
    expiresAt: account.expires_at,
  };
}

async function refreshAccessToken(
  accountId: string,
  refreshToken: string
): Promise<string> {
  const res = await fetch("https://gitlab.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.GITLAB_CLIENT_ID,
      client_secret: process.env.GITLAB_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  const data: GitLabTokenResponse = await res.json();

  await prisma.account.update({
    where: { id: accountId },
    data: {
      access_token: encrypt(data.access_token),
      refresh_token: data.refresh_token
        ? encrypt(data.refresh_token)
        : undefined,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    },
  });

  return data.access_token;
}

export async function getValidToken(userId: string): Promise<string> {
  const { accessToken, refreshToken, accountId, expiresAt } =
    await getDecryptedToken(userId);

  // If token expires within 5 minutes, refresh it
  if (expiresAt && expiresAt < Math.floor(Date.now() / 1000) + 300) {
    if (!refreshToken) {
      throw new Error("Token expired and no refresh token available");
    }
    return refreshAccessToken(accountId, refreshToken);
  }

  return accessToken;
}

async function handleRateLimit(res: Response): Promise<void> {
  const remaining = res.headers.get("RateLimit-Remaining");
  if (remaining && parseInt(remaining) < RATE_LIMIT_THRESHOLD) {
    const resetTime = res.headers.get("RateLimit-Reset");
    if (resetTime) {
      const waitMs =
        Math.max(0, parseInt(resetTime) * 1000 - Date.now()) + 1000;
      await sleep(Math.min(waitMs, 60000));
    } else {
      await sleep(5000);
    }
  }
}

export async function gitlabFetch<T>(
  path: string,
  token: string,
  options?: { params?: Record<string, string> }
): Promise<T> {
  const url = new URL(`${GITLAB_API_BASE}${path}`);
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) =>
      url.searchParams.set(k, v)
    );
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    await sleep(waitMs);
    return gitlabFetch(path, token, options);
  }

  if (!res.ok) {
    throw new Error(`GitLab API error: ${res.status} ${res.statusText}`);
  }

  await handleRateLimit(res);

  return res.json();
}

export async function gitlabFetchPaginated<T>(
  path: string,
  token: string,
  params?: Record<string, string>
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  const perPage = "100";

  while (true) {
    const url = new URL(`${GITLAB_API_BASE}${path}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", perPage);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      throw new Error(`GitLab API error: ${res.status} ${res.statusText}`);
    }

    await handleRateLimit(res);

    const items: T[] = await res.json();
    allItems.push(...items);

    const totalPages = res.headers.get("X-Total-Pages");
    if (!totalPages || page >= parseInt(totalPages)) break;
    page++;
  }

  return allItems;
}

export async function searchProjects(
  token: string,
  query: string
): Promise<GitLabProject[]> {
  return gitlabFetchPaginated<GitLabProject>("/projects", token, {
    search: query,
    membership: "true",
    order_by: "last_activity_at",
    sort: "desc",
    per_page: "20",
  });
}

export async function fetchOpenMergeRequests(
  token: string,
  projectId: number,
  updatedAfter?: string
): Promise<GitLabMergeRequest[]> {
  const params: Record<string, string> = {
    state: "opened",
    order_by: "updated_at",
    sort: "desc",
  };
  if (updatedAfter) {
    params.updated_after = updatedAfter;
  }
  return gitlabFetchPaginated<GitLabMergeRequest>(
    `/projects/${projectId}/merge_requests`,
    token,
    params
  );
}

export async function fetchOpenIssues(
  token: string,
  projectId: number,
  updatedAfter?: string
): Promise<GitLabIssue[]> {
  const params: Record<string, string> = {
    state: "opened",
    order_by: "updated_at",
    sort: "desc",
  };
  if (updatedAfter) {
    params.updated_after = updatedAfter;
  }
  return gitlabFetchPaginated<GitLabIssue>(
    `/projects/${projectId}/issues`,
    token,
    params
  );
}

export async function fetchRecentlyClosedIssues(
  token: string,
  projectId: number,
  updatedAfter?: string
): Promise<GitLabIssue[]> {
  const params: Record<string, string> = {
    state: "closed",
    order_by: "updated_at",
    sort: "desc",
  };
  if (updatedAfter) {
    params.updated_after = updatedAfter;
  }
  return gitlabFetchPaginated<GitLabIssue>(
    `/projects/${projectId}/issues`,
    token,
    params
  );
}

export async function fetchIssueRelatedMRs(
  token: string,
  projectId: number,
  issueIid: number
): Promise<GitLabMergeRequest[]> {
  return gitlabFetch<GitLabMergeRequest[]>(
    `/projects/${projectId}/issues/${issueIid}/related_merge_requests`,
    token
  );
}

export async function fetchProjectBoards(
  token: string,
  projectId: number
): Promise<GitLabBoard[]> {
  return gitlabFetch<GitLabBoard[]>(`/projects/${projectId}/boards`, token);
}

export async function fetchBoardLists(
  token: string,
  projectId: number,
  boardId: number
): Promise<GitLabBoardList[]> {
  return gitlabFetch<GitLabBoardList[]>(
    `/projects/${projectId}/boards/${boardId}/lists`,
    token
  );
}

export async function fetchRecentlyClosedMergeRequests(
  token: string,
  projectId: number,
  updatedAfter?: string
): Promise<GitLabMergeRequest[]> {
  const params: Record<string, string> = {
    state: "merged",
    order_by: "updated_at",
    sort: "desc",
  };
  if (updatedAfter) {
    params.updated_after = updatedAfter;
  }
  const merged = await gitlabFetchPaginated<GitLabMergeRequest>(
    `/projects/${projectId}/merge_requests`,
    token,
    params
  );

  params.state = "closed";
  const closed = await gitlabFetchPaginated<GitLabMergeRequest>(
    `/projects/${projectId}/merge_requests`,
    token,
    params
  );

  return [...merged, ...closed];
}
