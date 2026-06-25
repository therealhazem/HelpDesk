import { useState } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { TicketDrawer } from '../components/tickets/TicketDrawer';
import { TicketFilters, defaultFilters } from '../components/tickets/TicketFilters';
import { useScopedTickets } from '../hooks/useTickets';

export function BoardPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedId, setSelectedId] = useState(null);
  const tickets = useScopedTickets(filters);

  return (
    <div>
      <PageHeader
        title="Kanban Board"
        description="Drag and drop tickets to update workflow status."
      />

      <div className="mb-4">
        <TicketFilters filters={filters} onChange={setFilters} />
      </div>

      <KanbanBoard tickets={tickets} onViewTicket={(t) => setSelectedId(t.id)} />

      <TicketDrawer
        ticketId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
