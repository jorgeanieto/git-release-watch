import { useState, useEffect } from 'react';
import { Calendar, GitCommit, ExternalLink, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiRelease } from '@/types/api';
import { releaseRadarAPI } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

interface ReleasesTimelineProps {
  client: string;
}

export const ReleasesTimeline = ({ client }: ReleasesTimelineProps) => {
  const [releases, setReleases] = useState<ApiRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedReleases = await releaseRadarAPI.getClientReleases(client);
        setReleases(fetchedReleases);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch releases');
      } finally {
        setIsLoading(false);
      }
    };

    if (client) {
      fetchReleases();
    }
  }, [client]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <ExternalLink className="w-4 h-4" />
            <span className="font-medium">Error loading releases</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (releases.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <GitCommit className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No releases found for {client}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {releases.map((release, index) => (
        <Card key={`${release.ref}-${index}`} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {release.version}
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                {release.ref.substring(0, 8)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <time dateTime={release.date}>
                  {formatDistanceToNow(new Date(release.date), { addSuffix: true })}
                </time>
              </div>
              {release.commits && release.commits.length > 0 && (
                <div className="flex items-center gap-1">
                  <GitCommit className="w-4 h-4" />
                  <span>{release.commits.length} commits</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {release.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {release.description}
              </p>
            )}
            
            {release.issues_link && (
              <a
                href={release.issues_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                View Issues
              </a>
            )}

            {release.commits && release.commits.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Recent commits:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {release.commits.slice(0, 3).map((commit) => (
                    <div key={commit.hash} className="text-xs text-muted-foreground border-l-2 border-muted pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="bg-muted px-1 rounded">
                          {commit.hash.substring(0, 7)}
                        </code>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{commit.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(commit.date), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <p className="text-foreground">{commit.message}</p>
                    </div>
                  ))}
                  {release.commits.length > 3 && (
                    <p className="text-xs text-muted-foreground pl-3">
                      +{release.commits.length - 3} more commits
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};