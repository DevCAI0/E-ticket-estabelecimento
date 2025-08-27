import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TicketsList } from "@/components/tickets/tickets-list";
import { useAuth } from "@/hooks/auth/useAuth";
import { useTicketsList } from "@/hooks/tickets/useTicketsList";

export function TicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, loading, hasMore, error, loadMoreTickets, refreshTickets } =
    useTicketsList();

  if (!user?.id_restaurante) {
    return (
      <div className="container py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Tickets</h1>
        </div>
        <p className="text-center text-gray-500">Restaurante não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="ml-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Tickets</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshTickets}
          disabled={loading}
          className="mr-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <TicketsList
        tickets={tickets}
        loading={loading}
        hasMore={hasMore}
        loadMoreTickets={loadMoreTickets}
      />
    </div>
  );
}
