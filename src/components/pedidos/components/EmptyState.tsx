import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { UserType } from "@/hooks/useUserType";

interface EmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
  userType: UserType;
  canCreateOrders: boolean;
}

export function EmptyState({
  hasFilters,
  onCreateNew,
  userType,
  canCreateOrders,
}: EmptyStateProps) {
  const getEmptyMessage = () => {
    if (hasFilters) {
      return {
        title: "Nenhum pedido encontrado",
        description: "Tente ajustar os filtros para encontrar pedidos",
      };
    }

    if (userType === "estabelecimento" || userType === "admin") {
      return {
        title: "Nenhum pedido criado",
        description: "Comece criando seu primeiro pedido de refeições",
      };
    } else if (userType === "restaurante") {
      return {
        title: "Nenhum pedido recebido",
        description: "Aguarde pedidos das garagens chegarem",
      };
    }

    return {
      title: "Nenhum pedido encontrado",
      description: "Não há pedidos disponíveis no momento",
    };
  };

  const message = getEmptyMessage();

  return (
    <div className="py-12 text-center">
      <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
      <h3 className="mb-2 text-lg font-medium">{message.title}</h3>
      <p className="mb-4 text-muted-foreground">{message.description}</p>
      {!hasFilters && canCreateOrders && (
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Primeiro Pedido
        </Button>
      )}
    </div>
  );
}
