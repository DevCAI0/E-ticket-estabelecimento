import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TicketsList } from "@/components/tickets/tickets-list";

export function TicketsPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Tickets</h1>
      </div>
      <TicketsList />
    </div>
  );
}
