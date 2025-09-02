import { ParsedRelease } from '@/types/release';
import { JiraBadge } from './JiraBadge';
import { Calendar, ExternalLink, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ReleaseCardProps {
  release: ParsedRelease;
}

export const ReleaseCard = ({ release }: ReleaseCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="card-elevated hover:scale-[1.02] transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">{release.title}</h3>
          </div>
          <a
            href={release.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(release.date)}</span>
        </div>
      </CardHeader>
      
      {(release.description || release.jiraTickets.length > 0) && (
        <CardContent className="pt-0">
          {release.description && (
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {release.description.length > 150 
                ? release.description.substring(0, 150) + '...' 
                : release.description}
            </p>
          )}
          
          {release.jiraTickets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {release.jiraTickets.map((ticket, index) => (
                <JiraBadge key={index} ticketId={ticket} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};