// components/tickets/tickets-list.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCard } from "./ticket-card";
import { TicketCardSkeleton } from "./ticket-card-skeleton";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { TicketActions } from "./ticket-actions";
import Loading from "../Loading";
import { ArrowUp } from "lucide-react";
import { TicketItem } from "@/api/tickets/tickets-list";

interface TicketsListProps {
  tickets: TicketItem[];
  loading: boolean;
  hasMore: boolean;
  loadMoreTickets: () => void;
}

export function TicketsList({
  tickets,
  loading,
  hasMore,
  loadMoreTickets,
}: TicketsListProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hasScroll =
        window.innerHeight < document.documentElement.scrollHeight;
      setShowScrollTop(hasScroll);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initially
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tickets.length]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    await loadMoreTickets();
    setIsLoadingMore(false);
  };

  // Converter TicketItem[] para formato esperado pelo TicketCard
  const normalizedTickets = tickets.map((ticketItem) => ({
    id: ticketItem.data.id,
    numero: ticketItem.data.numero,
    funcionario: ticketItem.data.funcionario
      ? {
          id_funcionario: ticketItem.data.funcionario.id_funcionario,
          nome: ticketItem.data.funcionario.nome,
          cpf: ticketItem.data.funcionario.cpf,
        }
      : null,
    tipo_refeicao: ticketItem.data.tipo_refeicao,
    status: ticketItem.data.status,
    status_texto: ticketItem.data.status_texto,
    data_emissao: ticketItem.data.data_emissao,
    expiracao: ticketItem.data.expiracao || ticketItem.data.data_validade || "",
    tempo_restante: ticketItem.data.tempo_restante,
    data_hora_leitura_restaurante:
      ticketItem.data.data_hora_leitura_restaurante,
    usuario_leitura: ticketItem.data.usuario_leitura,
    // Campos adicionais para identificar tipo
    tipo: ticketItem.tipo,
    codigo: ticketItem.data.codigo,
  }));

  const filteredTickets = normalizedTickets.filter((ticket) => {
    // Verificar se funcionario existe antes de acessar nome
    const searchMatch =
      search.toLowerCase() === "" ||
      ticket.numero.toString().includes(search.toLowerCase()) ||
      (ticket.funcionario &&
        ticket.funcionario.nome.toLowerCase().includes(search.toLowerCase())) ||
      (ticket.codigo &&
        ticket.codigo.toLowerCase().includes(search.toLowerCase()));

    const mealTypeMatch =
      mealType === "all" || ticket.tipo_refeicao === mealType;

    return searchMatch && mealTypeMatch;
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Validação se tickets é array
  if (!Array.isArray(tickets)) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Erro: Dados de tickets inválidos
        </p>
      </div>
    );
  }

  if (loading && !isLoadingMore) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Histórico de Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <TicketCardSkeleton />
            <TicketCardSkeleton />
            <TicketCardSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-11 z-10 space-y-4 bg-background">
        <TicketActions
          onSearchChange={setSearch}
          onMealTypeChange={setMealType}
        />
        <div className="rounded-lg bg-card pl-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Histórico de Tickets ({filteredTickets.length})
          </h2>
        </div>
      </div>

      <Card className="border-none bg-card">
        <CardContent>
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {filteredTickets.map((ticket, index) => (
                <TicketCard
                  key={`${ticket.id}-${ticket.numero}-${index}`}
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

            {/* Mensagem quando não há tickets */}
            {filteredTickets.length === 0 && !loading && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {search || mealType !== "all"
                    ? "Nenhum ticket encontrado com os filtros aplicados"
                    : "Nenhum ticket encontrado"}
                </p>
              </div>
            )}

            {isLoadingMore && (
              <div className="py-4">
                <Loading
                  variant="dots"
                  size="md"
                  text="Carregando mais tickets..."
                  color="primary"
                />
              </div>
            )}

            <div className="mt-4 flex flex-col items-center gap-4">
              {hasMore && filteredTickets.length > 0 && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Carregando..." : "Ver Mais"}
                </Button>
              )}

              {showScrollTop && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollToTop}
                  className="rounded-full"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
