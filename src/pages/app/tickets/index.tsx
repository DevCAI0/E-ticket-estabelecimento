// Na sua página
import { TicketsList } from "@/components/tickets/tickets-list";

export function TicketsPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 text-2xl font-bold">Histórico de Tickets</h1>
      <TicketsList />
    </div>
  );
}
