import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Hash,
  AlertCircle,
  Camera,
} from "lucide-react";
import { Ticket } from "@/types/ticket";
import { useTicketService } from "@/services/ticket-service";
import DialogoReconhecimentoFacial from "@/components/facial-recognition/DialogoReconhecimentoFacial";
import { servicoReconhecimentoFacial } from "@/services/servico-reconhecimento-facial";

interface DetalhesTicketProps {
  ticket: Ticket;
  aoAprovado: () => void;
  tipoTicket?: "ticket_normal" | "ticket_avulso";
  podeConsumir?: boolean;
  restauranteId?: number;
}

export function DetalhesTicket({
  ticket,
  aoAprovado,
  tipoTicket = "ticket_normal",
  podeConsumir = true,
  restauranteId,
}: DetalhesTicketProps) {
  const [aprovando, setAprovando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [codigoDigitado, setCodigoDigitado] = useState("");
  const [mostrarInputCodigo, setMostrarInputCodigo] = useState(false);
  const [mostrarReconhecimentoFacial, setMostrarReconhecimentoFacial] =
    useState(false);

  const { aprovarTicketInteligente, aprovarTicketAvulsoInteligente } =
    useTicketService();

  useEffect(() => {
    if (tipoTicket === "ticket_normal" && ticket.funcionario.id_funcionario) {
      const funcionarioId = ticket.funcionario.id_funcionario.toString();

      servicoReconhecimentoFacial
        .preCarregarDadosFuncionario(funcionarioId)
        .then(() => {
          // Apenas pré-carrega silenciosamente, sem feedback visual
        })
        .catch(() => {
          // Falha silenciosa no pré-carregamento
        });
    }
  }, [ticket.funcionario.id_funcionario, tipoTicket]);

  const formatarCodigo = (valor: string) => {
    const limpo = valor.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    if (limpo.length <= 2) {
      return limpo;
    } else if (limpo.length <= 6) {
      return `${limpo.slice(0, 2)}-${limpo.slice(2)}`;
    } else {
      return `${limpo.slice(0, 2)}-${limpo.slice(2, 6)}-${limpo.slice(6, 12)}`;
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCodigo(e.target.value);
    setCodigoDigitado(valorFormatado);
  };

  const handleAprovar = async () => {
    if (tipoTicket === "ticket_avulso") {
      setMostrarInputCodigo(true);
      return;
    }

    setErro(null);
    setMostrarReconhecimentoFacial(true);
  };

  const handleSucessoReconhecimentoFacial = async () => {
    setAprovando(true);
    setErro(null);

    try {
      await aprovarTicketInteligente(ticket.id, true, restauranteId);
      setMostrarReconhecimentoFacial(false);
      aoAprovado();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao aprovar ticket",
      );
    } finally {
      setAprovando(false);
    }
  };

  const handleFecharReconhecimentoFacial = () => {
    setMostrarReconhecimentoFacial(false);
    setErro(null);
  };

  const handleConfirmarCodigo = async () => {
    if (!codigoDigitado.trim()) {
      setErro("Digite o código do ticket");
      return;
    }

    setAprovando(true);
    setErro(null);

    try {
      const codigoLimpo = codigoDigitado.replace(/[^a-zA-Z0-9]/g, "");
      const codigoFormatado = `${codigoLimpo.slice(0, 2)}-${codigoLimpo.slice(2, 6)}-${codigoLimpo.slice(6)}`;

      await aprovarTicketAvulsoInteligente(codigoFormatado, restauranteId);
      aoAprovado();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Código incorreto ou erro ao aprovar",
      );
    } finally {
      setAprovando(false);
    }
  };

  const handleCancelarCodigo = () => {
    setMostrarInputCodigo(false);
    setCodigoDigitado("");
    setErro(null);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case 2:
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 3:
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case 4:
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  return (
    <>
      <Card className="mx-auto w-full max-w-md border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              {tipoTicket === "ticket_avulso" ? "Ticket Avulso" : "Ticket"}
            </CardTitle>
            <Badge className={`${getStatusColor(ticket.status)} border`}>
              {ticket.status_texto}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/60 p-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <User className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">
                {tipoTicket === "ticket_avulso" ? "Nome" : "Funcionário"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {ticket.funcionario.nome}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              CPF: {ticket.funcionario.cpf}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-orange-400" />
                <span className="font-medium text-orange-400">Número:</span>
              </div>
              <span className="font-mono text-foreground">{ticket.numero}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <span className="font-semibold text-green-400">
                {ticket.tipo_refeicao}
              </span>
              {tipoTicket === "ticket_normal" && ticket.valor && (
                <span className="text-lg font-bold text-green-400">
                  R$ {ticket.valor.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-400" />
                <span className="font-medium text-orange-400">Emitido em:</span>
              </div>
              <span className="text-foreground">
                {formatarData(ticket.data_emissao)}
              </span>
            </div>

            {tipoTicket === "ticket_avulso" && ticket.data_validade && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-400" />
                  <span className="font-medium text-orange-400">
                    Válido para:
                  </span>
                </div>
                <span className="text-foreground">
                  {formatarData(ticket.data_validade)}
                </span>
              </div>
            )}

            {tipoTicket === "ticket_normal" && ticket.expiracao && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span className="font-medium text-orange-400">
                    Expira em:
                  </span>
                </div>
                <span className="text-foreground">
                  {formatarData(ticket.expiracao)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                <span className="font-medium text-orange-400">Status:</span>
              </div>
              <span
                className={
                  ticket.tempo_restante.includes("Expirado") ||
                  ticket.status === 4
                    ? "text-red-400"
                    : "text-green-400"
                }
              >
                {ticket.tempo_restante}
              </span>
            </div>
          </div>

          {tipoTicket === "ticket_avulso" && !podeConsumir && (
            <Alert
              variant="destructive"
              className="border-orange-500 bg-orange-500/10"
            >
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-300">
                Este ticket avulso não pode ser consumido no momento.
              </AlertDescription>
            </Alert>
          )}

          {mostrarInputCodigo && tipoTicket === "ticket_avulso" && (
            <div className="space-y-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
              <Label
                htmlFor="codigo"
                className="text-sm font-medium text-orange-400"
              >
                Digite o código do ticket para confirmar:
              </Label>
              <Input
                id="codigo"
                type="text"
                placeholder="AV-2025-518514"
                value={codigoDigitado}
                onChange={handleCodigoChange}
                className="border-border !bg-transparent font-mono text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:ring-orange-500/20"
                style={{ backgroundColor: "transparent !important" }}
                autoFocus
                maxLength={14}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmarCodigo}
                  disabled={aprovando || !codigoDigitado.trim()}
                  className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                  size="sm"
                >
                  {aprovando ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verificando...
                    </div>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
                <Button
                  onClick={handleCancelarCodigo}
                  variant="outline"
                  size="sm"
                  disabled={aprovando}
                  className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {erro && (
            <Alert
              variant="destructive"
              className="border-orange-500 bg-orange-500/10"
            >
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-300">
                {erro}
              </AlertDescription>
            </Alert>
          )}

          {ticket.status === 1 && podeConsumir && !mostrarInputCodigo && (
            <div className="space-y-2">
              <Button
                onClick={handleAprovar}
                disabled={aprovando || mostrarReconhecimentoFacial}
                className="w-full bg-orange-600 text-white hover:bg-orange-700"
                size="lg"
              >
                {aprovando ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {tipoTicket === "ticket_avulso"
                      ? "Processando..."
                      : "Aprovando..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {tipoTicket === "ticket_avulso" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                    {tipoTicket === "ticket_avulso"
                      ? "Aprovar Ticket Avulso"
                      : "Aprovar com Reconhecimento Facial"}
                  </div>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {mostrarReconhecimentoFacial && tipoTicket === "ticket_normal" && (
        <DialogoReconhecimentoFacial
          open={mostrarReconhecimentoFacial}
          onSuccess={handleSucessoReconhecimentoFacial}
          onClose={handleFecharReconhecimentoFacial}
          userId={ticket.funcionario.id_funcionario?.toString() || ""}
          userName={ticket.funcionario.nome}
        />
      )}
    </>
  );
}
