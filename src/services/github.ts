import { GitHubRelease, ParsedRelease, BranchType } from '@/types/release';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubService {
  private owner: string;
  private repo: string;

  constructor(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
  }

  async fetchReleases(): Promise<GitHubRelease[]> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}/releases?per_page=100`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch releases: ${response.statusText}`);
    }
    
    return response.json();
  }

  parseJiraTickets(description: string): string[] {
    const jiraPattern = /AW-\d+/g;
    const matches = description.match(jiraPattern);
    return matches ? [...new Set(matches)] : [];
  }

  categorizeByBranch(releases: GitHubRelease[]): Record<BranchType, ParsedRelease[]> {
    const categories: Record<BranchType, ParsedRelease[]> = {
      dev: [],
      stage: [],
      main: []
    };

    releases.forEach(release => {
      const branch = this.determineBranch(release.target_commitish, release.tag_name);
      const parsed: ParsedRelease = {
        id: release.id,
        title: release.name || release.tag_name,
        description: release.body || '',
        date: release.published_at,
        branch,
        jiraTickets: this.parseJiraTickets(release.body || ''),
        url: release.html_url
      };
      
      categories[branch].push(parsed);
    });

    // Sort by date (newest first)
    Object.keys(categories).forEach(key => {
      const branch = key as BranchType;
      categories[branch].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return categories;
  }

  private determineBranch(targetCommitish: string, tagName: string): BranchType {
    const target = targetCommitish.toLowerCase();
    const tag = tagName.toLowerCase();
    
    if (target.includes('dev') || tag.includes('dev') || tag.includes('beta')) {
      return 'dev';
    } else if (target.includes('stage') || target.includes('staging') || tag.includes('rc')) {
      return 'stage';
    } else {
      return 'main';
    }
  }
}

// Default instance - users can update these values
export const githubService = new GitHubService('example', 'example');