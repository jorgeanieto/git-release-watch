export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  target_commitish: string;
  html_url: string;
}

export interface ParsedRelease {
  id: number;
  title: string;
  description: string;
  date: string;
  branch: string;
  jiraTickets: string[];
  url: string;
}

export type BranchType = 'dev' | 'stage' | 'main';