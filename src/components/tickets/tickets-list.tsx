import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCard } from "./ticket-card";
import { TicketCardSkeleton } from "./ticket-card-skeleton";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { TicketActions } from "./ticket-actions";
import Loading from "../Loading";
import { ArrowUp } from "lucide-react";

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

interface TicketsListProps {
  tickets: Ticket[];
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

  const filteredTickets = tickets.filter((ticket) => {
    const searchMatch =
      search.toLowerCase() === "" ||
      ticket.numero.toString().includes(search.toLowerCase()) ||
      ticket.funcionario.nome.toLowerCase().includes(search.toLowerCase());

    const mealTypeMatch =
      mealType === "all" || ticket.tipo_refeicao === mealType;

    return searchMatch && mealTypeMatch;
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                <TicketCard key={ticket.id} {...ticket} index={index} />
              ))}
            </AnimatePresence>

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
