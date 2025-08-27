import { useState, useEffect, useCallback } from "react";
import { PedidosAPI } from "@/api/pedidos";
import { useUserType } from "@/hooks/useUserType";
import { PedidosFilters } from "@/types/pedidos";

export const PEDIDOS_UPDATE_EVENT = "pedidos-updated";

interface PedidosPendentesData {
  count: number;
  hasNewOrders: boolean;
  loading: boolean;
  error: string | null;
}

export function usePedidosPendentes() {
  const { isEstabelecimento, isRestaurante, isAdmin } = useUserType();
  const [data, setData] = useState<PedidosPendentesData>({
    count: 0,
    hasNewOrders: false,
    loading: false,
    error: null,
  });

  const triggerUpdate = useCallback(() => {
    const event = new CustomEvent(PEDIDOS_UPDATE_EVENT);
    window.dispatchEvent(event);
  }, []);

  const fetchPedidosPendentes = useCallback(async () => {
    if (!isEstabelecimento && !isRestaurante && !isAdmin) {
      return;
    }

    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let totalCount = 0;

      if (isRestaurante) {
        const filters: PedidosFilters = { per_page: 1, status: 1 };
        const response = await PedidosAPI.listarPedidos(filters);
        totalCount = response.pagination.total || 0;
      } else if (isEstabelecimento) {
        // Para estabelecimento, contar pedidos pendentes (status 1) e em preparo (status 3)
        const filtersPendentes: PedidosFilters = { per_page: 1, status: 1 };
        const responsePendentes =
          await PedidosAPI.listarPedidos(filtersPendentes);

        const filtersEmPreparo: PedidosFilters = { per_page: 1, status: 3 };
        const responseEmPreparo =
          await PedidosAPI.listarPedidos(filtersEmPreparo);

        totalCount =
          (responsePendentes.pagination.total || 0) +
          (responseEmPreparo.pagination.total || 0);
      }

      setData((prev) => ({
        ...prev,
        count: totalCount,
        hasNewOrders: totalCount > 0,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }));
    }
  }, [isEstabelecimento, isRestaurante, isAdmin]);

  const refresh = useCallback(() => {
    fetchPedidosPendentes();
  }, [fetchPedidosPendentes]);

  useEffect(() => {
    fetchPedidosPendentes();
  }, [fetchPedidosPendentes]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchPedidosPendentes();
    };

    window.addEventListener(PEDIDOS_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(PEDIDOS_UPDATE_EVENT, handleUpdate);
  }, [fetchPedidosPendentes]);

  useEffect(() => {
    if (!isEstabelecimento && !isRestaurante && !isAdmin) {
      return;
    }

    const interval = setInterval(() => {
      fetchPedidosPendentes();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPedidosPendentes, isEstabelecimento, isRestaurante, isAdmin]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPedidosPendentes();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchPedidosPendentes]);

  return {
    ...data,
    refresh,
    triggerUpdate,
  };
}
