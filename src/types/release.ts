export interface LocalRelease {
  branch: BranchType;
  title: string;
  date: string;
  tickets: string[];
}

export interface ParsedRelease {
  id: string;
  title: string;
  date: string;
  branch: BranchType;
  jiraTickets: string[];
}

export type BranchType = 'dev' | 'stage' | 'main';