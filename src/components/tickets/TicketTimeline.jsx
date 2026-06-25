import { formatDateTime } from '../../utils/ticketHelpers';
import {
  Plus,
  UserPlus,
  RefreshCw,
  ArrowRight,
  Ban,
  CheckCircle,
  MessageSquare,
  Lock,
} from 'lucide-react';

const ACTION_ICONS = {
  Created: Plus,
  Assigned: UserPlus,
  Reassigned: RefreshCw,
  'Status Changed': ArrowRight,
  'Priority Changed': ArrowRight,
  Blocked: Ban,
  Unblocked: CheckCircle,
  Resolved: CheckCircle,
  Closed: Lock,
  'Comment Added': MessageSquare,
  'Readiness Changed': RefreshCw,
  Updated: RefreshCw,
};

function formatMetadata(action, metadata) {
  if (!metadata || !Object.keys(metadata).length) return null;

  switch (action) {
    case 'Status Changed':
      return `${metadata.from} → ${metadata.to}`;
    case 'Assigned':
      return `Assigned to ${metadata.assignee}`;
    case 'Reassigned':
      return `${metadata.from} → ${metadata.to}`;
    case 'Blocked':
      return metadata.reason;
    case 'Resolved':
      return metadata.summary;
    case 'Comment Added':
      return metadata.type;
    case 'Priority Changed':
      return `${metadata.from} → ${metadata.to}`;
    case 'Readiness Changed':
      return `${metadata.from} → ${metadata.to}`;
    default:
      return JSON.stringify(metadata);
  }
}

export function TicketTimeline({ history }) {
  const sorted = [...history].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (!sorted.length) {
    return <p className="text-sm text-slate-500">No history yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sorted.map((entry, index) => {
        const Icon = ACTION_ICONS[entry.action] || ArrowRight;
        const detail = formatMetadata(entry.action, entry.metadata);

        return (
          <div key={entry.id} className="relative flex gap-3 pl-1">
            {index < sorted.length - 1 && (
              <div className="absolute left-[15px] top-8 h-full w-px bg-slate-200 dark:bg-slate-700" />
            )}
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
              <Icon size={14} />
            </div>
            <div className="min-w-0 flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{entry.action}</span>
                <span className="text-xs text-slate-500">by {entry.actor}</span>
              </div>
              {detail && (
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{detail}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">{formatDateTime(entry.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
