import { useState, useEffect } from 'react';
import { ParsedRelease, BranchType, ClientDeployment, ReleaseDiff } from '@/types/release';
import { DiffService } from '@/services/diff';
import { ComparisonCard } from './ComparisonCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Users, Calendar } from 'lucide-react';

interface DiffViewProps {
  releases: Record<BranchType, ParsedRelease[]>;
}

const diffService = new DiffService();

export const DiffView = ({ releases }: DiffViewProps) => {
  const [clientDeployments, setClientDeployments] = useState<ClientDeployment[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedComparison, setSelectedComparison] = useState<'next' | 'latest'>('next');

  useEffect(() => {
    const deployments = diffService.getClientDeployments(releases);
    setClientDeployments(deployments);
    if (deployments.length > 0 && !selectedClient) {
      setSelectedClient(deployments[0].clientName);
    }
  }, [releases, selectedClient]);

  const selectedDeployment = clientDeployments.find(d => d.clientName === selectedClient);

  const getCurrentDiff = (): ReleaseDiff | null => {
    if (!selectedDeployment) return null;

    const targetRelease = selectedComparison === 'next' 
      ? selectedDeployment.nextRelease 
      : selectedDeployment.latestAvailable;

    if (!targetRelease || targetRelease.id === selectedDeployment.currentRelease.id) {
      return null;
    }

    return diffService.computeReleaseDiff(selectedDeployment.currentRelease, targetRelease);
  };

  const getPreviousDiff = (): ReleaseDiff | null => {
    if (!selectedDeployment?.previousRelease) return null;

    return diffService.computeReleaseDiff(
      selectedDeployment.previousRelease,
      selectedDeployment.currentRelease
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBranchColor = (branch: BranchType) => {
    switch (branch) {
      case 'main': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'stage': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'dev': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const currentDiff = getCurrentDiff();
  const previousDiff = getPreviousDiff();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Select Client
          </label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a client..." />
            </SelectTrigger>
            <SelectContent>
              {clientDeployments.map((deployment) => (
                <SelectItem key={deployment.clientName} value={deployment.clientName}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{deployment.clientName}</span>
                    <Badge className={`text-xs ${getBranchColor(deployment.branch)}`}>
                      {deployment.branch}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Compare Against
          </label>
          <Select value={selectedComparison} onValueChange={(value: 'next' | 'latest') => setSelectedComparison(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">Next Release</SelectItem>
              <SelectItem value="latest">Latest Available</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Client Overview */}
      {selectedDeployment && (
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              {selectedDeployment.clientName}
              <Badge className={getBranchColor(selectedDeployment.branch)}>
                <GitBranch className="w-3 h-3 mr-1" />
                {selectedDeployment.branch}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Current Deployment</div>
                <div className="font-semibold">{selectedDeployment.currentRelease.title}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(selectedDeployment.currentRelease.date)}</span>
                </div>
              </div>
              
              {selectedDeployment.nextRelease && (
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">Next Release</div>
                  <div className="font-semibold">{selectedDeployment.nextRelease.title}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(selectedDeployment.nextRelease.date)}</span>
                  </div>
                </div>
              )}

              {selectedDeployment.latestAvailable && (
                <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="text-sm text-muted-foreground mb-1">Latest Available</div>
                  <div className="font-semibold">{selectedDeployment.latestAvailable.title}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(selectedDeployment.latestAvailable.date)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Previous vs Current */}
        {previousDiff && (
          <ComparisonCard
            diff={previousDiff}
            title="Previous → Current"
            subtitle="Changes that were deployed to this client"
          />
        )}

        {/* Current vs Next/Latest */}
        {currentDiff && (
          <ComparisonCard
            diff={currentDiff}
            title={selectedComparison === 'next' ? 'Current → Next' : 'Current → Latest'}
            subtitle={`Changes that ${selectedComparison === 'next' ? 'will be' : 'would be'} deployed`}
          />
        )}

        {/* No comparisons available */}
        {!previousDiff && !currentDiff && selectedDeployment && (
          <Card className="lg:col-span-2">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <div className="mb-2">No comparisons available for this client</div>
                <div className="text-sm">
                  {selectedDeployment.currentRelease.title} appears to be the only available release
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};