// src/pages/tickets/aprovar-tickets.tsx
import { TicketsPendentes } from "@/components/tickets/tickets-pendentes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function AprovarTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const startPath = location.state?.startPath || "/";

  const handleBack = () => {
    navigate(startPath);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Aprovar Tickets</h1>
        </div>

        {/* Conteúdo */}
        <div className="mx-auto max-w-2xl">
          <TicketsPendentes />
        </div>
      </div>
    </div>
  );
}

export default AprovarTickets;
