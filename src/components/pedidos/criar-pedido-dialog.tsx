import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import {
  CriarPedidoRequest,
  RestauranteDisponivel,
  TicketDisponivel,
} from "@/types/pedidos";
import { PedidosAPI } from "@/api/pedidos";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";

interface CriarPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CriarPedidoRequest) => Promise<boolean>;
  loading: boolean;
}

interface TicketAdicionado {
  numero: string;
  status: "validando" | "valido" | "invalido";
  dados?: TicketDisponivel;
  erro?: string;
}

export function CriarPedidoDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: CriarPedidoDialogProps) {
  const [formData, setFormData] = useState<CriarPedidoRequest>({
    id_restaurante: 0,
    tickets: [],
    observacoes: "",
  });

  const [numeroTicketInput, setNumeroTicketInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [restaurantes, setRestaurantes] = useState<RestauranteDisponivel[]>([]);
  const [loadingRestaurantes, setLoadingRestaurantes] = useState(false);
  const [estabelecimentoInfo, setEstabelecimentoInfo] = useState<{
    id: number;
    nome: string;
  } | null>(null);
  const [ticketsAdicionados, setTicketsAdicionados] = useState<
    TicketAdicionado[]
  >([]);
  const [validandoTicket, setValidandoTicket] = useState(false);

  useEffect(() => {
    if (open) {
      resetarFormulario();
      carregarRestaurantesDisponiveis();
    }
  }, [open]);

  const resetarFormulario = () => {
    setFormData({
      id_restaurante: 0,
      tickets: [],
      observacoes: "",
    });
    setNumeroTicketInput("");
    setFormError(null);
    setTicketsAdicionados([]);
    setRestaurantes([]);
    setEstabelecimentoInfo(null);
  };

  const carregarRestaurantesDisponiveis = async () => {
    try {
      setLoadingRestaurantes(true);
      setFormError(null);

      const response = await PedidosAPI.listarRestaurantesDisponiveis();

      if (response.success) {
        setRestaurantes(response.data.restaurantes);
        setEstabelecimentoInfo(response.data.estabelecimento);

        if (response.data.restaurantes.length === 1) {
          setFormData((prev) => ({
            ...prev,
            id_restaurante: response.data.restaurantes[0].id,
          }));
        }
      } else {
        setFormError("Erro ao carregar restaurantes disponíveis");
        showErrorToast("Erro ao carregar restaurantes disponíveis");
      }
    } catch (error) {
      setFormError("Erro ao carregar restaurantes. Tente novamente.");
      showErrorToast("Erro ao carregar restaurantes. Tente novamente.");
    } finally {
      setLoadingRestaurantes(false);
    }
  };

  const adicionarTicket = async () => {
    const numeroLimpo = numeroTicketInput.trim();

    if (!numeroLimpo) {
      showErrorToast("Digite o número do ticket");
      return;
    }

    if (!formData.id_restaurante) {
      showErrorToast("Selecione um restaurante primeiro");
      return;
    }

    const ticketJaAdicionado = ticketsAdicionados.find(
      (ticket) => ticket.numero === numeroLimpo,
    );
    if (ticketJaAdicionado) {
      showErrorToast("Este ticket já foi adicionado");
      return;
    }

    try {
      setValidandoTicket(true);

      const novoTicket: TicketAdicionado = {
        numero: numeroLimpo,
        status: "validando",
      };

      setTicketsAdicionados((prev) => [...prev, novoTicket]);
      setNumeroTicketInput("");

      const response = await PedidosAPI.buscarTicketsDisponiveis({
        numeros_tickets: [numeroLimpo],
        id_restaurante: formData.id_restaurante,
      });

      if (response.success && response.tickets_encontrados.length > 0) {
        const ticketEncontrado = response.tickets_encontrados[0];

        setTicketsAdicionados((prev) =>
          prev.map((ticket) =>
            ticket.numero === numeroLimpo
              ? {
                  ...ticket,
                  status: ticketEncontrado.encontrado ? "valido" : "invalido",
                  dados: ticketEncontrado,
                  erro: ticketEncontrado.erro,
                }
              : ticket,
          ),
        );

        if (ticketEncontrado.encontrado) {
          showSuccessToast(`Ticket ${numeroLimpo} adicionado com sucesso`);

          setFormData((prev) => ({
            ...prev,
            tickets: [...prev.tickets, numeroLimpo],
          }));
        } else {
          showErrorToast(
            ticketEncontrado.erro || `Ticket ${numeroLimpo} não é válido`,
          );
        }
      } else {
        setTicketsAdicionados((prev) =>
          prev.map((ticket) =>
            ticket.numero === numeroLimpo
              ? {
                  ...ticket,
                  status: "invalido",
                  erro: "Ticket não encontrado",
                }
              : ticket,
          ),
        );
        showErrorToast(`Ticket ${numeroLimpo} não encontrado`);
      }
    } catch (error) {
      setTicketsAdicionados((prev) =>
        prev.map((ticket) =>
          ticket.numero === numeroLimpo
            ? {
                ...ticket,
                status: "invalido",
                erro: "Erro ao validar ticket",
              }
            : ticket,
        ),
      );
      showErrorToast("Erro ao validar ticket. Tente novamente.");
    } finally {
      setValidandoTicket(false);
    }
  };

  const removerTicket = (numeroTicket: string) => {
    setTicketsAdicionados((prev) =>
      prev.filter((ticket) => ticket.numero !== numeroTicket),
    );
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((ticket) => ticket !== numeroTicket),
    }));
    showSuccessToast(`Ticket ${numeroTicket} removido`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionarTicket();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.id_restaurante) {
      setFormError("Selecione um restaurante");
      showErrorToast("Selecione um restaurante");
      return;
    }

    if (formData.tickets.length === 0) {
      setFormError("Adicione pelo menos um ticket válido");
      showErrorToast("Adicione pelo menos um ticket válido");
      return;
    }

    const ticketsInvalidos = ticketsAdicionados.filter(
      (ticket) => ticket.status === "invalido",
    );
    if (ticketsInvalidos.length > 0) {
      setFormError(
        `Remova os ${ticketsInvalidos.length} ticket(s) inválido(s) antes de continuar.`,
      );
      showErrorToast("Há tickets inválidos na lista");
      return;
    }

    try {
      const success = await onSubmit(formData);
      if (success) {
        showSuccessToast("Pedido criado com sucesso!");
        onOpenChange(false);
      }
    } catch {
      showErrorToast("Erro ao criar pedido");
    }
  };

  const handleCancel = () => {
    resetarFormulario();
    onOpenChange(false);
  };

  const isFormValid =
    formData.id_restaurante > 0 &&
    formData.tickets.length > 0 &&
    ticketsAdicionados.every((ticket) => ticket.status !== "invalido") &&
    !validandoTicket;

  const ticketsValidos = ticketsAdicionados.filter(
    (ticket) => ticket.status === "valido",
  );
  const ticketsInvalidos = ticketsAdicionados.filter(
    (ticket) => ticket.status === "invalido",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-[95vw] flex-col border border-border/50 bg-card shadow-2xl sm:max-w-[500px]">
        <DialogHeader className="flex-shrink-0 border-b border-border/30 pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Criar Novo Pedido
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {estabelecimentoInfo && (
              <div className="mt-2 rounded-md border border-border/20 bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium text-foreground">
                  {estabelecimentoInfo.nome}
                </span>
              </div>
            )}
            <span className="mt-2 block text-sm">
              Adicione os tickets individualmente para criar o pedido.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4">
          {formError && (
            <Alert
              variant="destructive"
              className="mb-4 border-destructive/20 bg-destructive/10"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive-foreground">
                {formError}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="restaurante"
                className="text-sm font-medium text-foreground"
              >
                Restaurante *
              </Label>
              {loadingRestaurantes ? (
                <div className="flex items-center justify-center rounded-lg border border-border/20 bg-muted/30 p-6">
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">
                    Carregando restaurantes...
                  </span>
                </div>
              ) : (
                <Select
                  value={
                    formData.id_restaurante > 0
                      ? formData.id_restaurante.toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      id_restaurante: parseInt(value),
                    })
                  }
                  required
                >
                  <SelectTrigger className="border-border/50 bg-background transition-colors hover:border-border">
                    <SelectValue placeholder="Selecione o restaurante" />
                  </SelectTrigger>
                  <SelectContent className="border-border/50 bg-popover">
                    {restaurantes.map((restaurante) => (
                      <SelectItem
                        key={restaurante.id}
                        value={restaurante.id.toString()}
                        className="hover:bg-accent focus:bg-accent"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {restaurante.nome}
                          </span>
                          {restaurante.logradouro && (
                            <span className="text-xs text-muted-foreground">
                              {restaurante.logradouro}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">
                Adicionar Tickets *
              </Label>

              <div className="flex gap-3">
                <Input
                  placeholder="Digite o número do ticket"
                  value={numeroTicketInput}
                  onChange={(e) => setNumeroTicketInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!formData.id_restaurante || validandoTicket}
                  className="flex-1 border-border/50 bg-background transition-colors hover:border-border focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  onClick={adicionarTicket}
                  disabled={
                    !formData.id_restaurante ||
                    validandoTicket ||
                    !numeroTicketInput.trim()
                  }
                  size="icon"
                  className="bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90"
                >
                  {validandoTicket ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {!formData.id_restaurante && (
                <div className="rounded-lg border border-border/20 bg-muted/30 p-3">
                  <p className="text-center text-sm text-muted-foreground">
                    Selecione um restaurante para adicionar tickets
                  </p>
                </div>
              )}
            </div>

            {ticketsAdicionados.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Tickets ({ticketsAdicionados.length})
                  </Label>
                  {ticketsValidos.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="border border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {ticketsValidos.length} válidos
                    </Badge>
                  )}
                </div>

                <div className="max-h-40 flex-1 space-y-2 overflow-y-auto rounded-lg border border-border/20 bg-muted/20 p-3">
                  {ticketsAdicionados.map((ticket, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border-l-4 p-3 transition-all duration-200 ${
                        ticket.status === "valido"
                          ? "border-l-green-500 bg-green-50 dark:border-l-green-400 dark:bg-green-950/30"
                          : ticket.status === "invalido"
                            ? "border-l-red-500 bg-red-50 dark:border-l-red-400 dark:bg-red-950/30"
                            : "border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-blue-950/30"
                      } border border-border/20 shadow-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {ticket.status === "validando" && (
                            <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-blue-500" />
                          )}
                          {ticket.status === "valido" && (
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                          )}
                          {ticket.status === "invalido" && (
                            <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-foreground">
                                #{ticket.numero}
                              </span>
                              {ticket.dados?.valor_formatado && (
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {ticket.dados.valor_formatado}
                                </span>
                              )}
                            </div>

                            {ticket.dados && ticket.status === "valido" && (
                              <div className="truncate text-xs text-muted-foreground">
                                {ticket.dados.funcionario_nome && (
                                  <span>{ticket.dados.funcionario_nome}</span>
                                )}
                                {ticket.dados.tipo_refeicao &&
                                  ticket.dados.funcionario_nome && (
                                    <span> • </span>
                                  )}
                                {ticket.dados.tipo_refeicao && (
                                  <span>{ticket.dados.tipo_refeicao}</span>
                                )}
                              </div>
                            )}

                            {ticket.status === "invalido" && ticket.erro && (
                              <p className="truncate text-xs text-red-600 dark:text-red-400">
                                {ticket.erro}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removerTicket(ticket.numero)}
                          className="ml-2 h-7 w-7 flex-shrink-0 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/30"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {ticketsInvalidos.length > 0 && (
                  <Alert
                    variant="destructive"
                    className="border-destructive/20 bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-destructive-foreground">
                      {ticketsInvalidos.length} ticket(s) inválido(s). Remova-os
                      antes de continuar.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Label
                htmlFor="observacoes"
                className="text-sm font-medium text-foreground"
              >
                Observações
              </Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre o pedido... (opcional)"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacoes: e.target.value,
                  })
                }
                rows={2}
                className="resize-none border-border/50 bg-background transition-colors hover:border-border focus:ring-2 focus:ring-primary/20"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 500 caracteres
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex-col gap-3 border-t border-border/30 pt-4 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full border-border/50 transition-colors hover:border-border sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !isFormValid}
            onClick={handleSubmit}
            className="w-full bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              `Criar Pedido ${ticketsValidos.length > 0 ? `(${ticketsValidos.length} tickets)` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
