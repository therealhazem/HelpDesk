import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card } from '../ui/Card';
import { STATUSES, PRIORITIES } from '../../data/constants';

const STATUS_COLORS_CHART = {
  New: '#0ea5e9',
  Assigned: '#8b5cf6',
  'In Progress': '#6366f1',
  Blocked: '#ef4444',
  'Waiting For Requester': '#f59e0b',
  Resolved: '#10b981',
  Closed: '#6b7280',
};

const PRIORITY_COLORS_CHART = {
  Low: '#94a3b8',
  Medium: '#3b82f6',
  High: '#f97316',
  Critical: '#ef4444',
};

const tooltipStyle = {
  backgroundColor: 'var(--tooltip-bg, #1e293b)',
  border: 'none',
  borderRadius: '8px',
  color: '#f8fafc',
};

export function StatusChart({ data }) {
  const chartData = STATUSES.map((status) => ({
    name: status,
    count: data[status] || 0,
  })).filter((d) => d.count > 0);

  if (!chartData.length) {
    return <EmptyChart message="No status data" />;
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">Tickets by Status</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} />
          <YAxis type="category" dataKey="name" width={120} stroke="#94a3b8" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={STATUS_COLORS_CHART[entry.name] || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function PriorityChart({ data }) {
  const chartData = PRIORITIES.map((priority) => ({
    name: priority,
    value: data[priority] || 0,
  })).filter((d) => d.value > 0);

  if (!chartData.length) {
    return <EmptyChart message="No priority data" />;
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">Tickets by Priority</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={PRIORITY_COLORS_CHART[entry.name]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function WorkloadChart({ data }) {
  if (!data.length) {
    return <EmptyChart message="No workload data" />;
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">Agent Workload</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function EmptyChart({ message }) {
  return (
    <Card className="flex h-[300px] items-center justify-center">
      <p className="text-sm text-slate-500">{message}</p>
    </Card>
  );
}

export function ActivityFeed({ activities }) {
  if (!activities.length) {
    return (
      <Card>
        <h3 className="mb-4 text-sm font-semibold">Recent Activity</h3>
        <p className="text-sm text-slate-500">No recent activity.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.action}</span>
                {' on '}
                <span className="font-mono text-xs text-brand-600 dark:text-brand-400">
                  {activity.ticketId}
                </span>
              </p>
              <p className="truncate text-xs text-slate-500">{activity.ticketTitle}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">
              {new Date(activity.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TicketListWidget({ title, tickets, emptyMessage }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {!tickets.length ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {tickets.slice(0, 5).map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
            >
              <div className="min-w-0">
                <span className="font-mono text-xs text-slate-500">{t.id}</span>
                <p className="truncate font-medium">{t.title}</p>
              </div>
              <span className="ml-2 shrink-0 text-xs text-slate-500">{t.status}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
