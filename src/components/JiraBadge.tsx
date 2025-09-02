import { ExternalLink } from 'lucide-react';

interface JiraBadgeProps {
  ticketId: string;
}

export const JiraBadge = ({ ticketId }: JiraBadgeProps) => {
  const jiraUrl = `https://agrarware.atlassian.net/browse/${ticketId}`;
  
  return (
    <a
      href={jiraUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="jira-badge group"
    >
      <span>{ticketId}</span>
      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};