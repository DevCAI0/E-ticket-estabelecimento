// src/services/notasCacheService.ts
import {
  NotaRestaurante,
  PaginationInfo,
  PeriodoInfo,
  ParametrosListagemNotas,
} from "@/services/notasRestauranteService";

interface CacheEntry {
  data: NotaRestaurante[];
  pagination: PaginationInfo | null;
  periodo: PeriodoInfo | null;
  timestamp: number;
  filtros: ParametrosListagemNotas;
  lastPage: number;
}

class NotasCacheService {
  private cache = new Map<string, CacheEntry>();
  private defaultTimeout = 5; // 5 minutos

  // Gerar chave única para o cache baseada nos filtros e usuário
  generateCacheKey(
    userId: string | number,
    filtros: ParametrosListagemNotas,
  ): string {
    // Usar apenas mes/ano para a chave, ignorando page/per_page
    const { mes = new Date().getMonth() + 1, ano = new Date().getFullYear() } =
      filtros;
    return `notas_${userId}_${ano}_${mes}`;
  }

  // Verificar se o cache é válido
  isCacheValid(cacheKey: string, timeoutMinutes?: number): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    const timeout = timeoutMinutes || this.defaultTimeout;
    const now = Date.now();
    const cacheAge = (now - cached.timestamp) / (1000 * 60); // em minutos
    return cacheAge < timeout;
  }

  // Obter dados do cache
  getCachedData(cacheKey: string): CacheEntry | null {
    return this.cache.get(cacheKey) || null;
  }

  // Salvar dados no cache
  setCachedData(
    cacheKey: string,
    data: NotaRestaurante[],
    pagination: PaginationInfo | null,
    periodo: PeriodoInfo | null,
    filtros: ParametrosListagemNotas,
    lastPage: number = 1,
  ): void {
    this.cache.set(cacheKey, {
      data,
      pagination,
      periodo,
      timestamp: Date.now(),
      filtros,
      lastPage,
    });

    // Limpar caches antigos para evitar uso excessivo de memória
    this.cleanOldCaches();
  }

  // Adicionar dados de uma página específica ao cache existente
  appendPageToCache(
    cacheKey: string,
    newData: NotaRestaurante[],
    pagination: PaginationInfo | null,
    pageNumber: number,
  ): void {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const updatedData = [...cached.data, ...newData];
      this.cache.set(cacheKey, {
        ...cached,
        data: updatedData,
        pagination,
        timestamp: Date.now(),
        lastPage: Math.max(cached.lastPage, pageNumber),
      });
    }
  }

  // Verificar se uma página específica já está no cache
  hasPage(cacheKey: string, pageNumber: number): boolean {
    const cached = this.cache.get(cacheKey);
    return cached ? pageNumber <= cached.lastPage : false;
  }

  // Obter dados de uma página específica do cache
  getPageFromCache(
    cacheKey: string,
    pageNumber: number,
    perPage: number = 20,
  ): NotaRestaurante[] | null {
    const cached = this.cache.get(cacheKey);
    if (!cached || !this.hasPage(cacheKey, pageNumber)) {
      return null;
    }

    const startIndex = (pageNumber - 1) * perPage;
    const endIndex = startIndex + perPage;
    return cached.data.slice(startIndex, endIndex);
  }

  // Invalidar cache específico
  invalidateCache(cacheKey: string): void {
    this.cache.delete(cacheKey);
  }

  // Invalidar todos os caches de um usuário
  invalidateUserCaches(userId: string | number): void {
    const userPrefix = `notas_${userId}_`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(userPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Invalidar cache de um mês específico
  invalidateMonthCache(
    userId: string | number,
    mes: number,
    ano: number,
  ): void {
    const cacheKey = `notas_${userId}_${ano}_${mes}`;
    this.cache.delete(cacheKey);
  }

  // Limpar todos os caches
  clearAllCaches(): void {
    this.cache.clear();
  }

  // Limpar caches antigos (mais de 30 minutos)
  private cleanOldCaches(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutos em ms

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  // Verificar se há dados mais novos no cache
  hasNewerData(
    cacheKey: string,
    currentData: NotaRestaurante[],
    currentTimestamp: number,
  ): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    // Verificar se o cache é mais recente
    if (cached.timestamp <= currentTimestamp) return false;

    // Verificar se os dados são diferentes (comparação simples por tamanho e primeiro item)
    if (cached.data.length !== currentData.length) return true;
    if (cached.data.length === 0) return false;

    // Comparar alguns campos chave do primeiro item
    const cachedFirst = cached.data[0];
    const currentFirst = currentData[0];

    return (
      cachedFirst?.id !== currentFirst?.id ||
      cachedFirst?.status !== currentFirst?.status ||
      cachedFirst?.data_cadastro_formatada !==
        currentFirst?.data_cadastro_formatada
    );
  }

  // Obter estatísticas do cache
  getCacheStats(): {
    totalEntries: number;
    totalDataSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
    monthsCached: Array<{ mes: number; ano: number; itemCount: number }>;
  } {
    const now = Date.now();
    let totalDataSize = 0;
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;
    const monthsCached: Array<{ mes: number; ano: number; itemCount: number }> =
      [];

    for (const [key, entry] of this.cache.entries()) {
      totalDataSize += entry.data.length;

      if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }

      if (newestTimestamp === null || entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }

      // Extrair mes/ano da chave (formato: notas_userId_ano_mes)
      const keyParts = key.split("_");
      if (keyParts.length >= 4) {
        const ano = parseInt(keyParts[2]);
        const mes = parseInt(keyParts[3]);
        if (!isNaN(ano) && !isNaN(mes)) {
          monthsCached.push({ mes, ano, itemCount: entry.data.length });
        }
      }
    }

    return {
      totalEntries: this.cache.size,
      totalDataSize,
      oldestEntry: oldestTimestamp
        ? Math.floor((now - oldestTimestamp) / (1000 * 60))
        : null,
      newestEntry: newestTimestamp
        ? Math.floor((now - newestTimestamp) / (1000 * 60))
        : null,
      monthsCached,
    };
  }
}

// Instância singleton do serviço de cache
export const notasCacheService = new NotasCacheService();

// Hook para usar o cache service
export function useNotasCache() {
  return notasCacheService;
}
