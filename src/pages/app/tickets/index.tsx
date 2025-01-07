import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TicketsList } from "@/components/tickets/tickets-list";
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

// Declare a interface do ticket
interface Ticket {
  id: number;
  numero: number;
  funcionario: {
    id_funcionario: number;
    nome: string;
    cpf: string;
  };
  tipo_refeicao: string;
  status: number;
  status_texto: string;
  data_emissao: string;
  expiracao: string;
  tempo_restante: string;
  data_hora_leitura_restaurante: string | null;
  usuario_leitura: {
    id: number;
    nome: string;
  } | null;
}

export function TicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchTickets = async (page = 1) => {
      try {
        const response = await api.get(
          `/restaurantes/${user?.id_restaurante}/tickets?page=${page}`,
        );

        const ticketsData = response.data.tickets.data;
        const totalPages = response.data.tickets.last_page;

        setTickets((prev) => [...prev, ...ticketsData]);
        setHasMore(page < totalPages);
      } catch (error) {
        console.error("Erro ao carregar tickets", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id_restaurante) {
      fetchTickets(currentPage);
    }
  }, [user, currentPage]);

  const loadMoreTickets = () => {
    if (hasMore && !loading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Tickets</h1>
      </div>
      <TicketsList
        tickets={tickets}
        loading={loading}
        hasMore={hasMore}
        loadMoreTickets={loadMoreTickets}
      />
    </div>
  );
}
