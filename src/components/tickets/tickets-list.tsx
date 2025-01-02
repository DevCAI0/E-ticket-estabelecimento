import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCard } from "./ticket-card";
import { AnimatePresence } from "framer-motion";
import { TicketCardSkeleton } from "./ticket-card-skeleton";
import { isEqual } from "lodash";
import { TicketActions } from "./ticket-actions";

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
  data_hora_leitura_restaurante: string | null;
  usuario_leitura: {
    id: number;
    nome: string;
  } | null;
}

export function TicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const cached = localStorage.getItem("tickets");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(!tickets.length);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("all");
  const { user } = useAuth();
  const previousTickets = useRef<Ticket[]>([]);
  const isInitialMount = useRef(true);
  const pollInterval = 10000;

  const fetchTickets = useCallback(
    async (showLoading = true) => {
      if (!user?.id_restaurante) return;

      if (showLoading) setLoading(true);

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
          localStorage.setItem("tickets", JSON.stringify(newTickets));
        }

        setError(null);
      } catch {
        setError("Erro ao carregar tickets");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [user?.id_restaurante],
  );

  useEffect(() => {
    if (isInitialMount.current) {
      if (!tickets.length) {
        fetchTickets(true);
      }
      isInitialMount.current = false;
    } else {
      fetchTickets(false);
    }

    const interval = setInterval(() => {
      fetchTickets(false);
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchTickets, tickets.length]);

  const filteredTickets = tickets.filter((ticket) => {
    const searchTerm = search.toLowerCase().trim();
    return (
      (searchTerm === "" ||
        ticket.numero.toString().includes(searchTerm) ||
        ticket.funcionario?.nome.toLowerCase().includes(searchTerm)) &&
      (mealType === "all" || ticket.tipo_refeicao === mealType)
    );
  });

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100 &&
        visibleCount < filteredTickets.length
      ) {
        setVisibleCount((prev) => Math.min(prev + 15, filteredTickets.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, filteredTickets.length]);

  return (
    <div className="space-y-4">
      <TicketActions
        onSearchChange={setSearch}
        onMealTypeChange={setMealType}
      />

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Histórico de Tickets {!loading && `(${filteredTickets.length})`}
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
            ) : filteredTickets.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center">
                <p className="text-muted-foreground">
                  Nenhum ticket encontrado
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredTickets.slice(0, visibleCount).map((ticket, index) => (
                  <TicketCard
                    key={ticket.id}
                    numero={ticket.numero}
                    funcionario={ticket.funcionario}
                    tipo_refeicao={ticket.tipo_refeicao}
                    data_emissao={ticket.data_emissao}
                    status_texto={ticket.status_texto}
                    data_hora_leitura_restaurante={
                      ticket.data_hora_leitura_restaurante
                    }
                    usuario_leitura={ticket.usuario_leitura}
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
