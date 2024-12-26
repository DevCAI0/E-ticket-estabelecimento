// src/components/tickets/leitor-qrcode.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useTicketService } from "@/services/ticket-service";
import { QrScanner } from "./qr-scanner";
import { TicketDetails } from "./ticket-details";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/hooks/useAuth";
import { usePendingTickets } from "@/hooks/use-pending-tickets";

interface ResultadoLeitura {
  status: "success" | "error" | "approved";
  mensagem: string;
  ticket?: Ticket;
}

export function LeitorQRCode() {
  const [lendo, setLendo] = useState(true);
  const [resultado, setResultado] = useState<ResultadoLeitura | null>(null);
  const ticketService = useTicketService();
  const { addTicket } = usePendingTickets();

  const { user } = useAuth();

  const handleScan = async (qrCode: string) => {
    setLendo(false);

    if (!user?.id_restaurante) {
      setResultado({
        status: "error",
        mensagem: "Usuário sem restaurante associado",
      });
      return;
    }

    try {
      const response = await ticketService.lerQRCode(qrCode);
      // Adiciona o ticket à lista de pendentes
      if (response.ticket) {
        addTicket(response.ticket);
      }
      setResultado({
        status: "success",
        mensagem: response.message,
        ticket: response.ticket,
      });
    } catch (error) {
      setResultado({
        status: "error",
        mensagem:
          error instanceof Error ? error.message : "Erro ao processar o ticket",
      });
    }
  };

  const handleNovoPedido = () => {
    setResultado(null);
    setLendo(true);
  };

  const handleTicketApproved = () => {
    setResultado((prev) =>
      prev
        ? {
            status: "approved",
            mensagem: "Ticket aprovado com sucesso",
            ticket: prev.ticket,
          }
        : null,
    );
  };

  // Verifica permissão do usuário
  if (!user?.id_restaurante) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <Card className="w-full max-w-md border border-border bg-card">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Acesso Negado</AlertTitle>
              <AlertDescription>
                Você não tem permissão para ler tickets. Contate o
                administrador.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    if (lendo) {
      return <QrScanner onScan={handleScan} />;
    }

    if (!resultado) return null;

    return (
      <div className="space-y-4">
        {resultado.status === "approved" && (
          <Alert variant="default">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <AlertTitle>Ticket Aprovado!</AlertTitle>
            </div>
          </Alert>
        )}

        {resultado.status === "error" && (
          <Alert variant="destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Erro na Leitura</AlertTitle>
            </div>
            <AlertDescription>{resultado.mensagem}</AlertDescription>
          </Alert>
        )}

        {resultado.status === "success" && resultado.ticket && (
          <TicketDetails
            ticket={resultado.ticket}
            onApproved={handleTicketApproved}
          />
        )}

        {/* Botão sempre visível após a leitura */}
        <button
          onClick={handleNovoPedido}
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {resultado.status === "error"
            ? "Tentar Novamente"
            : "Ler Novo Ticket"}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Card className="w-full max-w-md border border-border bg-card">
        <CardContent className="p-6">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}