// src/components/tickets/tickets-pendentes.tsx
import { useState } from "react";
import { useTicketService } from "@/services/ticket-service";
import { Ticket } from "@/types/ticket";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { usePendingTickets } from "@/hooks/use-pending-tickets";
import { VerificationResult } from "@/types/face-recognition";
import FacialRecognitionDialog from "../facial-recognition/FacialRecognitionDialog";

interface TicketCardProps {
  ticket: Ticket;
  onRemove: (id: number) => void;
  onApprove: (ticket: Ticket) => void;
}

// Componente para o card individual do ticket
function TicketCard({ ticket, onRemove, onApprove }: TicketCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Cabeçalho do Ticket */}
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium">
              #{ticket.numero}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {ticket.tipo_refeicao}
            </span>
          </div>

          {/* Informações do Funcionário */}
          <div>
            <p className="font-medium">{ticket.funcionario.nome}</p>
            <p className="text-xs text-muted-foreground">
              Expira em: {ticket.tempo_restante}
            </p>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(ticket.id)}
              className="h-9 w-9 sm:w-auto sm:px-3"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Remover</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onApprove(ticket)}
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

// Componente principal
export function TicketsPendentes() {
  const { pendingTickets, removeTicket } = usePendingTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showRecognition, setShowRecognition] = useState(false);
  const ticketService = useTicketService();

  const handleVerificationSuccess = async (result: VerificationResult) => {
    try {
      if (
        selectedTicket &&
        result.isMatch &&
        result.similarity >= result.confidence
      ) {
        await ticketService.aprovarTicket(selectedTicket.id, true);
        toast.success("Ticket Aprovado", {
          description: "Reconhecimento facial confirmado com sucesso",
        });
        removeTicket(selectedTicket.id);
        setShowRecognition(false);
        setSelectedTicket(null);
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

  const handleApprove = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowRecognition(true);
  };

  return (
    <div className="w-full">
      <div className="space-y-3">
        {pendingTickets.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Nenhum ticket pendente de aprovação
            </p>
          </div>
        ) : (
          pendingTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onRemove={removeTicket}
              onApprove={handleApprove}
            />
          ))
        )}
      </div>

      {/* Dialog de Reconhecimento Facial */}
      {selectedTicket && (
        <FacialRecognitionDialog
          open={showRecognition}
          onSuccess={handleVerificationSuccess}
          onClose={() => {
            setShowRecognition(false);
            setSelectedTicket(null);
          }}
          funcionarioId={selectedTicket.funcionario.id_funcionario}
        />
      )}
    </div>
  );
}
