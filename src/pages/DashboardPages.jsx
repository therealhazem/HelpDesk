import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/layout/Layout';
import { StatCard } from '../components/ui/Card';
import { StatusChart, PriorityChart, WorkloadChart, ActivityFeed } from '../components/charts/DashboardCharts';
import { useTicketStats } from '../hooks/useTickets';
import { Ticket, CheckCircle } from 'lucide-react';

export function EmployeeDashboard() {
  const stats = useTicketStats();

  return (
    <div>
      <PageHeader
        title="Employee Dashboard"
        description="Track your support requests and recent activity."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Open Tickets" value={stats.open} icon={Ticket} accent="brand" />
        <StatCard title="Resolved Tickets" value={stats.resolved} icon={CheckCircle} accent="green" />
      </div>
      <div className="mt-6">
        <ActivityFeed activities={stats.recentActivity} />
      </div>
    </div>
  );
}

export function AgentDashboard() {
  const stats = useTicketStats();
  const { tickets, currentUser } = useApp();

  const assignedTickets = tickets.filter((t) => t.assignee === currentUser);
  const blockedTickets = assignedTickets.filter((t) => t.isBlocked);
  const inProgressTickets = assignedTickets.filter((t) => t.status === 'In Progress');

  return (
    <div>
      <PageHeader
        title="Agent Dashboard"
        description="Your assigned workload and blocked items."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Assigned Tickets" value={stats.assigned} icon={Ticket} accent="brand" />
        <StatCard title="Blocked Tickets" value={blockedTickets.length} icon={Ticket} accent="red" />
        <StatCard title="In Progress" value={inProgressTickets.length} icon={Ticket} accent="amber" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BlockedWidget tickets={blockedTickets} />
        <InProgressWidget tickets={inProgressTickets} />
      </div>
    </div>
  );
}

export function ManagerDashboard() {
  const stats = useTicketStats();

  return (
    <div>
      <PageHeader
        title="Manager Dashboard"
        description="Team-wide visibility into ticket volume and workload."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tickets" value={stats.total} icon={Ticket} accent="brand" />
        <StatCard title="Open Tickets" value={stats.open} icon={Ticket} accent="amber" />
        <StatCard title="Blocked Tickets" value={stats.blocked} icon={Ticket} accent="red" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} accent="green" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <StatusChart data={stats.byStatus} />
        <PriorityChart data={stats.byPriority} />
      </div>
      <div className="mt-4">
        <WorkloadChart data={stats.workloadData} />
      </div>
    </div>
  );
}

function BlockedWidget({ tickets }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold">Blocked Tickets</h3>
      {!tickets.length ? (
        <p className="text-sm text-slate-500">No blocked tickets assigned to you.</p>
      ) : (
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950/30">
              <span className="font-mono text-xs">{t.id}</span>
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-red-600 dark:text-red-400">{t.blockerReason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InProgressWidget({ tickets }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold">In Progress</h3>
      {!tickets.length ? (
        <p className="text-sm text-slate-500">No tickets in progress.</p>
      ) : (
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <span className="font-mono text-xs text-slate-500">{t.id}</span>
              <p className="font-medium">{t.title}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export function DashboardRouter() {
  const { currentRole } = useApp();

  if (currentRole === 'employee') return <EmployeeDashboard />;
  if (currentRole === 'agent') return <AgentDashboard />;
  if (currentRole === 'manager') return <ManagerDashboard />;

  return <Navigate to="/dashboard/employee" replace />;
}
