interface ApiRelease {
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

interface ApiCompareResponse {
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

interface ApiPreviewResponse {
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

interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  assignee?: string;
  priority: string;
  issue_type: string;
}

export class ReleaseRadarAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async getClientReleases(client: string): Promise<ApiRelease[]> {
    const response = await fetch(`${this.baseUrl}/releases/${client}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch releases for ${client}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async compareReleases(client: string, fromRef: string, toRef: string): Promise<ApiCompareResponse> {
    const url = `${this.baseUrl}/releases/${client}/compare?from=${encodeURIComponent(fromRef)}&to=${encodeURIComponent(toRef)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to compare releases: ${response.statusText}`);
    }
    
    return response.json();
  }

  async previewBranchDeployment(client: string, branch: string): Promise<ApiPreviewResponse> {
    const url = `${this.baseUrl}/releases/${client}/preview?branch=${encodeURIComponent(branch)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to preview branch deployment: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getJiraIssues(fromRef: string, toRef: string): Promise<JiraIssue[]> {
    const url = `${this.baseUrl}/jira-issues?from=${encodeURIComponent(fromRef)}&to=${encodeURIComponent(toRef)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch JIRA issues: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const releaseRadarAPI = new ReleaseRadarAPI();