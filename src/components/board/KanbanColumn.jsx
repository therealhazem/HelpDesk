import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { STATUS_COLORS } from '../../data/constants';
import { cn } from '../../utils/ticketHelpers';

export function KanbanColumn({ status, tickets, onViewTicket, canDrag }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50',
        isOver && 'ring-2 ring-brand-500/50',
        status === 'Blocked' && 'border-red-200 dark:border-red-900'
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3 dark:border-slate-800">
        <span className={cn('badge', STATUS_COLORS[status])}>{status}</span>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium dark:bg-slate-700">
          {tickets.length}
        </span>
      </div>

      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2" style={{ minHeight: 200, maxHeight: 'calc(100vh - 280px)' }}>
          {tickets.map((ticket) => (
            <KanbanCard
              key={ticket.id}
              ticket={ticket}
              onView={() => onViewTicket(ticket)}
              canDrag={canDrag}
            />
          ))}
          {tickets.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400">Drop tickets here</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
