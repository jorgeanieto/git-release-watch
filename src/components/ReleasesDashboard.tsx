import { useState, useEffect } from 'react';
import { ApiRelease } from '@/types/api';
import { releaseRadarAPI } from '@/services/api';
import { ReleasesTimeline } from './ReleasesTimeline';
import { CompareView } from './CompareView';
import { PreviewView } from './PreviewView';
import { ClientSelector } from './ClientSelector';
import { RefreshCw, FileText, AlertCircle, GitCompareArrows, BarChart3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

// Mock clients - in a real app, this would come from an API
const MOCK_CLIENTS = ['client-a', 'client-b', 'client-c', 'staging-env', 'production'];

export const ReleasesDashboard = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [releases, setReleases] = useState<ApiRelease[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = async () => {
    if (!selectedClient) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedReleases = await releaseRadarAPI.getClientReleases(selectedClient);
      setReleases(fetchedReleases);
      toast({
        title: "Success",
        description: `Loaded ${fetchedReleases.length} releases for ${selectedClient}`,
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
    if (selectedClient) {
      fetchReleases();
    }
  }, [selectedClient]);

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
                <h1 className="text-xl font-bold text-foreground">ReleaseRadar Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedClient ? `Tracking releases for ${selectedClient} • ${releases.length} releases` : 'Select a client to view releases'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ClientSelector
                clients={MOCK_CLIENTS}
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReleases}
                disabled={isLoading || !selectedClient}
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
        {!selectedClient ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Select a Client</h3>
              <p className="text-muted-foreground">
                Choose a client from the dropdown above to view their releases, compare versions, and preview deployments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-2">
                <GitCompareArrows className="w-4 h-4" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <ReleasesTimeline client={selectedClient} />
            </TabsContent>

            <TabsContent value="compare">
              <CompareView client={selectedClient} releases={releases} />
            </TabsContent>

            <TabsContent value="preview">
              <PreviewView client={selectedClient} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};