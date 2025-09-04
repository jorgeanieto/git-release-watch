import { useState, useEffect } from 'react';
import { Eye, GitBranch, FileText, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiPreviewResponse } from '@/types/api';
import { releaseRadarAPI } from '@/services/api';
import { JiraBadge } from './JiraBadge';
import { formatDistanceToNow } from 'date-fns';

interface PreviewViewProps {
  client: string;
}

const AVAILABLE_BRANCHES = ['dev', 'stage', 'main', 'feature/new-feature', 'hotfix/urgent-fix'];

export const PreviewView = ({ client }: PreviewViewProps) => {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [previewData, setPreviewData] = useState<ApiPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!selectedBranch) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const preview = await releaseRadarAPI.previewBranchDeployment(client, selectedBranch);
      setPreviewData(preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview deployment');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="w-3 h-3 text-green-500" />;
      case 'deleted':
        return <FileText className="w-3 h-3 text-red-500" />;
      default:
        return <FileText className="w-3 h-3 text-blue-500" />;
    }
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'deleted':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview Branch Deployment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Branch to Deploy</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch to preview" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        {branch}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handlePreview} 
            disabled={!selectedBranch || isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating Preview...' : 'Preview Deployment'}
          </Button>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Preview Results */}
      {previewData && !isLoading && (
        <div className="space-y-6">
          {/* Preview Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Current Release</h4>
                  <Badge variant="outline" className="font-mono">
                    {previewData.current_ref.substring(0, 8)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Preview Release</h4>
                  <Badge variant="default" className="font-mono">
                    {previewData.preview_ref.substring(0, 8)}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{previewData.commits.length}</div>
                  <p className="text-sm text-muted-foreground">New Commits</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{previewData.files_changed.length}</div>
                  <p className="text-sm text-muted-foreground">Files Changed</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{previewData.new_issues.length}</div>
                  <p className="text-sm text-muted-foreground">New Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="commits" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="commits">
                Commits ({previewData.commits.length})
              </TabsTrigger>
              <TabsTrigger value="files">
                Files ({previewData.files_changed.length})
              </TabsTrigger>
              <TabsTrigger value="issues">
                Issues ({previewData.new_issues.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="commits">
              <Card>
                <CardHeader>
                  <CardTitle>New Commits</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewData.commits.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No new commits</p>
                  ) : (
                    <div className="space-y-3">
                      {previewData.commits.map((commit) => (
                        <div key={commit.hash} className="border-l-2 border-muted pl-4 pb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              {commit.hash.substring(0, 7)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{commit.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{commit.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Files Changed</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewData.files_changed.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No files changed</p>
                  ) : (
                    <div className="space-y-2">
                      {previewData.files_changed.map((file, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getFileStatusColor(file.status)}`}>
                          <div className="flex items-center gap-2">
                            {getFileStatusIcon(file.status)}
                            <span className="font-mono text-sm">{file.path}</span>
                            <Badge variant="outline" className="ml-auto">
                              {file.status}
                            </Badge>
                          </div>
                          <div className="text-xs mt-1">
                            <span className="text-green-600">+{file.additions}</span>
                            {' '}
                            <span className="text-red-600">-{file.deletions}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issues">
              <Card>
                <CardHeader>
                  <CardTitle>New Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewData.new_issues.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No new issues</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {previewData.new_issues.map((issueKey) => (
                        <JiraBadge key={issueKey} ticketId={issueKey} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};