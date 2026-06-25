import { useState } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { useApp } from '../context/AppContext';
import { getTicketsForRole, sortTickets } from '../utils/ticketHelpers';
import { READINESS } from '../data/constants';
import { TicketCard } from '../components/tickets/TicketTable';
import { TicketDrawer } from '../components/tickets/TicketDrawer';
import { Select } from '../components/ui/Card';

export function BacklogPage() {
  const { tickets, currentRole, currentUser } = useApp();
  const [sortBy, setSortBy] = useState('priority');
  const [selectedId, setSelectedId] = useState(null);

  const scoped = getTicketsForRole(tickets, currentRole, currentUser);

  return (
    <div>
      <PageHeader
        title="Backlog"
        description="Plan sprint readiness across all open tickets."
        actions={
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'priority', label: 'Sort by Priority' },
              { value: 'date', label: 'Sort by Date' },
              { value: 'readiness', label: 'Sort by Readiness' },
            ]}
            className="w-48"
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {READINESS.map((readiness) => {
          const columnTickets = sortTickets(
            scoped.filter((t) => t.readiness === readiness && !['Closed', 'Resolved'].includes(t.status)),
            sortBy
          );

          return (
            <div key={readiness}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{readiness}</h2>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
                  {columnTickets.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onClick={() => setSelectedId(ticket.id)} />
                ))}
                {!columnTickets.length && (
                  <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-700">
                    No tickets
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TicketDrawer
        ticketId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
