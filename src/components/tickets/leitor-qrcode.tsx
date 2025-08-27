// src/components/tickets/leitor-qrcode.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import QrScanner from "./qr-scanner";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/hooks/auth/useAuth";
import { DetalhesTicket } from "./DetalhesTicket";
import { useTicketService } from "@/services/ticket-service";
import { useTicketsPendentes } from "@/hooks/use-pending-tickets";

interface ResultadoLeitura {
  status: "success" | "error" | "approved";
  mensagem: string;
  ticket?: Ticket;
  tipo?: "ticket_normal" | "ticket_avulso";
  podeConsumir?: boolean;
}

interface ErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

interface AxiosError {
  response?: {
    data?: ErrorResponse;
  };
}

export function LeitorQRCode() {
  const [lendo, setLendo] = useState(true);
  const [resultado, setResultado] = useState<ResultadoLeitura | null>(null);
  const servicoTicket = useTicketService();
  const { adicionarTicket, atualizarStatusTicket } = useTicketsPendentes();
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
      const resposta = await servicoTicket.lerQRCode(qrCode);

      if (resposta.success === false) {
        setResultado({
          status: "error",
          mensagem: resposta.message || "QR Code inválido",
        });
        return;
      }

      if (resposta.ticket) {
        adicionarTicket(resposta.ticket);
      }

      setResultado({
        status: "success",
        mensagem: resposta.message || "Ticket válido",
        ticket: resposta.ticket,
        tipo: resposta.tipo || "ticket_normal",
        podeConsumir: resposta.pode_consumir !== false,
      });
    } catch (erro: unknown) {
      let mensagemErro = "Erro ao processar o ticket";

      if (erro && typeof erro === "object" && "response" in erro) {
        const axiosError = erro as AxiosError;
        const errorData = axiosError.response?.data;

        if (
          errorData &&
          typeof errorData === "object" &&
          errorData.success === false
        ) {
          mensagemErro = errorData.message || "QR Code inválido";
        } else if (
          errorData &&
          typeof errorData === "object" &&
          errorData.message
        ) {
          mensagemErro = errorData.message;
        } else if (
          errorData &&
          typeof errorData === "object" &&
          errorData.error
        ) {
          mensagemErro = errorData.error;
        }
      } else if (erro instanceof Error) {
        mensagemErro = erro.message;
      }

      setResultado({
        status: "error",
        mensagem: mensagemErro,
      });
    }
  };

  const handleNovoPedido = () => {
    setResultado(null);
    setLendo(true);
  };

  const handleTicketAprovado = () => {
    if (resultado?.ticket) {
      atualizarStatusTicket(resultado.ticket.id, 3);
    }

    setResultado((prev) =>
      prev
        ? {
            status: "approved",
            mensagem: "Ticket aprovado com sucesso",
            ticket: prev.ticket,
            tipo: prev.tipo,
          }
        : null,
    );
  };

  const renderResultado = () => {
    if (!resultado) return null;

    return (
      <div className="space-y-4">
        {resultado.status === "approved" && (
          <Alert variant="default" className="border-green-500 bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <AlertTitle className="text-green-400">
                Ticket Aprovado!
              </AlertTitle>
            </div>
            <AlertDescription className="text-green-300">
              {resultado.tipo === "ticket_avulso"
                ? "Ticket avulso consumido com sucesso"
                : "Ticket aprovado com sucesso"}
            </AlertDescription>
          </Alert>
        )}

        {resultado.status === "error" && (
          <Alert
            variant="destructive"
            className="border-orange-500 bg-orange-500/10"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <AlertTitle className="text-orange-400">
                QR Code Inválido!
              </AlertTitle>
            </div>
            <AlertDescription className="text-orange-300">
              {resultado.mensagem}
            </AlertDescription>
          </Alert>
        )}

        {resultado.status === "success" && resultado.ticket && (
          <DetalhesTicket
            ticket={resultado.ticket}
            aoAprovado={handleTicketAprovado}
            tipoTicket={resultado.tipo}
            podeConsumir={resultado.podeConsumir}
          />
        )}

        <Button
          onClick={handleNovoPedido}
          className="w-full text-white bg-orange-600 border-orange-600 hover:bg-orange-700"
          size="lg"
        >
          {resultado.status === "error"
            ? "Tentar Novamente"
            : "Ler Novo Ticket"}
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md px-4 mx-auto">
      <Card className="overflow-hidden border-0 bg-card">
        <CardContent className="p-0">
          {lendo ? (
            <div className="h-[600px]">
              <QrScanner onScan={handleScan} />
            </div>
          ) : (
            <div className="p-6 space-y-4">{renderResultado()}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
