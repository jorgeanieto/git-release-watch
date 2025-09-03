import { useState, useEffect } from 'react';
import { ParsedRelease, BranchType } from '@/types/release';
import { ReleasesService } from '@/services/releases';
import { BranchColumn } from './BranchColumn';
import { DiffView } from './DiffView';
import { RefreshCw, FileText, AlertCircle, GitCompareArrows, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const releasesService = new ReleasesService();

export const ReleasesDashboard = () => {
  const [releases, setReleases] = useState<Record<BranchType, ParsedRelease[]>>({
    dev: [],
    stage: [],
    main: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedReleases = await releasesService.fetchReleases();
      const categorized = releasesService.categorizeByBranch(fetchedReleases);
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

  useEffect(() => {
    fetchReleases();
  }, []);

  const totalReleases = Object.values(releases).flat().length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="dashboard-header sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Release Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Tracking releases from local data • {totalReleases} releases
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
                    Make sure the releases.json file exists in the public directory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="diff" className="flex items-center gap-2">
              <GitCompareArrows className="w-4 h-4" />
              Diff View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
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
          </TabsContent>

          <TabsContent value="diff">
            <DiffView releases={releases} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};