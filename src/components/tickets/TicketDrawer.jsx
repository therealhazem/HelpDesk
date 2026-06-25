import { useState } from 'react';
import {
  User,
  Calendar,
  Tag,
  Ban,
  CheckCircle,
  Trash2,
  Edit,
} from 'lucide-react';
import { Drawer, Modal, ConfirmDialog } from '../ui/Modal';
import { PriorityBadge, StatusBadge, ReadinessBadge, BlockedBadge } from '../ui/Badge';
import { Button, Select, Textarea, Card } from '../ui/Card';
import { TicketTimeline } from './TicketTimeline';
import { TicketComments } from './TicketComments';
import { TicketForm } from './TicketForm';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/ticketHelpers';
import { AGENTS, STATUSES } from '../../data/constants';
import { canTransition } from '../../utils/workflow';

export function TicketDrawer({ ticketId, open, onClose }) {
  const {
    currentUser,
    currentRole,
    assignTicket,
    changeStatus,
    blockTicket,
    unblockTicket,
    deleteTicket,
    updateTicket,
    getTicket,
  } = useApp();

  const ticket = ticketId ? getTicket(ticketId) : null;

  const [editOpen, setEditOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const [message, setMessage] = useState('');

  const freshTicket = ticket;

  if (!open || !freshTicket) return null;

  const isEmployee = currentRole === 'employee';
  const canManage = currentRole === 'agent' || currentRole === 'manager';
  const canDelete = currentRole === 'manager';
  const canAddInternal = canManage;

  const allowedStatuses = STATUSES.filter(
    (s) => s !== ticket.status && canTransition(ticket.status, s)
  );

  const handleAssign = () => {
    if (!assignee) {
      setMessage('Select an assignee.');
      return;
    }
    assignTicket(ticket.id, assignee, currentUser);
    setMessage('');
    setAssignee('');
  };

  const handleStatusChange = (status) => {
    if (status === 'Resolved' || status === 'Closed') {
      setTargetStatus(status);
      setResolveOpen(true);
      return;
    }
    if (status === 'Blocked') {
      setBlockOpen(true);
      return;
    }
    const result = changeStatus(ticket.id, status, currentUser);
    setMessage(result.success ? '' : result.error);
  };

  const handleBlock = () => {
    const result = blockTicket(ticket.id, blockReason, currentUser);
    if (result.success) {
      setBlockOpen(false);
      setBlockReason('');
      setMessage('');
    } else {
      setMessage(result.error);
    }
  };

  const handleResolve = () => {
    const result = changeStatus(ticket.id, targetStatus, currentUser, {
      resolutionNotes,
    });
    if (result.success) {
      setResolveOpen(false);
      setResolutionNotes('');
      setMessage('');
    } else {
      setMessage(result.error);
    }
  };

  const handleEdit = (data, err) => {
    if (err) {
      setMessage(err);
      return;
    }
    updateTicket(ticket.id, data, currentUser);
    setEditOpen(false);
    setMessage('');
  };

  return (
    <>
      <Drawer open={open} onClose={onClose} title={freshTicket.id}>
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <PriorityBadge priority={freshTicket.priority} />
              <StatusBadge status={freshTicket.status} />
              <ReadinessBadge readiness={freshTicket.readiness} />
              {freshTicket.isBlocked && <BlockedBadge />}
            </div>
            <h3 className="text-lg font-semibold">{freshTicket.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {freshTicket.description}
            </p>
          </div>

          {freshTicket.isBlocked && freshTicket.blockerReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                <Ban size={16} /> Blocker Reason
              </div>
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">{freshTicket.blockerReason}</p>
            </div>
          )}

          <Card className="grid gap-3 p-4 sm:grid-cols-2">
            <InfoRow icon={User} label="Requester" value={freshTicket.requester} />
            <InfoRow icon={User} label="Assignee" value={freshTicket.assignee || 'Unassigned'} />
            <InfoRow icon={Tag} label="Category" value={freshTicket.category} />
            <InfoRow icon={Calendar} label="Created" value={formatDateTime(freshTicket.createdAt)} />
            <InfoRow icon={Calendar} label="Updated" value={formatDateTime(freshTicket.updatedAt)} />
          </Card>

          {freshTicket.resolutionNotes && (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle size={16} /> Resolution Notes
              </div>
              <p className="mt-2 text-sm">{freshTicket.resolutionNotes}</p>
            </Card>
          )}

          {message && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30">{message}</p>
          )}

          {canManage && (
            <Card className="space-y-3 p-4">
              <h4 className="text-sm font-semibold">Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  <Edit size={14} /> Edit
                </Button>
                {freshTicket.isBlocked ? (
                  <Button variant="secondary" onClick={() => unblockTicket(freshTicket.id, currentUser)}>
                    Unblock
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => setBlockOpen(true)}>
                    <Ban size={14} /> Block
                  </Button>
                )}
                {canDelete && (
                  <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Assign / Reassign"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  options={[{ value: '', label: 'Select agent...' }, ...AGENTS.map((a) => ({ value: a, label: a }))]}
                />
                <div className="flex items-end">
                  <Button onClick={handleAssign} className="w-full">
                    Assign
                  </Button>
                </div>
              </div>

              {allowedStatuses.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">Change Status</p>
                  <div className="flex flex-wrap gap-2">
                    {allowedStatuses.map((status) => (
                      <Button key={status} variant="secondary" onClick={() => handleStatusChange(status)}>
                        → {status}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {isEmployee && (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Edit size={14} /> Edit Ticket
            </Button>
          )}

          <TicketComments ticket={freshTicket} canAddInternal={canAddInternal} />

          <div>
            <h3 className="mb-4 text-sm font-semibold">Timeline</h3>
            <TicketTimeline history={freshTicket.history} />
          </div>
        </div>
      </Drawer>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Ticket">
        <TicketForm
          initialData={freshTicket}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          showAssignee={canManage}
          showReadiness={canManage}
          showResolution={canManage}
        />
      </Modal>

      <Modal open={blockOpen} onClose={() => setBlockOpen(false)} title="Mark as Blocked">
        <Textarea
          label="Blocker Reason"
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          placeholder="Describe what is blocking progress..."
        />
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setBlockOpen(false)}>Cancel</Button>
          <Button onClick={handleBlock}>Block Ticket</Button>
        </div>
      </Modal>

      <Modal open={resolveOpen} onClose={() => setResolveOpen(false)} title={`Mark as ${targetStatus}`}>
        <Textarea
          label="Resolution Notes"
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          placeholder="Describe the resolution..."
        />
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setResolveOpen(false)}>Cancel</Button>
          <Button onClick={handleResolve}>Confirm</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteTicket(freshTicket.id, currentUser);
          setDeleteOpen(false);
          onClose();
        }}
        title="Delete Ticket"
        message="This will permanently remove the ticket from your workspace."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="mt-0.5 text-slate-400" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
