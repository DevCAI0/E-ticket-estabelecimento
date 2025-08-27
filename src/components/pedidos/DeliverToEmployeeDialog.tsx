import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User,
  Package,
  CheckCircle2,
  X,
  Camera,
  AlertCircle,
} from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";
import { TicketPedido } from "@/types/ticket";
import { PedidosAPI } from "@/api/pedidos";
import { useTicketService } from "@/services/ticket-service";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";
import DialogoReconhecimentoFacial from "@/components/facial-recognition/DialogoReconhecimentoFacial";
import { ResultadoVerificacao } from "@/types/reconhecimento-facial";

interface DeliverToEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoSimplificado | null;
  onDeliveryComplete: () => void;
}

export function DeliverToEmployeeDialog({
  open,
  onOpenChange,
  pedido,
  onDeliveryComplete,
}: DeliverToEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<TicketPedido[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketPedido | null>(
    null,
  );
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);
  const [consumedTickets, setConsumedTickets] = useState<Set<number>>(
    new Set(),
  );

  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [codeDialogLoading, setCodeDialogLoading] = useState(false);
  const [codeDialogError, setCodeDialogError] = useState<string | null>(null);

  const { aprovarTicketInteligente, aprovarTicketAvulsoInteligente } =
    useTicketService();

  const handleClose = useCallback(() => {
    setTickets([]);
    setSelectedTicket(null);
    setConsumedTickets(new Set());
    setShowFacialRecognition(false);
    setShowCodeDialog(false);
    setTicketCode("");
    setCodeDialogError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const carregarTicketsDoPedido = useCallback(async () => {
    if (!pedido) return;

    setLoading(true);
    try {
      const response = await PedidosAPI.obterPedido(pedido.id);

      if (response.success && response.pedido.itensPedido) {
        const ticketsFormatados: TicketPedido[] = response.pedido.itensPedido
          .map(
            (item: {
              id: number;
              numero_ticket: string;
              tipo_ticket: string;
              nome_funcionario: string;
              cpf_funcionario: string;
              id_tipo_refeicao: number;
              valor_unitario: number;
              quantidade: number;
              funcionario_id?: number;
              id_ticket?: number;
              id_ticket_avulso?: number;
              status_ticket?: number;
              ticket_entregue?: boolean;
            }) => ({
              id: item.id,
              numero_ticket: item.numero_ticket,
              tipo_ticket: item.tipo_ticket as "normal" | "avulso",
              nome_funcionario: item.nome_funcionario,
              cpf_funcionario: item.cpf_funcionario,
              id_tipo_refeicao: item.id_tipo_refeicao,
              valor_unitario: item.valor_unitario,
              quantidade: item.quantidade,
              funcionario_id: item.funcionario_id,
              id_ticket: item.id_ticket,
              id_ticket_avulso: item.id_ticket_avulso,
              status_ticket: item.status_ticket,
              ticket_entregue: item.ticket_entregue,
              status: item.ticket_entregue
                ? ("consumed" as const)
                : ("pending" as const),
            }),
          )
          .filter((ticket) => !ticket.ticket_entregue);

        if (
          ticketsFormatados.length === 0 &&
          response.pedido.itensPedido.length > 0
        ) {
          showSuccessToast("Todos os tickets deste pedido já foram entregues!");
          setTimeout(() => {
            onDeliveryComplete();
            handleClose();
          }, 2000);
          return;
        }

        setTickets(ticketsFormatados);
      }
    } catch {
      showErrorToast("Erro ao carregar tickets do pedido");
    } finally {
      setLoading(false);
    }
  }, [pedido, onDeliveryComplete, handleClose]);

  useEffect(() => {
    if (open && pedido) {
      carregarTicketsDoPedido();
    }
  }, [open, pedido, carregarTicketsDoPedido]);

  useEffect(() => {
    if (!open) {
      setTickets([]);
      setSelectedTicket(null);
      setConsumedTickets(new Set());
      setShowFacialRecognition(false);
      setShowCodeDialog(false);
      setTicketCode("");
      setCodeDialogError(null);
    }
  }, [open]);

  const handleTicketSelection = (ticket: TicketPedido) => {
    if (!isTicketClickable(ticket)) {
      return;
    }

    setSelectedTicket(ticket);
    setCodeDialogError(null);

    if (ticket.tipo_ticket === "normal") {
      if (!ticket.funcionario_id) {
        showErrorToast("ID do funcionário não encontrado no ticket");
        return;
      }
      setShowFacialRecognition(true);
    } else {
      setShowCodeDialog(true);
    }
  };

  const handleFacialRecognitionSuccess = async (
    _resultado: ResultadoVerificacao,
  ) => {
    if (!selectedTicket || !pedido) return;

    if (!selectedTicket.id_ticket) {
      showErrorToast("ID do ticket não encontrado");
      return;
    }

    try {
      setLoading(true);

      const result = await aprovarTicketInteligente(
        selectedTicket.id_ticket,
        true,
        pedido.restaurante.id,
      );

      if (result.success) {
        showSuccessToast(
          `Ticket ${selectedTicket.numero_ticket} entregue com sucesso!`,
        );

        setConsumedTickets((prev) => new Set([...prev, selectedTicket.id]));

        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, status: "consumed" as const }
              : t,
          ),
        );

        checkAllTicketsConsumed();
      } else {
        const errorMessage = result.message || "Erro ao entregar ticket";
        showErrorToast(errorMessage);

        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? {
                  ...t,
                  status: "error" as const,
                  error_message: errorMessage,
                }
              : t,
          ),
        );
      }
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || "Erro ao entregar ticket";
      showErrorToast(errorMessage);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, status: "error" as const, error_message: errorMessage }
            : t,
        ),
      );
    } finally {
      setLoading(false);
      setShowFacialRecognition(false);
      setSelectedTicket(null);
    }
  };

  const handleFacialRecognitionClose = () => {
    setShowFacialRecognition(false);
    setSelectedTicket(null);
  };

  const handleConfirmTicketCode = async () => {
    if (!selectedTicket || !pedido || !ticketCode.trim()) return;

    try {
      setCodeDialogLoading(true);
      setCodeDialogError(null);

      const result = await aprovarTicketAvulsoInteligente(
        ticketCode.trim(),
        pedido.restaurante.id,
      );

      if (result.success) {
        showSuccessToast(
          `Ticket avulso ${selectedTicket.numero_ticket} entregue com sucesso!`,
        );

        setConsumedTickets((prev) => new Set([...prev, selectedTicket.id]));

        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, status: "consumed" as const }
              : t,
          ),
        );

        setShowCodeDialog(false);
        setTicketCode("");
        setSelectedTicket(null);

        checkAllTicketsConsumed();
      } else {
        const errorMessage = result.message || "Erro ao entregar ticket avulso";
        setCodeDialogError(errorMessage);
        showErrorToast(errorMessage);

        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? {
                  ...t,
                  status: "error" as const,
                  error_message: errorMessage,
                }
              : t,
          ),
        );
      }
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || "Erro ao entregar ticket avulso";
      setCodeDialogError(errorMessage);
      showErrorToast(errorMessage);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, status: "error" as const, error_message: errorMessage }
            : t,
        ),
      );
    } finally {
      setCodeDialogLoading(false);
    }
  };

  const handleCancelCodeDialog = () => {
    setShowCodeDialog(false);
    setTicketCode("");
    setSelectedTicket(null);
    setCodeDialogError(null);
  };

  const checkAllTicketsConsumed = () => {
    setTimeout(() => {
      const allConsumed = tickets.every(
        (ticket) =>
          consumedTickets.has(ticket.id) ||
          ticket.status === "consumed" ||
          ticket.ticket_entregue ||
          ticket.status_ticket === 3,
      );

      if (allConsumed && tickets.length > 0) {
        showSuccessToast("Todos os tickets foram entregues aos funcionários!");
        setTimeout(() => {
          onDeliveryComplete();
          handleClose();
        }, 1500);
      }
    }, 100);
  };

  const getStatusIcon = (ticket: TicketPedido) => {
    if (consumedTickets.has(ticket.id) || ticket.status === "consumed") {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (ticket.status === "error") {
      return <X className="w-4 h-4 text-red-500" />;
    }
    return <Package className="w-4 h-4 text-orange-500" />;
  };

  const getStatusColor = (ticket: TicketPedido) => {
    if (ticket.ticket_entregue || ticket.status_ticket === 3) {
      return "border-gray-300 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed";
    }

    if (consumedTickets.has(ticket.id) || ticket.status === "consumed") {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    if (ticket.status === "error") {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    return "border-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer";
  };

  const isTicketClickable = (ticket: TicketPedido) => {
    return (
      !ticket.ticket_entregue &&
      ticket.status_ticket !== 3 &&
      !consumedTickets.has(ticket.id) &&
      ticket.status !== "consumed"
    );
  };

  if (!pedido) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Entregar Tickets aos Funcionários
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Pedido #{pedido.codigo_pedido}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {pedido.restaurante.nome} • {pedido.total_itens} ticket
                  {pedido.total_itens !== 1 ? "s" : ""}
                </p>
              </CardHeader>
            </Card>

            {loading && tickets.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                <span>Carregando tickets...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-medium">
                  Clique em cada ticket para entregar ao funcionário:
                </h3>

                {tickets.map((ticket: TicketPedido) => (
                  <Card
                    key={ticket.id}
                    className={`transition-colors ${getStatusColor(ticket)}`}
                    onClick={() => handleTicketSelection(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(ticket)}
                          <div>
                            <p className="font-medium">
                              {ticket.nome_funcionario}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Ticket: {ticket.numero_ticket} • CPF:{" "}
                              {ticket.cpf_funcionario}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              ticket.tipo_ticket === "normal"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {ticket.tipo_ticket === "normal"
                              ? "Normal"
                              : "Avulso"}
                          </Badge>

                          {ticket.tipo_ticket === "normal" && (
                            <Camera className="w-4 h-4 text-blue-500" />
                          )}

                          {consumedTickets.has(ticket.id) ||
                          ticket.status === "consumed" ? (
                            <Badge className="text-green-800 bg-green-100 dark:bg-green-900/30">
                              Entregue
                            </Badge>
                          ) : ticket.status === "error" ? (
                            <Badge
                              variant="destructive"
                              title={ticket.error_message}
                            >
                              Erro
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pendente</Badge>
                          )}
                        </div>
                      </div>

                      {ticket.status === "error" && ticket.error_message && (
                        <p className="mt-2 text-xs text-red-600">
                          {ticket.error_message}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>

              <div className="text-sm text-muted-foreground">
                {consumedTickets.size} de {tickets.length} tickets pendentes
                entregues
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showFacialRecognition && selectedTicket && (
        <DialogoReconhecimentoFacial
          open={showFacialRecognition}
          onSuccess={handleFacialRecognitionSuccess}
          onClose={handleFacialRecognitionClose}
          userId={selectedTicket.funcionario_id?.toString() || ""}
          userName={selectedTicket.nome_funcionario}
        />
      )}

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Código do Ticket Avulso
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedTicket && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">{selectedTicket.nome_funcionario}</p>
                <p className="text-sm text-muted-foreground">
                  Ticket: {selectedTicket.numero_ticket}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ticket-code">
                Digite o código do ticket avulso:
              </Label>
              <Input
                id="ticket-code"
                type="text"
                placeholder="Ex: 5009080"
                value={ticketCode}
                onChange={(e) => {
                  setTicketCode(e.target.value);
                  if (codeDialogError) {
                    setCodeDialogError(null);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && ticketCode.trim()) {
                    handleConfirmTicketCode();
                  }
                }}
                disabled={codeDialogLoading}
                autoFocus
                className={
                  codeDialogError ? "border-red-500 focus:ring-red-500" : ""
                }
              />

              {codeDialogError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{codeDialogError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCodeDialog}
                disabled={codeDialogLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmTicketCode}
                disabled={!ticketCode.trim() || codeDialogLoading}
              >
                {codeDialogLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
