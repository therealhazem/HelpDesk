import { useState } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { useApp } from '../context/AppContext';
import { getTicketsForRole } from '../utils/ticketHelpers';
import { SPRINT_NAME } from '../data/constants';
import { TicketCard } from '../components/tickets/TicketTable';
import { TicketDrawer } from '../components/tickets/TicketDrawer';
import { Button, StatCard } from '../components/ui/Card';
import { PriorityBadge } from '../components/ui/Badge';
import { Plus, Minus, Rocket } from 'lucide-react';
import { isOpenStatus } from '../utils/workflow';

export function SprintPage() {
  const { tickets, sprint, addToSprint, removeFromSprint, currentRole, currentUser } = useApp();
  const [selectedId, setSelectedId] = useState(null);

  const scoped = getTicketsForRole(tickets, currentRole, currentUser);
  const sprintTickets = scoped.filter((t) => sprint.ticketIds.includes(t.id));
  const availableTickets = scoped.filter(
    (t) => !sprint.ticketIds.includes(t.id) && isOpenStatus(t.status)
  );

  const workloadByPriority = sprintTickets.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  const blockedInSprint = sprintTickets.filter((t) => t.isBlocked).length;

  return (
    <div>
      <PageHeader
        title={SPRINT_NAME}
        description="Manage sprint scope and monitor workload."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Sprint Tickets"
          value={sprintTickets.length}
          icon={Rocket}
          accent="brand"
        />
        <StatCard
          title="Blocked in Sprint"
          value={blockedInSprint}
          subtitle="Requires attention"
          accent="red"
        />
        <StatCard
          title="Critical"
          value={workloadByPriority.Critical || 0}
          accent="red"
        />
        <StatCard
          title="High Priority"
          value={workloadByPriority.High || 0}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Sprint Backlog ({sprintTickets.length})</h2>
          <div className="space-y-3">
            {sprintTickets.map((ticket) => (
              <div key={ticket.id} className="relative">
                <TicketCard ticket={ticket} onClick={() => setSelectedId(ticket.id)} />
                <Button
                  variant="ghost"
                  className="absolute right-2 top-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromSprint(ticket.id);
                  }}
                >
                  <Minus size={14} /> Remove
                </Button>
              </div>
            ))}
            {!sprintTickets.length && (
              <p className="text-sm text-slate-500">No tickets in this sprint yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Available Tickets</h2>
          <div className="space-y-3">
            {availableTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="card flex items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedId(ticket.id)}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{ticket.id}</span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="truncate text-sm font-medium">{ticket.title}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => addToSprint(ticket.id)}
                >
                  <Plus size={14} /> Add
                </Button>
              </div>
            ))}
            {!availableTickets.length && (
              <p className="text-sm text-slate-500">No available tickets to add.</p>
            )}
          </div>
        </section>
      </div>

      <TicketDrawer
        ticketId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
