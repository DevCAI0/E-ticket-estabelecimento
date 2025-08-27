import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";
import { UserPermissions, UserType } from "@/hooks/useUserType";
import { PedidoCard } from "./PedidoCard";
import { EmptyState } from "./EmptyState";

interface PedidosListProps {
  pedidos: PedidoSimplificado[];
  userType: UserType;
  permissions: UserPermissions;
  loadingActions: { [key: number]: string };
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  activeFiltersCount: number;
  ticketsStatus: { [key: number]: boolean };
  onViewDetails: (id: number) => void;
  onCancel: (id: number) => void;
  onAddItems: (id: number) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onMarkReady: (id: number) => void;
  onShowQRCode: (pedido: PedidoSimplificado) => void;
  onScanQRCode: (pedido: PedidoSimplificado) => void;
  onLoadMore: () => void;
  onCreateNew: () => void;
  onDeliverToEmployee: (pedido: PedidoSimplificado) => void;
}

export function PedidosList({
  pedidos,
  userType,
  permissions,
  loadingActions,
  loadingMore,
  hasMore,
  activeFiltersCount,
  ticketsStatus,
  onViewDetails,
  onCancel,
  onAddItems,
  onAccept,
  onReject,
  onMarkReady,
  onShowQRCode,
  onScanQRCode,
  onLoadMore,
  onCreateNew,
  onDeliverToEmployee,
}: PedidosListProps) {
  return (
    <div className="space-y-3 px-4 py-3">
      <AnimatePresence>
        {pedidos.map((pedido, index) => (
          <PedidoCard
            key={`${pedido.id}-${pedido.codigo_pedido}`}
            pedido={pedido}
            index={index}
            userType={userType}
            permissions={permissions}
            loadingAction={loadingActions[pedido.id] || ""}
            allTicketsDelivered={ticketsStatus[pedido.id] || false}
            onViewDetails={() => onViewDetails(pedido.id)}
            onCancel={() => onCancel(pedido.id)}
            onAddItems={() => onAddItems(pedido.id)}
            onAccept={() => onAccept(pedido.id)}
            onReject={() => onReject(pedido.id)}
            onMarkReady={() => onMarkReady(pedido.id)}
            onShowQRCode={() => onShowQRCode(pedido)}
            onScanQRCode={() => onScanQRCode(pedido)}
            onDeliverToEmployee={() => onDeliverToEmployee(pedido)}
          />
        ))}
      </AnimatePresence>

      {pedidos.length === 0 && (
        <EmptyState
          hasFilters={activeFiltersCount > 0}
          onCreateNew={onCreateNew}
          userType={userType}
          canCreateOrders={permissions.canCreateOrders}
        />
      )}

      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="text-muted-foreground">
            Carregando mais pedidos...
          </span>
        </div>
      )}

      {hasMore && pedidos.length > 0 && !loadingMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} className="w-full">
            Ver Mais Pedidos
          </Button>
        </div>
      )}
    </div>
  );
}
