import { useState, useEffect, useCallback, useRef } from "react";
import {
  NotaRestaurante,
  PaginationInfo,
  PeriodoInfo,
  buscarNotasComPaginacao,
  obterNomeMes,
  validarPeriodo,
} from "@/services/notasRestauranteService";
import { useAuth } from "@/hooks/auth/useAuth";
import { notasCacheService } from "@/services/notasCacheService";
import { showErrorToast } from "@/components/ui/sonner";

export interface UseNotasListProps {
  mesInicial?: number;
  anoInicial?: number;
  autoLoad?: boolean;
  cacheTimeout?: number;
}

export function useNotasList({
  mesInicial,
  anoInicial,
  autoLoad = true,
  cacheTimeout = 5,
}: UseNotasListProps = {}) {
  const { user } = useAuth();

  const agora = new Date();
  const [mes, setMes] = useState(mesInicial || agora.getMonth() + 1);
  const [ano, setAno] = useState(anoInicial || agora.getFullYear());

  const [notas, setNotas] = useState<NotaRestaurante[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoInfo | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);
  const dataTimestampRef = useRef<number>(0);

  const getCacheKey = useCallback(
    (mesParam: number, anoParam: number) => {
      if (!user?.id) return "";
      return notasCacheService.generateCacheKey(user.id, {
        mes: mesParam,
        ano: anoParam,
      });
    },
    [user?.id],
  );

  const loadFromCache = useCallback((cacheKey: string) => {
    const cached = notasCacheService.getCachedData(cacheKey);
    if (cached) {
      setNotas(cached.data);
      setPagination(cached.pagination);
      setPeriodo(cached.periodo);
      setHasMore(
        cached.pagination ? cached.data.length < cached.pagination.total : true,
      );
      dataTimestampRef.current = cached.timestamp;
      return true;
    }
    return false;
  }, []);

  const fetchNotas = useCallback(
    async (
      pageNumber = 1,
      mesParam = mes,
      anoParam = ano,
      options: {
        showLoading?: boolean;
        isRefresh?: boolean;
        bypassCache?: boolean;
      } = {},
    ) => {
      const {
        showLoading = true,
        isRefresh = false,
        bypassCache = false,
      } = options;

      if (!validarPeriodo(mesParam, anoParam)) {
        setError("Mês ou ano inválido");
        return;
      }

      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        if (showLoading && !isRefresh) {
          setLoading(true);
        } else if (isRefresh) {
          setRefreshing(true);
        }

        setError(null);

        const cacheKey = getCacheKey(mesParam, anoParam);

        if (
          pageNumber === 1 &&
          !isRefresh &&
          !bypassCache &&
          notasCacheService.isCacheValid(cacheKey, cacheTimeout)
        ) {
          if (loadFromCache(cacheKey)) {
            setTimeout(() => {
              fetchNotas(1, mesParam, anoParam, {
                showLoading: false,
                isRefresh: true,
                bypassCache: true,
              });
            }, 100);
            return;
          }
        }

        const now = Date.now();
        lastFetchRef.current = now;

        const response = await buscarNotasComPaginacao(
          pageNumber,
          20,
          mesParam,
          anoParam,
        );

        if (lastFetchRef.current !== now) {
          return;
        }

        if (!response.success) {
          throw new Error("Falha na resposta da API");
        }

        const notasData = response.data || [];

        if (!Array.isArray(notasData)) {
          throw new Error("Formato de dados inválido recebido da API");
        }

        if (isRefresh && pageNumber === 1) {
          const cached = notasCacheService.getCachedData(cacheKey);
          if (
            cached &&
            JSON.stringify(cached.data.slice(0, 20)) ===
              JSON.stringify(notasData)
          ) {
            notasCacheService.setCachedData(
              cacheKey,
              cached.data,
              cached.pagination,
              cached.periodo,
              { mes: mesParam, ano: anoParam },
              cached.lastPage,
            );
            return;
          }
        }

        if (pageNumber === 1) {
          setNotas(notasData);
          dataTimestampRef.current = now;
        } else {
          setNotas((prev) => [...prev, ...notasData]);
        }

        setPagination(response.pagination);
        setPeriodo(response.periodo);

        if (pageNumber === 1) {
          notasCacheService.setCachedData(
            cacheKey,
            notasData,
            response.pagination,
            response.periodo,
            { mes: mesParam, ano: anoParam },
            1,
          );
        } else {
          notasCacheService.appendPageToCache(
            cacheKey,
            notasData,
            response.pagination,
            pageNumber,
          );
        }

        const temMaisPaginas =
          pageNumber < response.pagination.last_page && notasData.length === 20;

        setHasMore(temMaisPaginas);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Falha ao carregar as notas. Tente novamente.";

        setError(errorMessage);
        showErrorToast(errorMessage);

        if (pageNumber === 1) {
          const cacheKey = getCacheKey(mesParam, anoParam);
          if (!loadFromCache(cacheKey)) {
            setNotas([]);
            setPagination(null);
            setPeriodo(null);
          }
        }
      } finally {
        if (showLoading && !isRefresh) {
          setLoading(false);
        } else if (isRefresh) {
          setRefreshing(false);
        }
        abortControllerRef.current = null;
      }
    },
    [mes, ano, cacheTimeout, getCacheKey, loadFromCache],
  );

  useEffect(() => {
    if (autoLoad && user) {
      setPage(1);
      fetchNotas(1, mes, ano);
    }
  }, [user, mes, ano, autoLoad, fetchNotas]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadMoreNotas = useCallback(async () => {
    if (hasMore && !loading && !refreshing && pagination) {
      if (notas.length >= pagination.total) {
        setHasMore(false);
        return;
      }

      const nextPage = page + 1;
      const cacheKey = getCacheKey(mes, ano);

      if (notasCacheService.hasPage(cacheKey, nextPage)) {
        const cachedPageData = notasCacheService.getPageFromCache(
          cacheKey,
          nextPage,
        );
        if (cachedPageData) {
          setNotas((prev) => [...prev, ...cachedPageData]);
          setPage(nextPage);
          return;
        }
      }

      setPage(nextPage);
      await fetchNotas(nextPage, mes, ano, { showLoading: false });
    }
  }, [
    hasMore,
    loading,
    refreshing,
    pagination,
    notas.length,
    page,
    getCacheKey,
    mes,
    ano,
    fetchNotas,
  ]);

  const refreshNotas = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchNotas(1, mes, ano, { isRefresh: true, bypassCache: true });
  }, [fetchNotas, mes, ano]);

  const alterarPeriodo = useCallback(
    async (novoMes: number, novoAno: number) => {
      if (!validarPeriodo(novoMes, novoAno)) {
        setError("Mês ou ano inválido");
        return;
      }

      setMes(novoMes);
      setAno(novoAno);
      setPage(1);
      setHasMore(true);
      await fetchNotas(1, novoMes, novoAno, { bypassCache: true });
    },
    [fetchNotas],
  );

  const voltarMesAtual = useCallback(async () => {
    const agora = new Date();
    await alterarPeriodo(agora.getMonth() + 1, agora.getFullYear());
  }, [alterarPeriodo]);

  const mesAnterior = useCallback(async () => {
    let novoMes = mes - 1;
    let novoAno = ano;

    if (novoMes < 1) {
      novoMes = 12;
      novoAno = ano - 1;
    }

    await alterarPeriodo(novoMes, novoAno);
  }, [mes, ano, alterarPeriodo]);

  const proximoMes = useCallback(async () => {
    let novoMes = mes + 1;
    let novoAno = ano;

    if (novoMes > 12) {
      novoMes = 1;
      novoAno = ano + 1;
    }

    await alterarPeriodo(novoMes, novoAno);
  }, [mes, ano, alterarPeriodo]);

  const carregarNotas = useCallback(async () => {
    if (!loading && !refreshing) {
      setPage(1);
      await fetchNotas(1, mes, ano, { bypassCache: true });
    }
  }, [loading, refreshing, fetchNotas, mes, ano]);

  const limparCache = useCallback(() => {
    if (user?.id) {
      notasCacheService.invalidateMonthCache(user.id, mes, ano);
    }
  }, [user?.id, mes, ano]);

  const verificarAtualizacoes = useCallback(async () => {
    if (!refreshing && !loading) {
      await fetchNotas(1, mes, ano, {
        showLoading: false,
        isRefresh: true,
        bypassCache: true,
      });
    }
  }, [refreshing, loading, fetchNotas, mes, ano]);

  const isMesAtual = useCallback(() => {
    const agora = new Date();
    return mes === agora.getMonth() + 1 && ano === agora.getFullYear();
  }, [mes, ano]);

  return {
    notas,
    loading,
    refreshing,
    hasMore,
    error,
    pagination,
    periodo,
    mes,
    ano,
    nomeMes: obterNomeMes(mes),
    isMesAtual: isMesAtual(),
    loadMoreNotas,
    refreshNotas,
    carregarNotas,
    verificarAtualizacoes,
    limparCache,
    alterarPeriodo,
    voltarMesAtual,
    mesAnterior,
    proximoMes,
    total: pagination?.total || 0,
    currentPage: pagination?.current_page || 1,
    totalPages: pagination?.last_page || 1,
    isFirstPage: page === 1,
    isLastPage: !hasMore,
    isEmpty: notas.length === 0,
    cacheStats:
      process.env.NODE_ENV === "development"
        ? notasCacheService.getCacheStats()
        : undefined,
  };
}
