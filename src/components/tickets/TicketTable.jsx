import { Eye, AlertTriangle } from 'lucide-react';
import { PriorityBadge, StatusBadge, ReadinessBadge, BlockedBadge } from '../ui/Badge';
import { Button } from '../ui/Card';
import { formatRelativeTime } from '../../utils/ticketHelpers';
import { cn } from '../../utils/ticketHelpers';

export function TicketTable({ tickets, onView }) {
  if (!tickets.length) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">
        No tickets match your filters.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-900/50">
              <th className="px-4 py-3 font-medium text-slate-500">ID</th>
              <th className="px-4 py-3 font-medium text-slate-500">Title</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500">Priority</th>
              <th className="px-4 py-3 font-medium text-slate-500">Readiness</th>
              <th className="px-4 py-3 font-medium text-slate-500">Owner</th>
              <th className="px-4 py-3 font-medium text-slate-500">Updated</th>
              <th className="px-4 py-3 font-medium text-slate-500"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className={cn(
                  'border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50',
                  ticket.isBlocked && 'bg-red-50/50 dark:bg-red-950/20',
                  ticket.priority === 'Critical' && 'border-l-4 border-l-red-500'
                )}
              >
                <td className="px-4 py-3 font-mono text-xs font-medium">{ticket.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {ticket.isBlocked && <AlertTriangle size={14} className="text-red-500" />}
                    <span className="font-medium">{ticket.title}</span>
                  </div>
                  <span className="text-xs text-slate-500">{ticket.category}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <StatusBadge status={ticket.status} />
                    {ticket.isBlocked && <BlockedBadge />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-4 py-3">
                  <ReadinessBadge readiness={ticket.readiness} />
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {ticket.assignee || 'Unassigned'}
                </td>
                <td className="px-4 py-3 text-slate-500">{formatRelativeTime(ticket.updatedAt)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" onClick={() => onView(ticket)}>
                    <Eye size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TicketCard({ ticket, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'card w-full p-3 text-left transition hover:shadow-md',
        ticket.isBlocked && 'border-red-300 ring-1 ring-red-200 dark:border-red-800 dark:ring-red-900',
        ticket.priority === 'Critical' && 'border-l-4 border-l-red-500'
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-slate-500">{ticket.id}</span>
        <PriorityBadge priority={ticket.priority} />
      </div>
      <p className="mb-2 line-clamp-2 text-sm font-medium">{ticket.title}</p>
      <div className="mb-2 flex flex-wrap gap-1">
        <StatusBadge status={ticket.status} />
        <ReadinessBadge readiness={ticket.readiness} />
        {ticket.isBlocked && <BlockedBadge />}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{ticket.assignee || 'Unassigned'}</span>
        <span>{formatRelativeTime(ticket.updatedAt)}</span>
      </div>
      {ticket.isBlocked && ticket.blockerReason && (
        <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {ticket.blockerReason}
        </p>
      )}
    </button>
  );
}
