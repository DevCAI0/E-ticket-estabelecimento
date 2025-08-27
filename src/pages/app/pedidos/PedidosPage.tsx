import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { AlertCircle } from "lucide-react";

import { PedidosManager } from "@/components/pedidos/pedidos-manager";
import { useUserType } from "@/hooks/useUserType";

export function PedidosPage() {
  const { userType, isEstabelecimento, isRestaurante, isAdmin, permissions } =
    useUserType();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getUserSpecificConfig = () => {
    if (isAdmin) {
      return {
        initialFilters: {
          per_page: 10,
        },
      };
    } else if (isEstabelecimento) {
      return {
        initialFilters: {
          per_page: 10,
        },
      };
    } else if (isRestaurante) {
      return {
        initialFilters: {
          per_page: 10,
          status: 1,
        },
      };
    } else {
      return {
        initialFilters: {},
      };
    }
  };

  const config = getUserSpecificConfig();
  const canViewOrders = permissions.canViewOrders || isAdmin;

  if (userType === "indefinido" && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu usuário não possui permissões para acessar o sistema de
              pedidos. Entre em contato com o administrador.
            </AlertDescription>
          </Alert>
        </div>
        <Toaster />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PedidosPageSkeleton />
        <Toaster />
      </div>
    );
  }

  if (!canViewOrders) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para visualizar pedidos. Entre em contato
              com o administrador.
            </AlertDescription>
          </Alert>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PedidosManager initialFilters={config.initialFilters} />
      <Toaster />
    </div>
  );
}

export function PedidosPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mb-3 h-10 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="mb-3 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="flex justify-between">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PedidosPage;
