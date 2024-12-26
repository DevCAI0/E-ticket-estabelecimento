// src/components/tickets/verificacao-manual.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useTicketService } from "@/services/ticket-service";
import { TicketDetails } from "./ticket-details";
import type { Ticket } from "@/types/ticket";
import { useAuth } from "@/hooks/useAuth";

// Em verificacao-manual.tsx e leitor-qrcode.tsx
interface ResultadoVerificacao {
  status: "success" | "error";
  mensagem: string;
  ticket?: Ticket; // Usando o tipo Ticket atualizado
}
export function VerificacaoManual() {
  const [numeroTicket, setNumeroTicket] = useState("");
  const [cpfFuncionario, setCpfFuncionario] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoVerificacao | null>(null);

  const ticketService = useTicketService();
  const { user } = useAuth();

  const formatCPF = (value: string) => {
    const cpfNumbers = value.replace(/\D/g, "");
    if (cpfNumbers.length <= 3) return cpfNumbers;
    if (cpfNumbers.length <= 6)
      return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3)}`;
    if (cpfNumbers.length <= 9)
      return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3, 6)}.${cpfNumbers.slice(6)}`;
    return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3, 6)}.${cpfNumbers.slice(6, 9)}-${cpfNumbers.slice(9, 11)}`;
  };

  const cleanCPF = (cpf: string) => cpf.replace(/\D/g, "");

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    setCpfFuncionario(formattedCPF);
  };

  const handleNumeroTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite apenas números
    const value = e.target.value.replace(/\D/g, "");
    setNumeroTicket(value);
  };

  const isFormValid = () => {
    const cpfLength = cleanCPF(cpfFuncionario).length === 11;
    const ticketLength = numeroTicket.length > 0;
    return cpfLength && ticketLength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) return;

    setLoading(true);
    setResultado(null);

    try {
      const response = await ticketService.verificarTicketManual(
        numeroTicket.trim(),
        cleanCPF(cpfFuncionario),
      );

      setResultado({
        status: "success",
        mensagem: response.message,
        ticket: response.ticket,
      });
    } catch (error) {
      setResultado({
        status: "error",
        mensagem:
          error instanceof Error ? error.message : "Erro ao verificar o ticket",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user?.id_restaurante) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Acesso Negado</AlertTitle>
        <AlertDescription>
          Você não tem permissão para verificar tickets. Contate o
          administrador.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numeroTicket">Número do Ticket</Label>
            <Input
              id="numeroTicket"
              value={numeroTicket}
              onChange={handleNumeroTicketChange}
              placeholder="Digite o número do ticket"
              className="text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfFuncionario">CPF do Funcionário</Label>
            <Input
              id="cpfFuncionario"
              value={cpfFuncionario}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="text-base"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Verificando...</span>
              </div>
            ) : (
              "Verificar Ticket"
            )}
          </Button>
        </form>

        {resultado && (
          <div className="mt-6 space-y-4">
            <Alert
              variant={
                resultado.status === "success" ? "default" : "destructive"
              }
            >
              <div className="flex items-center gap-2">
                {resultado.status === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <AlertTitle>
                  {resultado.status === "success"
                    ? "Ticket Válido!"
                    : "Ticket Inválido!"}
                </AlertTitle>
              </div>
              <AlertDescription>{resultado.mensagem}</AlertDescription>
            </Alert>

            {resultado.status === "success" && resultado.ticket && (
              <TicketDetails ticket={resultado.ticket} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
