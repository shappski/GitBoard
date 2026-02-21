export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  web_url: string;
  path_with_namespace: string;
  avatar_url: string | null;
  star_count: number;
  last_activity_at: string;
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  title: string;
  state: string;
  web_url: string;
  draft: boolean;
  source_branch: string;
  target_branch: string;
  created_at: string;
  updated_at: string;
  author: {
    name: string;
    username: string;
    avatar_url: string;
  };
  labels: string[];
  reviewers: {
    name: string;
    username: string;
    avatar_url: string;
  }[];
  head_pipeline: {
    status: string;
  } | null;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  state: string;
  web_url: string;
  labels: string[];
  author: { name: string; username: string; avatar_url: string };
  assignees: { name: string; username: string; avatar_url: string }[];
  created_at: string;
  updated_at: string;
}

export interface GitLabBoardList {
  id: number;
  label: { name: string; color: string; description: string | null };
  position: number;
}

export interface GitLabBoard {
  id: number;
  name: string;
  hide_backlog_list: boolean;
  hide_closed_list: boolean;
  lists: GitLabBoardList[];
  assignee?: { id: number; username: string; name: string } | null;
}

export interface GitLabLabel {
  name: string;
  color: string;
}

export interface GitLabTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  created_at: number;
}
