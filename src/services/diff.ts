import { ParsedRelease, BranchType, ClientDeployment, ReleaseDiff } from '@/types/release';

export class DiffService {
  // Mock client deployments - in a real app this would come from a separate data source
  private mockClientDeployments: Array<{
    clientName: string;
    branch: BranchType;
    currentReleaseTitle: string;
  }> = [
    { clientName: 'Client A', branch: 'main', currentReleaseTitle: 'v2.0.5' },
    { clientName: 'Client B', branch: 'stage', currentReleaseTitle: 'v2.1.0-rc.1' },
    { clientName: 'Client C', branch: 'main', currentReleaseTitle: 'v2.0.5' },
    { clientName: 'Client D', branch: 'dev', currentReleaseTitle: 'v2.2.0-dev.4' },
  ];

  computeReleaseDiff(fromRelease: ParsedRelease, toRelease: ParsedRelease): ReleaseDiff {
    const fromTickets = new Set(fromRelease.jiraTickets);
    const toTickets = new Set(toRelease.jiraTickets);
    
    const newTickets = Array.from(toTickets).filter(ticket => !fromTickets.has(ticket));
    const removedTickets = Array.from(fromTickets).filter(ticket => !toTickets.has(ticket));

    return {
      fromRelease,
      toRelease,
      newTickets,
      removedTickets
    };
  }

  getClientDeployments(releasesByBranch: Record<BranchType, ParsedRelease[]>): ClientDeployment[] {
    return this.mockClientDeployments.map(deployment => {
      const branchReleases = releasesByBranch[deployment.branch] || [];
      
      const currentIndex = branchReleases.findIndex(
        r => r.title === deployment.currentReleaseTitle
      );
      
      const currentRelease = branchReleases[currentIndex];
      if (!currentRelease) {
        // Fallback to latest if not found
        return {
          clientName: deployment.clientName,
          branch: deployment.branch,
          currentRelease: branchReleases[0] || ({} as ParsedRelease),
          latestAvailable: branchReleases[0]
        };
      }

      return {
        clientName: deployment.clientName,
        branch: deployment.branch,
        currentRelease,
        previousRelease: branchReleases[currentIndex + 1],
        nextRelease: branchReleases[currentIndex - 1],
        latestAvailable: branchReleases[0]
      };
    });
  }
}

export const diffService = new DiffService();