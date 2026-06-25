import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getTicketsForRole, filterTickets } from '../utils/ticketHelpers';
import { isOpenStatus } from '../utils/workflow';

export function useScopedTickets(filters = {}) {
  const { tickets, currentRole, currentUser } = useApp();

  return useMemo(() => {
    const scoped = getTicketsForRole(tickets, currentRole, currentUser);
    return filterTickets(scoped, filters);
  }, [tickets, currentRole, currentUser, filters]);
}

export function useTicketStats() {
  const { tickets, currentRole, currentUser } = useApp();

  return useMemo(() => {
    const scoped = getTicketsForRole(tickets, currentRole, currentUser);

    const open = scoped.filter((t) => isOpenStatus(t.status));
    const resolved = scoped.filter((t) => ['Resolved', 'Closed'].includes(t.status));
    const blocked = scoped.filter((t) => t.isBlocked);
    const inProgress = scoped.filter((t) => t.status === 'In Progress');
    const assigned = scoped.filter(
      (t) => t.assignee === currentUser && isOpenStatus(t.status)
    );

    const byStatus = scoped.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = scoped.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});

    const agentWorkload = tickets.reduce((acc, t) => {
      if (t.assignee && isOpenStatus(t.status)) {
        acc[t.assignee] = (acc[t.assignee] || 0) + 1;
      }
      return acc;
    }, {});

    const workloadData = Object.entries(agentWorkload).map(([name, count]) => ({
      name: name.split(' ')[0],
      fullName: name,
      count,
    }));

    const recentActivity = scoped
      .flatMap((t) =>
        t.history.map((h) => ({
          ...h,
          ticketId: t.id,
          ticketTitle: t.title,
        }))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return {
      total: scoped.length,
      open: open.length,
      resolved: resolved.length,
      blocked: blocked.length,
      inProgress: inProgress.length,
      assigned: assigned.length,
      byStatus,
      byPriority,
      workloadData,
      recentActivity,
      allTickets: tickets,
    };
  }, [tickets, currentRole, currentUser]);
}
