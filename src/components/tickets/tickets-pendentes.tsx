// src/components/tickets/tickets-pendentes.tsx
import { useState } from "react";
import { Ticket } from "@/types/ticket";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ResultadoVerificacao } from "@/types/reconhecimento-facial";
import DialogoReconhecimentoFacial from "../facial-recognition/DialogoReconhecimentoFacial";
import { useTicketService } from "@/services/ticket-service";
import { useTicketsPendentes } from "@/hooks/use-pending-tickets";

interface CardTicketProps {
  ticket: Ticket;
  aoRemover: (id: number) => void;
  aoAprovar: (ticket: Ticket) => void;
}

function CardTicket({ ticket, aoRemover, aoAprovar }: CardTicketProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium">
              #{ticket.numero}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {ticket.tipo_refeicao}
            </span>
          </div>
          <div>
            <p className="font-medium">{ticket.funcionario.nome}</p>
            <p className="text-xs text-muted-foreground">
              Expira em: {ticket.tempo_restante}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => aoRemover(ticket.id)}
              className="h-9 w-9 sm:w-auto sm:px-3"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Remover</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => aoAprovar(ticket)}
              className="h-9 px-3"
            >
              Aprovar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketsPendentes() {
  const { ticketsPendentes, removerTicket } = useTicketsPendentes();
  const [ticketSelecionado, setTicketSelecionado] = useState<Ticket | null>(
    null,
  );
  const [mostrarReconhecimento, setMostrarReconhecimento] = useState(false);
  const servicoTicket = useTicketService();

  const handleSucessoVerificacao = async (resultado: ResultadoVerificacao) => {
    try {
      if (ticketSelecionado && resultado.similaridade >= resultado.confianca) {
        await servicoTicket.aprovarTicket(ticketSelecionado.id, true);
        // Remover o ticket da lista de pendentes
        removerTicket(ticketSelecionado.id);
        toast.success("Ticket Aprovado", {
          description: "Reconhecimento facial confirmado com sucesso",
        });
        setMostrarReconhecimento(false);
        setTicketSelecionado(null);
      } else {
        toast.error("Verificação Falhou", {
          description: "Não foi possível confirmar a identidade",
        });
      }
    } catch {
      toast.error("Erro", {
        description: "Erro ao processar verificação facial",
      });
    }
  };

  const handleFecharReconhecimento = () => {
    setMostrarReconhecimento(false);
    setTicketSelecionado(null);
  };

  const handleAprovar = (ticket: Ticket) => {
    setTicketSelecionado(ticket);
    setMostrarReconhecimento(true);
  };

  return (
    <div className="w-full">
      <div className="space-y-3">
        {ticketsPendentes.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Nenhum ticket pendente de aprovação
            </p>
          </div>
        ) : (
          ticketsPendentes.map((ticket) => (
            <CardTicket
              key={ticket.id}
              ticket={ticket}
              aoRemover={removerTicket}
              aoAprovar={handleAprovar}
            />
          ))
        )}
      </div>

      {ticketSelecionado && (
        <DialogoReconhecimentoFacial
          open={mostrarReconhecimento}
          onSuccess={handleSucessoVerificacao}
          onClose={handleFecharReconhecimento}
          userId={
            ticketSelecionado.funcionario.id_funcionario?.toString() || ""
          }
          userName={ticketSelecionado.funcionario.nome}
        />
      )}
    </div>
  );
}
