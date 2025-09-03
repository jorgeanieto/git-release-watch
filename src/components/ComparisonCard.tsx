import { ReleaseDiff } from '@/types/release';
import { JiraBadge } from './JiraBadge';
import { Calendar, ArrowRight, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComparisonCardProps {
  diff: ReleaseDiff;
  title: string;
  subtitle?: string;
}

export const ComparisonCard = ({ diff, title, subtitle }: ComparisonCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {diff.newTickets.length} new tasks
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Release Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* From Release */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">From</div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <div className="font-medium text-sm">{diff.fromRelease.title}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(diff.fromRelease.date)}</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* To Release */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">To</div>
            <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
              <div className="font-medium text-sm">{diff.toRelease.title}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(diff.toRelease.date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Changes */}
        <div className="space-y-4">
          {/* New Tickets */}
          {diff.newTickets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-foreground">
                  New Tasks ({diff.newTickets.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {diff.newTickets.map((ticket) => (
                  <JiraBadge key={ticket} ticketId={ticket} />
                ))}
              </div>
            </div>
          )}

          {/* Removed Tickets */}
          {diff.removedTickets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Minus className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-foreground">
                  Removed Tasks ({diff.removedTickets.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {diff.removedTickets.map((ticket) => (
                  <div key={ticket} className="opacity-60">
                    <JiraBadge ticketId={ticket} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Changes */}
          {diff.newTickets.length === 0 && diff.removedTickets.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <span className="text-sm">No task changes between these releases</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};