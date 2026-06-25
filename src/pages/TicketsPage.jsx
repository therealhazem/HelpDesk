import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/Layout';
import { TicketFilters, defaultFilters } from '../components/tickets/TicketFilters';
import { TicketTable } from '../components/tickets/TicketTable';
import { TicketDrawer } from '../components/tickets/TicketDrawer';
import { useScopedTickets } from '../hooks/useTickets';
import { Button } from '../components/ui/Card';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TicketsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...defaultFilters,
    search: searchParams.get('search') || '',
  });
  const [selectedId, setSelectedId] = useState(null);

  const tickets = useScopedTickets(filters);

  return (
    <div>
      <PageHeader
        title="Tickets"
        description="Search, filter, and manage support tickets."
        actions={
          <Link to="/tickets/new">
            <Button>
              <Plus size={16} /> New Ticket
            </Button>
          </Link>
        }
      />

      <div className="mb-4">
        <TicketFilters filters={filters} onChange={setFilters} />
      </div>

      <TicketTable tickets={tickets} onView={(t) => setSelectedId(t.id)} />

      <TicketDrawer
        ticketId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
