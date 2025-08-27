import { useState, useEffect, useCallback } from "react";
import { PedidosAPI } from "@/api/pedidos";
import {
  PedidoSimplificado,
  PedidosFilters,
  CriarPedidoRequest,
  PedidosListResponse,
  Pedido,
} from "@/types/pedidos";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";

interface UsePedidosResult {
  pedidos: PedidoSimplificado[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  error: string | null;
  isCreating: boolean;
  isCanceling: boolean;
  isAddingItems: boolean;
  loadMorePedidos: () => Promise<void>;
  reloadPedidos: (filters?: PedidosFilters) => Promise<void>;
  criarPedido: (data: CriarPedidoRequest) => Promise<boolean>;
  cancelarPedido: (id: number, motivo?: string) => Promise<boolean>;
  adicionarItens: (id: number, tickets: string[]) => Promise<boolean>;
  applyFilters: (filters: PedidosFilters) => void;
  clearFilters: () => void;
  currentFilters: PedidosFilters;
}

export function usePedidos(): UsePedidosResult {
  const [pedidos, setPedidos] = useState<PedidoSimplificado[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isAddingItems, setIsAddingItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<PedidosFilters>({});

  const loadPedidos = useCallback(
    async (
      page: number = 1,
      filters: PedidosFilters = {},
      append: boolean = false,
    ) => {
      try {
        setLoading(true);
        setError(null);

        const requestFilters: PedidosFilters = {
          ...filters,
          page,
          per_page: 15,
        };

        const response: PedidosListResponse =
          await PedidosAPI.listarPedidos(requestFilters);

        if (append) {
          setPedidos((prev) => [...prev, ...response.pedidos]);
        } else {
          setPedidos(response.pedidos);
        }

        setTotalCount(response.pagination.total);
        setHasMore(
          response.pagination.current_page < response.pagination.last_page,
        );
        setCurrentPage(response.pagination.current_page);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        showErrorToast("Erro ao carregar pedidos");

        if (!append) {
          setPedidos([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadMorePedidos = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadPedidos(currentPage + 1, currentFilters, true);
  }, [hasMore, loading, currentPage, currentFilters, loadPedidos]);

  const reloadPedidos = useCallback(
    async (filters: PedidosFilters = {}) => {
      setCurrentPage(1);
      setCurrentFilters(filters);
      await loadPedidos(1, filters, false);
    },
    [loadPedidos],
  );

  const applyFilters = useCallback(
    (filters: PedidosFilters) => {
      setCurrentFilters(filters);
      setCurrentPage(1);
      loadPedidos(1, filters, false);
    },
    [loadPedidos],
  );

  const clearFilters = useCallback(() => {
    setCurrentFilters({});
    setCurrentPage(1);
    loadPedidos(1, {}, false);
  }, [loadPedidos]);

  const criarPedido = useCallback(
    async (data: CriarPedidoRequest): Promise<boolean> => {
      try {
        setIsCreating(true);
        setError(null);

        await PedidosAPI.criarPedido(data);
        showSuccessToast("Pedido criado com sucesso!");

        await reloadPedidos(currentFilters);

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        showErrorToast("Erro ao criar pedido");
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [currentFilters, reloadPedidos],
  );

  const cancelarPedido = useCallback(
    async (id: number, motivo?: string): Promise<boolean> => {
      try {
        setIsCanceling(true);
        setError(null);

        await PedidosAPI.cancelarPedido(id, motivo);
        showSuccessToast("Pedido cancelado com sucesso!");

        setPedidos((prev) =>
          prev.map((pedido) =>
            pedido.id === id
              ? { ...pedido, status: 7, status_texto: "Cancelado" }
              : pedido,
          ),
        );

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        showErrorToast("Erro ao cancelar pedido");
        return false;
      } finally {
        setIsCanceling(false);
      }
    },
    [],
  );

  const adicionarItens = useCallback(
    async (id: number, tickets: string[]): Promise<boolean> => {
      try {
        setIsAddingItems(true);
        setError(null);

        const response = await PedidosAPI.adicionarItens(id, tickets);
        showSuccessToast("Itens adicionados com sucesso!");

        if (response.pedido) {
          setPedidos((prev) =>
            prev.map((pedido) =>
              pedido.id === id
                ? {
                    ...pedido,
                    total_itens: response.pedido.total_itens,
                    quantidade_total: response.pedido.quantidade_total,
                    valor_total: response.pedido.valor_total,
                  }
                : pedido,
            ),
          );
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        showErrorToast("Erro ao adicionar itens");
        return false;
      } finally {
        setIsAddingItems(false);
      }
    },
    [],
  );

  useEffect(() => {
    reloadPedidos();
  }, [reloadPedidos]);

  return {
    pedidos,
    loading,
    hasMore,
    totalCount,
    error,
    isCreating,
    isCanceling,
    isAddingItems,
    loadMorePedidos,
    reloadPedidos,
    criarPedido,
    cancelarPedido,
    adicionarItens,
    applyFilters,
    clearFilters,
    currentFilters,
  };
}

export function usePedido(id: number) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPedido = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await PedidosAPI.obterPedido(id);
      setPedido(response.pedido);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      showErrorToast("Erro ao carregar pedido");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const removerItem = useCallback(
    async (itemId: number): Promise<boolean> => {
      if (!pedido) return false;

      try {
        await PedidosAPI.removerItem(pedido.id, itemId);
        showSuccessToast("Item removido com sucesso!");

        await loadPedido();

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        showErrorToast("Erro ao remover item");
        return false;
      }
    },
    [pedido, loadPedido],
  );

  useEffect(() => {
    loadPedido();
  }, [loadPedido]);

  return {
    pedido,
    loading,
    error,
    reload: loadPedido,
    removerItem,
  };
}

export function useTicketsDisponiveis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarTickets = useCallback(
    async (numerosTickets: string[], idRestaurante: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await PedidosAPI.buscarTicketsDisponiveis({
          numeros_tickets: numerosTickets,
          id_restaurante: idRestaurante,
        });

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        showErrorToast("Erro ao buscar tickets");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    buscarTickets,
    loading,
    error,
  };
}
