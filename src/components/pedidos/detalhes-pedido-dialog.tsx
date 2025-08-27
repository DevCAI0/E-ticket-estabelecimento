import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  User,
  MapPin,
  Calendar,
  Receipt,
  Trash2,
  Loader2,
} from "lucide-react";
import { Pedido, PedidoItem, TIPOS_REFEICAO } from "@/types/pedidos";
import { PedidosAPI } from "@/api/pedidos";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";

interface PedidoDetalhesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido | null;
  onRefresh: () => void;
}

export function PedidoDetalhesDialog({
  open,
  onOpenChange,
  pedido,
  onRefresh,
}: PedidoDetalhesDialogProps) {
  const [loadingActions, setLoadingActions] = useState<{
    [key: string]: boolean;
  }>({});

  if (!pedido) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1:
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-800 dark:text-yellow-400",
          icon: Clock,
          border: "border-yellow-500",
        };
      case 2:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-400",
          icon: CheckCircle,
          border: "border-blue-500",
        };
      case 3:
        return {
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-800 dark:text-purple-400",
          icon: Package,
          border: "border-purple-500",
        };
      case 4:
        return {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-800 dark:text-orange-400",
          icon: AlertCircle,
          border: "border-orange-500",
        };
      case 5:
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-800 dark:text-green-400",
          icon: CheckCircle,
          border: "border-green-500",
        };
      case 6:
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-400",
          icon: XCircle,
          border: "border-red-500",
        };
      case 7:
        return {
          bg: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-800 dark:text-gray-400",
          icon: XCircle,
          border: "border-gray-500",
        };
      default:
        return {
          bg: "bg-muted",
          text: "text-muted-foreground",
          icon: AlertCircle,
          border: "border-muted",
        };
    }
  };

  const removerItem = async (itemId: number) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [`remove-${itemId}`]: true }));

      const response = await PedidosAPI.removerItem(pedido.id, itemId);

      if (response.success) {
        showSuccessToast("Item removido com sucesso");
        onRefresh();
      }
    } catch (_error) {
      showErrorToast("Erro ao remover item");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`remove-${itemId}`]: false }));
    }
  };
  const statusConfig = getStatusConfig(pedido.status);
  const StatusIcon = statusConfig.icon;

  const canRemoveItems = pedido.status === 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] w-full max-w-[95vw] overflow-hidden p-4 sm:max-w-[800px] sm:p-6 lg:max-w-[900px]">
        <DialogHeader className="border-b border-border/30 pb-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground sm:text-xl">
                Pedido #{pedido.codigo_pedido}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Detalhes completos do pedido de refeições
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
              <Badge
                className={`${statusConfig.bg} ${statusConfig.text} border-none text-xs sm:text-sm`}
              >
                {pedido.status_texto}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] flex-1 space-y-4 overflow-y-auto py-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">
                        Restaurante
                      </p>
                      <p className="break-words font-medium">
                        {pedido.restaurante.nome}
                      </p>
                      {pedido.restaurante.logradouro && (
                        <p className="break-words text-xs text-muted-foreground">
                          {pedido.restaurante.logradouro}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">
                        Estabelecimento
                      </p>
                      <p className="break-words font-medium">
                        {pedido.estabelecimento.nome}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">
                        Solicitante
                      </p>
                      <p className="break-words font-medium">
                        {pedido.solicitante.nome}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">
                        Data do Pedido
                      </p>
                      <p className="font-medium">
                        {new Date(pedido.data_pedido).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {pedido.observacoes && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Observações
                    </p>
                    <p className="rounded-md bg-muted/50 p-3 text-sm">
                      {pedido.observacoes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {(pedido.data_aceito ||
            pedido.data_recusado ||
            pedido.data_pronto ||
            pedido.data_entregue ||
            pedido.data_cancelado) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Timeline do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Pedido Criado</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pedido.data_pedido).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {pedido.data_aceito && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          Aceito pelo Restaurante
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pedido.data_aceito).toLocaleString("pt-BR")}
                        </p>
                        {pedido.usuarioAceito && (
                          <p className="text-xs text-muted-foreground">
                            Por: {pedido.usuarioAceito.nome}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {pedido.data_pronto && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Pedido Pronto</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pedido.data_pronto).toLocaleString("pt-BR")}
                        </p>
                        {pedido.usuarioPronto && (
                          <p className="text-xs text-muted-foreground">
                            Por: {pedido.usuarioPronto.nome}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {pedido.data_entregue && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-600"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Pedido Entregue</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pedido.data_entregue).toLocaleString(
                            "pt-BR",
                          )}
                        </p>
                        {pedido.usuarioEntregue && (
                          <p className="text-xs text-muted-foreground">
                            Por: {pedido.usuarioEntregue.nome}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {pedido.data_recusado && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Pedido Recusado</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pedido.data_recusado).toLocaleString(
                            "pt-BR",
                          )}
                        </p>
                        {pedido.usuarioRecusado && (
                          <p className="text-xs text-muted-foreground">
                            Por: {pedido.usuarioRecusado.nome}
                          </p>
                        )}
                        {pedido.motivo_recusa && (
                          <p className="mt-1 break-words text-xs text-red-600">
                            Motivo: {pedido.motivo_recusa}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {pedido.data_cancelado && (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gray-500"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Pedido Cancelado</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pedido.data_cancelado).toLocaleString(
                            "pt-BR",
                          )}
                        </p>
                        {pedido.usuarioCancelado && (
                          <p className="text-xs text-muted-foreground">
                            Por: {pedido.usuarioCancelado.nome}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Itens do Pedido ({pedido.itensPedido.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Ticket</TableHead>
                      <TableHead className="text-xs">Funcionário</TableHead>
                      <TableHead className="text-xs">Refeição</TableHead>
                      {canRemoveItems && (
                        <TableHead className="w-[80px] text-xs">
                          Ações
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedido.itensPedido.map((item: PedidoItem) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-2 font-medium">
                          <div className="text-sm">#{item.numero_ticket}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.tipo_ticket === "avulso"
                              ? "Avulso"
                              : "Normal"}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="max-w-[120px] break-words text-sm font-medium">
                            {item.nome_funcionario}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.cpf_funcionario}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-sm">
                          {TIPOS_REFEICAO[
                            item.id_tipo_refeicao as keyof typeof TIPOS_REFEICAO
                          ] ||
                            item.tipoRefeicao?.nome ||
                            `Tipo ${item.id_tipo_refeicao}`}
                        </TableCell>
                        {canRemoveItems && (
                          <TableCell className="py-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={loadingActions[`remove-${item.id}`]}
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                >
                                  {loadingActions[`remove-${item.id}`] ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remover item do pedido
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover este item do
                                    pedido? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removerItem(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {pedido.itensPedido.map((item: PedidoItem) => (
                  <Card key={item.id} className="border border-border/40">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div>
                              <span className="text-sm font-semibold">
                                #{item.numero_ticket}
                              </span>
                              <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {item.tipo_ticket === "avulso"
                                  ? "Avulso"
                                  : "Normal"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-medium">
                                {item.nome_funcionario}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.cpf_funcionario}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {TIPOS_REFEICAO[
                                item.id_tipo_refeicao as keyof typeof TIPOS_REFEICAO
                              ] ||
                                item.tipoRefeicao?.nome ||
                                `Tipo ${item.id_tipo_refeicao}`}
                            </span>
                          </div>
                        </div>

                        {canRemoveItems && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={loadingActions[`remove-${item.id}`]}
                                className="h-8 w-8 flex-shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                              >
                                {loadingActions[`remove-${item.id}`] ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remover item do pedido
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este item do
                                  pedido? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removerItem(item.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pedido.itensPedido.length === 0 && (
                <div className="py-8 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhum item no pedido</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
