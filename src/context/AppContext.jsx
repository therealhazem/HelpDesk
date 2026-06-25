import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import {
  loadTickets,
  saveTickets,
  loadVerificationRecords,
  saveVerificationRecords,
  loadSettings,
  saveSettings,
  loadSprint,
  saveSprint,
} from '../utils/storage';
import { generateTicketId, generateId } from '../utils/ticketHelpers';
import {
  canTransition,
  getTransitionError,
  statusRequiresAssignee,
  statusRequiresResolution,
} from '../utils/workflow';
import { ROLE_USERS, ROLES } from '../data/constants';
import { now } from '../data/seedData';

const AppContext = createContext(null);

function addHistory(ticket, action, actor, metadata = {}) {
  return {
    ...ticket,
    history: [
      ...ticket.history,
      {
        id: generateId('hist'),
        action,
        actor,
        metadata,
        createdAt: now(),
      },
    ],
    updatedAt: now(),
  };
}

export function AppProvider({ children }) {
  const [tickets, setTicketsState] = useState(() => loadTickets());
  const [verificationRecords, setVerificationState] = useState(() => loadVerificationRecords());
  const [settings, setSettingsState] = useState(() => loadSettings());
  const [sprint, setSprintState] = useState(() => loadSprint());

  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    saveVerificationRecords(verificationRecords);
  }, [verificationRecords]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSprint(sprint);
  }, [sprint]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const currentRole = settings.role;
  const currentUser = ROLE_USERS[currentRole] || ROLE_USERS[ROLES.EMPLOYEE];

  const setRole = useCallback((role) => {
    setSettingsState((prev) => ({ ...prev, role }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettingsState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const getTicket = useCallback(
    (id) => tickets.find((t) => t.id === id),
    [tickets]
  );

  const createTicket = useCallback(
    (data, actor) => {
      const id = generateTicketId(tickets);
      const ticket = {
        id,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        priority: data.priority,
        status: 'New',
        readiness: 'Not Ready',
        requester: data.requester || actor,
        assignee: data.assignee || '',
        createdAt: now(),
        updatedAt: now(),
        isBlocked: false,
        blockerReason: '',
        statusBeforeBlock: null,
        resolutionNotes: '',
        inSprint: false,
        comments: [],
        history: [
          {
            id: generateId('hist'),
            action: 'Created',
            actor,
            metadata: {},
            createdAt: now(),
          },
        ],
      };

      if (ticket.assignee) {
        ticket.status = 'Assigned';
        ticket.history.push({
          id: generateId('hist'),
          action: 'Assigned',
          actor,
          metadata: { assignee: ticket.assignee },
          createdAt: now(),
        });
      }

      setTicketsState((prev) => [ticket, ...prev]);
      return ticket;
    },
    [tickets]
  );

  const updateTicket = useCallback((id, updates, actor) => {
    setTicketsState((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== id) return ticket;
        let updated = { ...ticket, ...updates, updatedAt: now() };
        const changes = [];

        if (updates.priority && updates.priority !== ticket.priority) {
          changes.push({
            action: 'Priority Changed',
            metadata: { from: ticket.priority, to: updates.priority },
          });
        }
        if (updates.readiness && updates.readiness !== ticket.readiness) {
          changes.push({
            action: 'Readiness Changed',
            metadata: { from: ticket.readiness, to: updates.readiness },
          });
        }

        changes.forEach(({ action, metadata }) => {
          updated = addHistory(updated, action, actor, metadata);
        });

        if (changes.length === 0 && Object.keys(updates).length > 0) {
          updated = addHistory(updated, 'Updated', actor, { fields: Object.keys(updates) });
        }

        return updated;
      })
    );
  }, []);

  const assignTicket = useCallback((id, assignee, actor, note = '') => {
    setTicketsState((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== id) return ticket;

        const isReassign = ticket.assignee && ticket.assignee !== assignee;
        let updated = {
          ...ticket,
          assignee,
          updatedAt: now(),
        };

        if (ticket.status === 'New') {
          updated.status = 'Assigned';
          updated = addHistory(updated, 'Assigned', actor, { assignee, note });
        } else if (isReassign) {
          updated = addHistory(updated, 'Reassigned', actor, {
            from: ticket.assignee,
            to: assignee,
            note,
          });
        } else if (!ticket.assignee) {
          updated = addHistory(updated, 'Assigned', actor, { assignee, note });
        }

        if (updated.status === 'New' && assignee) {
          updated.status = 'Assigned';
        }

        return updated;
      })
    );
  }, []);

  const changeStatus = useCallback(
    (id, newStatus, actor, options = {}) => {
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) return { success: false, error: 'Ticket not found' };

      const error = getTransitionError(ticket.status, newStatus);
      if (error) return { success: false, error };

      if (statusRequiresAssignee(newStatus) && !ticket.assignee && !options.assignee) {
        return { success: false, error: 'Assignee required for this status.' };
      }

      if (statusRequiresResolution(newStatus) && !options.resolutionNotes && !ticket.resolutionNotes) {
        return { success: false, error: 'Resolution notes required.' };
      }

      setTicketsState((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;

          let updated = {
            ...t,
            status: newStatus,
            updatedAt: now(),
          };

          if (newStatus === 'Blocked') {
            updated.isBlocked = true;
            updated.blockerReason = options.blockerReason || t.blockerReason;
            updated.statusBeforeBlock = t.status === 'Blocked' ? t.statusBeforeBlock : t.status;
            updated = addHistory(updated, 'Blocked', actor, {
              reason: updated.blockerReason,
              from: t.status,
            });
          } else if (t.status === 'Blocked' && newStatus !== 'Blocked') {
            updated.isBlocked = false;
            updated.blockerReason = '';
            updated.statusBeforeBlock = null;
            updated = addHistory(updated, 'Unblocked', actor, { to: newStatus });
            updated = addHistory(updated, 'Status Changed', actor, {
              from: 'Blocked',
              to: newStatus,
            });
          } else {
            updated.isBlocked = false;
            updated.blockerReason = '';
            updated.statusBeforeBlock = null;
            updated = addHistory(updated, 'Status Changed', actor, {
              from: t.status,
              to: newStatus,
            });
          }

          if (newStatus === 'Resolved' || newStatus === 'Closed') {
            updated.resolutionNotes = options.resolutionNotes || t.resolutionNotes;
          }

          if (newStatus === 'Resolved') {
            updated = addHistory(updated, 'Resolved', actor, {
              summary: updated.resolutionNotes,
            });
          }

          if (newStatus === 'Closed') {
            updated = addHistory(updated, 'Closed', actor, {});
          }

          return updated;
        })
      );

      return { success: true };
    },
    [tickets]
  );

  const blockTicket = useCallback((id, blockerReason, actor) => {
    if (!blockerReason.trim()) {
      return { success: false, error: 'Blocker reason is required.' };
    }
    return changeStatus(id, 'Blocked', actor, { blockerReason: blockerReason.trim() });
  }, [changeStatus]);

  const unblockTicket = useCallback(
    (id, actor) => {
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket || !ticket.isBlocked) {
        return { success: false, error: 'Ticket is not blocked.' };
      }
      const restoreStatus = ticket.statusBeforeBlock || 'In Progress';
      if (!canTransition('Blocked', restoreStatus)) {
        return changeStatus(id, 'In Progress', actor);
      }
      return changeStatus(id, restoreStatus, actor);
    },
    [tickets, changeStatus]
  );

  const deleteTicket = useCallback((id, actor) => {
    setTicketsState((prev) => prev.filter((t) => t.id !== id));
    setSprintState((prev) => ({
      ...prev,
      ticketIds: prev.ticketIds.filter((tid) => tid !== id),
    }));
  }, []);

  const addComment = useCallback((id, content, type, actor) => {
    if (!content.trim()) return { success: false, error: 'Comment cannot be empty.' };

    setTicketsState((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== id) return ticket;

        const comment = {
          id: generateId('comment'),
          author: actor,
          type,
          content: content.trim(),
          createdAt: now(),
        };

        let updated = {
          ...ticket,
          comments: [...ticket.comments, comment],
          updatedAt: now(),
        };

        updated = addHistory(updated, 'Comment Added', actor, {
          type: type === 'internal' ? 'Internal Note' : 'Public Comment',
        });

        return updated;
      })
    );

    return { success: true };
  }, []);

  const addToSprint = useCallback((ticketId) => {
    setSprintState((prev) => {
      if (prev.ticketIds.includes(ticketId)) return prev;
      return { ...prev, ticketIds: [...prev.ticketIds, ticketId] };
    });
    setTicketsState((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, inSprint: true, updatedAt: now() } : t))
    );
  }, []);

  const removeFromSprint = useCallback((ticketId) => {
    setSprintState((prev) => ({
      ...prev,
      ticketIds: prev.ticketIds.filter((id) => id !== ticketId),
    }));
    setTicketsState((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, inSprint: false, updatedAt: now() } : t))
    );
  }, []);

  const createVerificationRecord = useCallback((data) => {
    const record = {
      id: generateId('vr'),
      featureName: data.featureName.trim(),
      reviewStatus: data.reviewStatus,
      verificationStatus: data.verificationStatus || 'Pending',
      reviewer: data.reviewer,
      notes: data.notes || '',
      date: data.date || now(),
      createdAt: now(),
      updatedAt: now(),
    };
    setVerificationState((prev) => [record, ...prev]);
    return record;
  }, []);

  const updateVerificationRecord = useCallback((id, updates) => {
    setVerificationState((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: now() } : r
      )
    );
  }, []);

  const deleteVerificationRecord = useCallback((id) => {
    setVerificationState((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      tickets,
      verificationRecords,
      settings,
      sprint,
      currentRole,
      currentUser,
      setRole,
      toggleTheme,
      getTicket,
      createTicket,
      updateTicket,
      assignTicket,
      changeStatus,
      blockTicket,
      unblockTicket,
      deleteTicket,
      addComment,
      addToSprint,
      removeFromSprint,
      createVerificationRecord,
      updateVerificationRecord,
      deleteVerificationRecord,
    }),
    [
      tickets,
      verificationRecords,
      settings,
      sprint,
      currentRole,
      currentUser,
      setRole,
      toggleTheme,
      getTicket,
      createTicket,
      updateTicket,
      assignTicket,
      changeStatus,
      blockTicket,
      unblockTicket,
      deleteTicket,
      addComment,
      addToSprint,
      removeFromSprint,
      createVerificationRecord,
      updateVerificationRecord,
      deleteVerificationRecord,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
