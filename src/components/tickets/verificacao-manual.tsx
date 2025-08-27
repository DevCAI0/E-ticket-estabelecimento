import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { Ticket } from "@/types/ticket";
import { showErrorToast, showSuccessToast } from "../ui/sonner";
import { DetalhesTicket } from "./DetalhesTicket";
import { AxiosError } from "axios";
import { useTicketService } from "@/services/ticket-service";

interface ResultadoVerificacao {
  status: "success" | "error";
  mensagem: string;
  ticket?: Ticket;
}

export function VerificacaoManual() {
  const [numeroTicket, setNumeroTicket] = useState("");
  const [cpfFuncionario, setCpfFuncionario] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoVerificacao | null>(null);

  const ticketService = useTicketService();
  const navigate = useNavigate();

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

      // Verifica o status da resposta - se success é false, é um erro
      if (response.success === false) {
        setResultado({
          status: "error",
          mensagem: response.message,
        });
        showErrorToast(response.message);
      } else {
        setResultado({
          status: "success",
          mensagem: response.message,
          ticket: response.ticket,
        });
        showSuccessToast("Ticket encontrado com sucesso!");
      }
    } catch (error) {
      let mensagemErro = "Erro ao verificar o ticket";

      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data;

        if (typeof errorData === "object") {
          if (errorData.error) {
            mensagemErro = errorData.error;
          } else if (errorData.message) {
            mensagemErro = errorData.message;
          }
        } else if (typeof errorData === "string") {
          mensagemErro = errorData;
        }
      } else if (error instanceof Error) {
        mensagemErro = error.message;
      }

      setResultado({
        status: "error",
        mensagem: mensagemErro,
      });

      showErrorToast(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketAprovado = () => {
    showSuccessToast("Ticket aprovado com sucesso! Redirecionando...");

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleVoltarInicio = () => {
    navigate("/");
  };

  return (
    <Card className="w-full bg-card">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numeroTicket" className="text-orange-400">
              Número do Ticket
            </Label>
            <Input
              id="numeroTicket"
              value={numeroTicket}
              onChange={handleNumeroTicketChange}
              placeholder="Digite o número do ticket"
              className="border-border !bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:ring-orange-500/20"
              style={{ backgroundColor: "transparent !important" }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfFuncionario" className="text-orange-400">
              CPF do Funcionário
            </Label>
            <Input
              id="cpfFuncionario"
              value={cpfFuncionario}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="border-border !bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:ring-orange-500/20"
              style={{ backgroundColor: "transparent !important" }}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-orange-500 text-orange-400 hover:bg-orange-500/10"
              onClick={handleVoltarInicio}
            >
              Voltar
            </Button>

            <Button
              type="submit"
              className="flex-1 border-orange-600 bg-orange-600 text-white hover:bg-orange-700"
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
          </div>
        </form>

        {resultado && (
          <div className="mt-6 space-y-4">
            <Alert
              variant={
                resultado.status === "success" ? "default" : "destructive"
              }
              className={
                resultado.status === "success"
                  ? "border-green-500 bg-green-500/10"
                  : "border-orange-500 bg-orange-500/10"
              }
            >
              <div className="flex items-center gap-2">
                {resultado.status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                )}
                <AlertTitle
                  className={
                    resultado.status === "success"
                      ? "text-green-400"
                      : "text-orange-400"
                  }
                >
                  {resultado.status === "success"
                    ? "Ticket Válido!"
                    : "Ticket Inválido!"}
                </AlertTitle>
              </div>
              <AlertDescription
                className={
                  resultado.status === "success"
                    ? "text-green-300"
                    : "text-orange-300"
                }
              >
                {resultado.mensagem}
              </AlertDescription>
            </Alert>

            {resultado.status === "success" && resultado.ticket && (
              <DetalhesTicket
                ticket={resultado.ticket}
                aoAprovado={handleTicketAprovado}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
