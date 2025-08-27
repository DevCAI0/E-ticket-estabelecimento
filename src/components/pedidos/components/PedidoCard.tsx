import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Loader2,
  Eye,
  Trash2,
  Plus,
  X,
  ChefHat,
  QrCode,
  Camera,
  MoreVertical,
} from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";
import { UserPermissions, UserType } from "@/hooks/useUserType";

interface PedidoCardProps {
  pedido: PedidoSimplificado;
  index: number;
  userType: UserType;
  permissions: UserPermissions;
  loadingAction: string;
  allTicketsDelivered?: boolean;
  onViewDetails: () => void;
  onCancel: () => void;
  onAddItems: () => void;
  onAccept: () => void;
  onReject: () => void;
  onMarkReady: () => void;
  onShowQRCode: () => void;
  onScanQRCode: () => void;
  onDeliverToEmployee: () => void;
}

export function PedidoCard({
  pedido,
  index,
  userType,
  permissions,
  loadingAction,
  allTicketsDelivered = false,
  onViewDetails,
  onCancel,
  onAddItems,
  onAccept,
  onReject,
  onMarkReady,
  onShowQRCode,
  onScanQRCode,
  onDeliverToEmployee,
}: PedidoCardProps) {
  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1:
        return {
          color: "bg-yellow-500",
          bgClass:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: Clock,
        };
      case 3:
        return {
          color: "bg-purple-500",
          bgClass:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          icon: ChefHat,
        };
      case 4:
        return {
          color: "bg-orange-500",
          bgClass:
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
          icon: Package,
        };
      case 5:
        return {
          color: "bg-green-500",
          bgClass:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: CheckCircle,
        };
      case 6:
        return {
          color: "bg-red-500",
          bgClass:
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: XCircle,
        };
      case 7:
        return {
          color: "bg-gray-500",
          bgClass:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: XCircle,
        };
      case 8:
        return {
          color: "bg-blue-500",
          bgClass:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: CheckCircle,
        };
      default:
        return {
          color: "bg-muted",
          bgClass: "bg-muted text-muted-foreground",
          icon: AlertCircle,
        };
    }
  };

  const statusConfig = getStatusConfig(pedido.status);
  const StatusIcon = statusConfig.icon;

  const getAvailableActions = () => {
    const actions = [];

    actions.push({
      key: "view",
      label: "Detalhes",
      icon: Eye,
      onClick: onViewDetails,
      variant: "secondary" as const,
      disabled: loadingAction === "loading",
      needsConfirmation: false,
    });

    switch (pedido.status) {
      case 1:
        if (userType === "estabelecimento") {
          if (permissions.canAddItems) {
            actions.push({
              key: "add",
              label: "Adicionar",
              icon: Plus,
              onClick: onAddItems,
              variant: "default" as const,
              disabled: loadingAction !== "",
              needsConfirmation: false,
            });
          }
          if (permissions.canCancelOrders) {
            actions.push({
              key: "cancel",
              label: "Cancelar",
              icon: Trash2,
              onClick: onCancel,
              variant: "destructive" as const,
              disabled: loadingAction === "canceling",
              needsConfirmation: false,
            });
          }
        }

        if (userType === "restaurante") {
          if (permissions.canAcceptOrders) {
            actions.push({
              key: "accept",
              label: "Aceitar",
              icon: CheckCircle,
              onClick: onAccept,
              variant: "default" as const,
              disabled: loadingAction === "accepting",
              needsConfirmation: false,
            });
          }
          if (permissions.canRejectOrders) {
            actions.push({
              key: "reject",
              label: "Recusar",
              icon: X,
              onClick: onReject,
              variant: "destructive" as const,
              disabled: loadingAction === "rejecting",
              needsConfirmation: false,
            });
          }
        }
        break;

      case 3:
        if (userType === "restaurante" && permissions.canMarkReady) {
          actions.push({
            key: "ready",
            label: "Marcar Pronto",
            icon: Package,
            onClick: onMarkReady,
            variant: "default" as const,
            disabled: loadingAction === "ready",
            needsConfirmation: true,
            confirmTitle: "Confirmar pedido pronto",
            confirmDescription:
              "Confirma que o pedido está pronto para retirada?",
          });
        }
        break;

      case 4:
        if (userType === "estabelecimento" && permissions.canViewQRCode) {
          actions.push({
            key: "qr",
            label: "QR Code",
            icon: QrCode,
            onClick: onShowQRCode,
            variant: "default" as const,
            disabled: loadingAction !== "",
            needsConfirmation: false,
          });
        }

        if (userType === "restaurante" && permissions.canScanQRCode) {
          actions.push({
            key: "scan",
            label: "Escanear",
            icon: Camera,
            onClick: onScanQRCode,
            variant: "default" as const,
            disabled: loadingAction === "delivering",
            needsConfirmation: false,
          });
        }
        break;

      case 5:
        if (
          userType === "estabelecimento" &&
          permissions.canDeliverToEmployee &&
          !allTicketsDelivered
        ) {
          actions.push({
            key: "deliver",
            label: "Entregar ao Funcionário",
            icon: ChefHat,
            onClick: onDeliverToEmployee,
            variant: "default" as const,
            disabled: loadingAction === "delivering",
            needsConfirmation: false,
          });
        }
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
          <span className="text-xs font-medium text-primary">
            #{pedido.codigo_pedido}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-xs ${statusConfig.bgClass}`}
          >
            {pedido.status_texto}
          </span>
          <button className="p-1">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <h3 className="text-sm font-medium leading-tight text-foreground">
          {userType === "estabelecimento"
            ? pedido.restaurante.nome
            : pedido.estabelecimento.nome}
        </h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{pedido.solicitante.nome}</span>
            <span>
              {pedido.total_itens} ticket{pedido.total_itens !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            <span>
              {(() => {
                try {
                  const [, timePart] = pedido.data_pedido.split(" ");
                  if (timePart) {
                    return timePart;
                  }
                  const dateStr = pedido.data_pedido;
                  if (dateStr.includes("/")) {
                    const parts = dateStr.split(" ");
                    return parts[1] || "N/A";
                  }
                  return new Date(pedido.data_pedido).toLocaleTimeString(
                    "pt-BR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );
                } catch {
                  return "N/A";
                }
              })()}
            </span>
          </div>
        </div>

        {pedido.observacoes && (
          <div className="mt-2">
            <p className="line-clamp-2 rounded bg-muted/50 p-2 text-xs text-muted-foreground">
              {pedido.observacoes}
            </p>
          </div>
        )}

        {pedido.status === 5 && pedido.metodo_entrega && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {pedido.metodo_entrega === "qr_code"
                ? "QR Code"
                : "Código Manual"}
            </Badge>
          </div>
        )}

        {pedido.status === 5 && allTicketsDelivered && (
          <div className="mt-2">
            <Badge
              variant="outline"
              className="border-green-300 text-xs text-green-700"
            >
              Todos os tickets entregues aos funcionários
            </Badge>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {availableActions.map((action) => {
          const isLoading =
            loadingAction === action.key ||
            (action.key === "accept" && loadingAction === "accepting") ||
            (action.key === "reject" && loadingAction === "rejecting") ||
            (action.key === "ready" && loadingAction === "ready") ||
            (action.key === "scan" && loadingAction === "delivering") ||
            (action.key === "cancel" && loadingAction === "canceling") ||
            (action.key === "view" && loadingAction === "loading");

          const ActionButton = (
            <Button
              key={action.key}
              variant={action.variant}
              size="sm"
              disabled={action.disabled}
              className="h-8 flex-1 text-xs"
              onClick={action.needsConfirmation ? undefined : action.onClick}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <action.icon className="mr-1 h-3 w-3" />
                  {action.label}
                </>
              )}
            </Button>
          );

          if (action.needsConfirmation) {
            return (
              <AlertDialog key={action.key}>
                <AlertDialogTrigger asChild>{ActionButton}</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{action.confirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {action.confirmDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={action.onClick}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );
          }

          return ActionButton;
        })}
      </div>
    </motion.div>
  );
}
