import { cn } from '../../utils/ticketHelpers';
import { PRIORITY_COLORS, STATUS_COLORS, READINESS_COLORS, REVIEW_STATUS_COLORS } from '../../data/constants';

export function Badge({ children, className, variant = 'default' }) {
  return <span className={cn('badge', className)}>{children}</span>;
}

export function PriorityBadge({ priority }) {
  return (
    <span className={cn('badge', PRIORITY_COLORS[priority], priority === 'Critical' && 'animate-pulse-slow')}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <span className={cn('badge', STATUS_COLORS[status])}>{status}</span>;
}

export function ReadinessBadge({ readiness }) {
  return <span className={cn('badge', READINESS_COLORS[readiness])}>{readiness}</span>;
}

export function ReviewStatusBadge({ status }) {
  return <span className={cn('badge', REVIEW_STATUS_COLORS[status])}>{status}</span>;
}

export function BlockedBadge() {
  return (
    <span className="badge bg-red-600 text-white dark:bg-red-500">
      Blocked
    </span>
  );
}
