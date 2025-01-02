import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCard } from "./ticket-card";
import { AnimatePresence } from "framer-motion";
import { TicketCardSkeleton } from "./ticket-card-skeleton";
import { isEqual } from "lodash";

interface Funcionario {
  id_funcionario: number;
  nome: string;
  cpf: string;
}

interface Ticket {
  id: number;
  numero: number;
  funcionario: Funcionario;
  tipo_refeicao: string;
  status: number;
  status_texto: string;
  data_emissao: string;
  expiracao: string;
  tempo_restante: string;
}

export function TicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const { user } = useAuth();
  const previousTickets = useRef<Ticket[]>([]);
  const pollInterval = 10000; // 10 seconds

  const fetchTickets = useCallback(async () => {
    if (!user?.id_restaurante) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<{
        tickets: {
          data: Ticket[];
        };
      }>(`/restaurantes/${user.id_restaurante}/tickets`);

      const newTickets = response.data.tickets.data;
      if (!isEqual(newTickets, previousTickets.current)) {
        setTickets(newTickets);
        previousTickets.current = newTickets;
      }
      setError(null);
    } catch {
      setError("Erro ao carregar tickets");
    } finally {
      setLoading(false);
    }
  }, [user?.id_restaurante]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, pollInterval);

    return () => clearInterval(interval);
  }, [fetchTickets]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100 &&
        visibleCount < tickets.length
      ) {
        setVisibleCount((prev) => Math.min(prev + 5, tickets.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, tickets.length]);

  return (
    <div className="space-y-4">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Histórico de Tickets {!loading && `(${tickets.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {loading ? (
              <>
                <TicketCardSkeleton />
                <TicketCardSkeleton />
                <TicketCardSkeleton />
              </>
            ) : error ? (
              <div className="flex h-40 flex-col items-center justify-center">
                <p className="text-destructive">{error}</p>
              </div>
            ) : (
              <AnimatePresence>
                {tickets.slice(0, visibleCount).map((ticket, index) => (
                  <TicketCard
                    key={ticket.id}
                    numero={ticket.numero}
                    funcionario={ticket.funcionario}
                    tipo_refeicao={ticket.tipo_refeicao}
                    data_emissao={ticket.data_emissao}
                    status_texto={ticket.status_texto}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
