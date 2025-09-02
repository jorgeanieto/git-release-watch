import { useState, useEffect } from 'react';
import { ParsedRelease, BranchType } from '@/types/release';
import { GitHubService } from '@/services/github';
import { BranchColumn } from './BranchColumn';
import { Settings, RefreshCw, Github, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export const GitHubDashboard = () => {
  const [releases, setReleases] = useState<Record<BranchType, ParsedRelease[]>>({
    dev: [],
    stage: [],
    main: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubService, setGithubService] = useState(new GitHubService('example', 'example'));
  const [showSettings, setShowSettings] = useState(false);
  const [owner, setOwner] = useState('example');
  const [repo, setRepo] = useState('example');

  const fetchReleases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedReleases = await githubService.fetchReleases();
      const categorized = githubService.categorizeByBranch(fetchedReleases);
      setReleases(categorized);
      toast({
        title: "Success",
        description: `Loaded ${fetchedReleases.length} releases successfully`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch releases';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = () => {
    setGithubService(new GitHubService(owner, repo));
    setShowSettings(false);
    toast({
      title: "Settings Updated",
      description: `Now tracking ${owner}/${repo}`,
    });
  };

  useEffect(() => {
    fetchReleases();
  }, [githubService]);

  const totalReleases = Object.values(releases).flat().length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="dashboard-header sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Github className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Release Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Tracking {owner}/{repo} • {totalReleases} releases
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReleases}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {showSettings && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Owner
                    </label>
                    <Input
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      placeholder="e.g. facebook"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Repository
                    </label>
                    <Input
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder="e.g. react"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpdateSettings}
                  className="mt-4"
                  size="sm"
                >
                  Update Repository
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Error Loading Releases</h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Make sure the repository exists and is public, or check your internet connection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <BranchColumn
            branch="dev"
            releases={releases.dev}
            isLoading={isLoading}
          />
          <BranchColumn
            branch="stage"
            releases={releases.stage}
            isLoading={isLoading}
          />
          <BranchColumn
            branch="main"
            releases={releases.main}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};