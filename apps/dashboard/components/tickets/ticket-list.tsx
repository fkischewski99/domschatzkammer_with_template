import type { Ticket } from '@workspace/database';
import { TicketCard } from './ticket-card';

export interface TicketListProps {
  tickets: Ticket[];
  organizationId: string;
}

/**
 * Ticket List Component
 * Grid layout of ticket cards
 */
export function TicketList({ tickets, organizationId }: TicketListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          organizationId={organizationId}
        />
      ))}
    </div>
  );
}
