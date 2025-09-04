export interface ApiRelease {
  ref: string;
  version: string;
  date: string;
  description: string;
  issues_link?: string;
  commits?: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
}

export interface ApiCompareResponse {
  from_ref: string;
  to_ref: string;
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
  files_changed: Array<{
    path: string;
    status: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
  }>;
  issues_added: string[];
  issues_removed: string[];
}

export interface ApiPreviewResponse {
  branch: string;
  client: string;
  current_ref: string;
  preview_ref: string;
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
  files_changed: Array<{
    path: string;
    status: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
  }>;
  new_issues: string[];
}

export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  assignee?: string;
  priority: string;
  issue_type: string;
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
}

export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}