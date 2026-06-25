export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(isoString);
}

export function generateTicketId(existingTickets) {
  const year = new Date().getFullYear();
  const prefix = `HD-${year}-`;
  const numbers = existingTickets
    .map((t) => t.id)
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ''), 10))
    .filter((n) => !Number.isNaN(n));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(6, '0')}`;
}

export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function sortTickets(tickets, sortBy) {
  const sorted = [...tickets];
  switch (sortBy) {
    case 'priority':
      sorted.sort((a, b) => {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
      });
      break;
    case 'date':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'readiness':
      sorted.sort((a, b) => a.readiness.localeCompare(b.readiness));
      break;
    default:
      break;
  }
  return sorted;
}

export function filterTickets(tickets, filters) {
  return tickets.filter((ticket) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        ticket.id.toLowerCase().includes(q) ||
        ticket.title.toLowerCase().includes(q) ||
        (ticket.assignee || '').toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filters.status && filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.priority && filters.priority !== 'all' && ticket.priority !== filters.priority)
      return false;
    if (filters.category && filters.category !== 'all' && ticket.category !== filters.category)
      return false;
    if (filters.readiness && filters.readiness !== 'all' && ticket.readiness !== filters.readiness)
      return false;
    if (filters.blocked === 'yes' && !ticket.isBlocked) return false;
    if (filters.blocked === 'no' && ticket.isBlocked) return false;
    return true;
  });
}

export function getTicketsForRole(tickets, role, userName) {
  switch (role) {
    case 'employee':
      return tickets.filter((t) => t.requester === userName);
    case 'agent':
      return tickets.filter((t) => t.assignee === userName || t.status === 'New');
    case 'manager':
      return tickets;
    default:
      return tickets;
  }
}
