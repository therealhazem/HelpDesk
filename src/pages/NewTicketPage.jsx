import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/Layout';
import { TicketForm } from '../components/tickets/TicketForm';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';

export function NewTicketPage() {
  const { createTicket, currentUser, currentRole } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (data, error) => {
    if (error) return;
    const ticket = createTicket(
      {
        ...data,
        requester: currentRole === 'employee' ? currentUser : data.requester || currentUser,
      },
      currentUser
    );
    navigate('/tickets', { state: { openTicket: ticket.id } });
  };

  return (
    <div>
      <PageHeader
        title="Create Ticket"
        description="Submit a new support request with clear details."
      />
      <Card className="max-w-2xl">
        <TicketForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/tickets')}
          submitLabel="Create Ticket"
          showAssignee={currentRole !== 'employee'}
        />
      </Card>
    </div>
  );
}
