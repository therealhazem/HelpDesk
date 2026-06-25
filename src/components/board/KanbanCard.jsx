import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertTriangle } from 'lucide-react';
import { PriorityBadge, StatusBadge, ReadinessBadge, BlockedBadge } from '../ui/Badge';
import { formatRelativeTime, cn } from '../../utils/ticketHelpers';

export function KanbanCard({ ticket, onView, canDrag }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'card cursor-pointer p-3 transition hover:shadow-md',
        ticket.isBlocked && 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
        ticket.priority === 'Critical' && 'border-l-4 border-l-red-500'
      )}
      onClick={onView}
    >
      <div className="mb-2 flex items-start justify-between gap-1">
        <span className="font-mono text-[10px] text-slate-500">{ticket.id}</span>
        {canDrag && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </button>
        )}
      </div>

      <p className="mb-2 line-clamp-2 text-sm font-medium leading-snug">{ticket.title}</p>

      <div className="mb-2 flex flex-wrap gap-1">
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
        <ReadinessBadge readiness={ticket.readiness} />
        {ticket.isBlocked && <BlockedBadge />}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="truncate">{ticket.assignee || 'Unassigned'}</span>
        <span className="shrink-0">{formatRelativeTime(ticket.updatedAt)}</span>
      </div>

      {ticket.isBlocked && ticket.blockerReason && (
        <div className="mt-2 flex items-start gap-1 rounded bg-red-100 px-2 py-1 text-[10px] text-red-700 dark:bg-red-950/50 dark:text-red-300">
          <AlertTriangle size={10} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{ticket.blockerReason}</span>
        </div>
      )}
    </div>
  );
}
