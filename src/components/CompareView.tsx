import { useState, useEffect } from 'react';
import { ArrowRight, GitCommit, FileText, ExternalLink, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiRelease, ApiCompareResponse, JiraIssue } from '@/types/api';
import { releaseRadarAPI } from '@/services/api';
import { JiraBadge } from './JiraBadge';

interface CompareViewProps {
  client: string;
  releases: ApiRelease[];
}

export const CompareView = ({ client, releases }: CompareViewProps) => {
  const [fromRef, setFromRef] = useState<string>('');
  const [toRef, setToRef] = useState<string>('');
  const [compareData, setCompareData] = useState<ApiCompareResponse | null>(null);
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!fromRef || !toRef) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const [compareResponse, jiraResponse] = await Promise.all([
        releaseRadarAPI.compareReleases(client, fromRef, toRef),
        releaseRadarAPI.getJiraIssues(fromRef, toRef)
      ]);
      
      setCompareData(compareResponse);
      setJiraIssues(jiraResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare releases');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="w-3 h-3 text-green-500" />;
      case 'deleted':
        return <Minus className="w-3 h-3 text-red-500" />;
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
      {/* Comparison Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Releases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">From Release</label>
              <Select value={fromRef} onValueChange={setFromRef}>
                <SelectTrigger>
                  <SelectValue placeholder="Select starting release" />
                </SelectTrigger>
                <SelectContent>
                  {releases.map((release) => (
                    <SelectItem key={release.ref} value={release.ref}>
                      {release.version} ({release.ref.substring(0, 8)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mt-6" />
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">To Release</label>
              <Select value={toRef} onValueChange={setToRef}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target release" />
                </SelectTrigger>
                <SelectContent>
                  {releases.map((release) => (
                    <SelectItem key={release.ref} value={release.ref}>
                      {release.version} ({release.ref.substring(0, 8)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleCompare} 
            disabled={!fromRef || !toRef || isLoading}
            className="w-full"
          >
            {isLoading ? 'Comparing...' : 'Compare Releases'}
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

      {/* Comparison Results */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {compareData && !isLoading && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="commits">
              Commits ({compareData.commits.length})
            </TabsTrigger>
            <TabsTrigger value="files">
              Files ({compareData.files_changed.length})
            </TabsTrigger>
            <TabsTrigger value="issues">
              Issues ({compareData.issues_added.length + compareData.issues_removed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Commits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{compareData.commits.length}</div>
                  <p className="text-sm text-muted-foreground">New commits</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Files Changed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{compareData.files_changed.length}</div>
                  <p className="text-sm text-muted-foreground">Files modified</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {compareData.issues_added.length + compareData.issues_removed.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-green-600">+{compareData.issues_added.length}</span>
                    {' '}
                    <span className="text-red-600">-{compareData.issues_removed.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="commits">
            <Card>
              <CardHeader>
                <CardTitle>Commits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {compareData.commits.map((commit) => (
                    <div key={commit.hash} className="border-l-2 border-muted pl-4 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {commit.hash.substring(0, 7)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{commit.author}</span>
                        <span className="text-xs text-muted-foreground">{commit.date}</span>
                      </div>
                      <p className="text-sm">{commit.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Files Changed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {compareData.files_changed.map((file, index) => (
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <div className="space-y-4">
              {compareData.issues_added.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Issues Added</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {compareData.issues_added.map((issueKey) => (
                        <JiraBadge key={issueKey} ticketId={issueKey} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {compareData.issues_removed.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Issues Removed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {compareData.issues_removed.map((issueKey) => (
                        <JiraBadge key={issueKey} ticketId={issueKey} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {jiraIssues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>JIRA Issue Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {jiraIssues.map((issue) => (
                        <div key={issue.key} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <JiraBadge ticketId={issue.key} />
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{issue.status}</Badge>
                              <Badge variant="secondary">{issue.priority}</Badge>
                            </div>
                          </div>
                          <h4 className="font-medium mb-1">{issue.summary}</h4>
                          <div className="text-sm text-muted-foreground">
                            <span>Type: {issue.issue_type}</span>
                            {issue.assignee && <span className="ml-4">Assignee: {issue.assignee}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};