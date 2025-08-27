import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";
import { UserPermissions, UserType } from "@/hooks/useUserType";
import { FilterPill } from "./FilterPill";

interface PedidosHeaderProps {
  isEstabelecimento: boolean;
  isRestaurante: boolean;
  permissions: UserPermissions;
  searchTerm: string;
  selectedStatus: string;
  totalCount: number;
  pedidos: PedidoSimplificado[];
  userType: UserType;
  onCreateNew: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: string) => void;
}

export function PedidosHeader({
  isEstabelecimento,
  isRestaurante,
  permissions,
  searchTerm,
  selectedStatus,
  totalCount,
  pedidos,
  userType,
  onCreateNew,
  onSearchChange,
  onStatusChange,
}: PedidosHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-card px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Pedidos</h1>
          <p className="text-xs text-muted-foreground">
            {isEstabelecimento && "Estabelecimento"}
            {isRestaurante && "Restaurante"}
          </p>
        </div>
        {permissions.canCreateOrders && (
          <button
            onClick={onCreateNew}
            className="rounded-lg border border-orange-500 bg-transparent p-2 text-orange-500 transition-colors hover:bg-orange-500/10"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder="Buscar pedido..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-border bg-transparent pl-10 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          <FilterPill
            active={selectedStatus === "all"}
            onClick={() => onStatusChange("all")}
            label="Todos"
            count={totalCount}
          />
          <FilterPill
            active={selectedStatus === "today"}
            onClick={() => onStatusChange("today")}
            label="Hoje"
            count={0}
          />

          {userType === "estabelecimento" || userType === "admin" ? (
            <>
              <FilterPill
                active={selectedStatus === "1"}
                onClick={() => onStatusChange("1")}
                label="Pendentes"
                count={pedidos.filter((p) => p.status === 1).length}
              />
              <FilterPill
                active={selectedStatus === "4"}
                onClick={() => onStatusChange("4")}
                label="Prontos"
                count={pedidos.filter((p) => p.status === 4).length}
              />
              <FilterPill
                active={selectedStatus === "5"}
                onClick={() => onStatusChange("5")}
                label="Entregues"
                count={pedidos.filter((p) => p.status === 5).length}
              />
            </>
          ) : (
            <>
              <FilterPill
                active={selectedStatus === "1"}
                onClick={() => onStatusChange("1")}
                label="Pendentes"
                count={pedidos.filter((p) => p.status === 1).length}
              />
              <FilterPill
                active={selectedStatus === "3"}
                onClick={() => onStatusChange("3")}
                label="Em Preparo"
                count={pedidos.filter((p) => p.status === 3).length}
              />
              <FilterPill
                active={selectedStatus === "4"}
                onClick={() => onStatusChange("4")}
                label="Prontos"
                count={pedidos.filter((p) => p.status === 4).length}
              />
              <FilterPill
                active={selectedStatus === "5"}
                onClick={() => onStatusChange("5")}
                label="Entregues"
                count={pedidos.filter((p) => p.status === 5).length}
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pedidos.length} de {totalCount} pedido{totalCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
