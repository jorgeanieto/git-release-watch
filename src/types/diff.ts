import { ParsedRelease, BranchType } from './release';

export interface ClientDeployment {
  clientName: string;
  branch: BranchType;
  currentRelease: ParsedRelease;
  previousRelease?: ParsedRelease;
  nextRelease?: ParsedRelease;
  latestAvailable?: ParsedRelease;
}

export interface ReleaseDiff {
  fromRelease: ParsedRelease;
  toRelease: ParsedRelease;
  newTickets: string[];
  removedTickets: string[];
}

export interface ComparisonView {
  client: string;
  diff: ReleaseDiff;
}