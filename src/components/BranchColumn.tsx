import { ParsedRelease, BranchType } from '@/types/release';
import { ReleaseCard } from './ReleaseCard';
import { GitBranch, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchColumnProps {
  branch: BranchType;
  releases: ParsedRelease[];
  isLoading: boolean;
}

const branchConfig = {
  dev: {
    title: 'Development',
    icon: GitBranch,
    className: 'branch-indicator-dev',
    description: 'Latest development releases'
  },
  stage: {
    title: 'Staging',
    icon: Package,
    className: 'branch-indicator-stage',
    description: 'Pre-production releases'
  },
  main: {
    title: 'Production',
    icon: Package,
    className: 'branch-indicator-main',
    description: 'Production releases'
  }
};

export const BranchColumn = ({ branch, releases, isLoading }: BranchColumnProps) => {
  const config = branchConfig[branch];
  const Icon = config.icon;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          <div>
            <div className="w-24 h-5 bg-muted rounded animate-pulse mb-1" />
            <div className="w-32 h-3 bg-muted rounded animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-card-border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-32 h-5 bg-muted rounded animate-pulse" />
                <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              </div>
              <div className="w-24 h-4 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-3 bg-muted rounded animate-pulse" />
                <div className="w-3/4 h-3 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className={cn("p-2 rounded-full", config.className)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{config.title}</h2>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {releases.length > 0 ? (
          releases.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No releases found for {branch} branch</p>
          </div>
        )}
      </div>
    </div>
  );
};