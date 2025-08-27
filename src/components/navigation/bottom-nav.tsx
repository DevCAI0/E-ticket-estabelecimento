// components/navigation/bottom-nav.tsx - Com badge de notificação
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, Ticket, Settings, Notebook, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfilePermissions } from "@/hooks/useProfilePermissions";
import { usePedidosPendentes } from "@/hooks/usePedidosPendentes";
import { NotificationBadge } from "@/components/ui/notification-badge";

// Função para detectar se o usuário está online
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

export function BottomNav() {
  const location = useLocation();
  const { isEstablishment, hasProfile } = useProfilePermissions();
  const { count: pedidosPendentes, hasNewOrders } = usePedidosPendentes();
  const isOnline = useOnlineStatus();

  // Verifica se está na página de pedidos
  const isOnPedidosPage = location.pathname === "/pedidos";

  // Definir itens do menu baseado no perfil do usuário
  const getMenuItems = () => {
    // Para usuários com id_perfil = 1 (estabelecimento), mostrar apenas Home, Pedidos e Ajustes
    if (isEstablishment()) {
      return [
        {
          icon: Home,
          label: "Home",
          path: "/",
        },
        {
          icon: ShoppingCart,
          label: "Pedidos",
          path: "/pedidos",
          showBadge: true,
        },
        {
          icon: Settings,
          label: "Ajustes",
          path: "/settings",
        },
      ];
    }

    // Para perfil 2 (restaurante operador), mostrar sem notas
    if (hasProfile(2)) {
      return [
        {
          icon: Home,
          label: "Home",
          path: "/",
        },
        {
          icon: Ticket,
          label: "Tickets",
          path: "/tickets",
        },
        {
          icon: ShoppingCart,
          label: "Pedidos",
          path: "/pedidos",
          showBadge: true, // Habilita badge para pedidos
        },
        {
          icon: Settings,
          label: "Ajustes",
          path: "/settings",
        },
      ];
    }

    // Para perfil 3 (gerente restaurante), mostrar menu completo incluindo notas
    return [
      {
        icon: Home,
        label: "Home",
        path: "/",
        showBadge: false,
      },
      {
        icon: Ticket,
        label: "Tickets",
        path: "/tickets",
        showBadge: false,
      },
      {
        icon: Notebook,
        label: "Notas",
        path: "/notas",
        showBadge: false,
      },
      {
        icon: ShoppingCart,
        label: "Pedidos",
        path: "/pedidos",
        showBadge: true,
      },
      {
        icon: Settings,
        label: "Ajustes",
        path: "/settings",
        showBadge: false,
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex h-16 items-center justify-around">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          // Só mostra badge se:
          // 1. O item específico tem showBadge habilitado
          // 2. Há pedidos pendentes
          // 3. O usuário NÃO está na página de pedidos
          // 4. O usuário está online
          const shouldShowBadge =
            item.showBadge === true &&
            hasNewOrders &&
            !isOnPedidosPage &&
            isOnline;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex h-full w-full flex-col items-center justify-center"
            >
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  <NotificationBadge
                    count={pedidosPendentes}
                    show={shouldShowBadge}
                  />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
