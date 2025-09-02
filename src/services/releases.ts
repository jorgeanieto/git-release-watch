import { LocalRelease, ParsedRelease, BranchType } from '@/types/release';

export class ReleasesService {
  async fetchReleases(): Promise<LocalRelease[]> {
    const response = await fetch('/releases.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch releases: ${response.statusText}`);
    }
    
    return response.json();
  }

  categorizeByBranch(releases: LocalRelease[]): Record<BranchType, ParsedRelease[]> {
    const categories: Record<BranchType, ParsedRelease[]> = {
      dev: [],
      stage: [],
      main: []
    };

    releases.forEach((release, index) => {
      const parsed: ParsedRelease = {
        id: `${release.branch}-${release.title}-${index}`,
        title: release.title,
        date: release.date,
        branch: release.branch,
        jiraTickets: release.tickets
      };
      
      categories[release.branch].push(parsed);
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
}

export const releasesService = new ReleasesService();