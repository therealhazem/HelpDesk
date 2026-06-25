import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState } from 'react';
import { STATUSES } from '../../data/constants';
import { KanbanColumn } from './KanbanColumn';
import { TicketCard } from '../tickets/TicketTable';
import { useApp } from '../../context/AppContext';
import { getTransitionError } from '../../utils/workflow';
import { Modal } from '../ui/Modal';
import { Textarea, Button } from '../ui/Card';

export function KanbanBoard({ tickets, onViewTicket }) {
  const { changeStatus, blockTicket, currentUser } = useApp();
  const [activeTicket, setActiveTicket] = useState(null);
  const [blockModal, setBlockModal] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columns = STATUSES.reduce((acc, status) => {
    acc[status] = tickets.filter((t) => t.status === status);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    const ticket = tickets.find((t) => t.id === event.active.id);
    setActiveTicket(ticket);
  };

  const handleDragEnd = (event) => {
    setActiveTicket(null);
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const newStatus = over.id;
    if (ticket.status === newStatus) return;

    const transitionError = getTransitionError(ticket.status, newStatus);
    if (transitionError) {
      setError(transitionError);
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (newStatus === 'Blocked') {
      setBlockModal(ticket);
      return;
    }

    if (newStatus === 'Resolved' || newStatus === 'Closed') {
      if (!ticket.resolutionNotes) {
        setError(`Resolution notes required to move to ${newStatus}. Open ticket to add notes.`);
        setTimeout(() => setError(''), 4000);
        return;
      }
    }

    const result = changeStatus(ticketId, newStatus, currentUser);
    if (!result.success) {
      setError(result.error);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleBlockConfirm = () => {
    if (!blockModal) return;
    const result = blockTicket(blockModal.id, blockReason, currentUser);
    if (result.success) {
      setBlockModal(null);
      setBlockReason('');
    } else {
      setError(result.error);
    }
  };

  const canDrag = true;

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tickets={columns[status]}
              onViewTicket={onViewTicket}
              canDrag={canDrag}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTicket ? (
            <div className="rotate-2 opacity-90">
              <TicketCard ticket={activeTicket} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal
        open={!!blockModal}
        onClose={() => {
          setBlockModal(null);
          setBlockReason('');
        }}
        title="Block Ticket"
      >
        <Textarea
          label="Blocker Reason"
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          placeholder="Why is this ticket blocked?"
        />
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setBlockModal(null)}>Cancel</Button>
          <Button onClick={handleBlockConfirm}>Confirm Block</Button>
        </div>
      </Modal>
    </>
  );
}
