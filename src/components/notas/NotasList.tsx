// src/components/notas/NotasList.tsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NotaCard } from "./NotaCard";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { NotasActions } from "./NotasActions";
import Loading from "../Loading";
import { ArrowUp, FileText, RefreshCw } from "lucide-react";
import {
  NotaRestaurante,
  PaginationInfo,
  PeriodoInfo,
} from "@/services/notasRestauranteService";

interface NotasListProps {
  notas: NotaRestaurante[];
  loading: boolean;
  refreshing?: boolean;
  hasMore: boolean;
  pagination: PaginationInfo | null;
  periodo: PeriodoInfo | null;
  mes: number;
  ano: number;
  nomeMes: string;
  isMesAtual: boolean;
  loadMoreNotas: () => void;
  refreshNotas: () => void;
  alterarPeriodo: (novoMes: number, novoAno: number) => void;
  voltarMesAtual: () => void;
}

// Componente skeleton para carregamento
function NotaCardSkeleton() {
  return (
    <Card className="mb-3 animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted"></div>
            <div>
              <div className="w-24 h-4 mb-1 rounded bg-muted"></div>
              <div className="w-32 h-3 rounded bg-muted"></div>
            </div>
          </div>
          <div className="w-20 h-6 rounded bg-muted"></div>
        </div>

        <div className="p-3 mb-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded bg-muted"></div>
            <div className="w-16 h-4 rounded bg-muted"></div>
          </div>
          <div className="w-48 h-4 mb-1 rounded bg-muted"></div>
          <div className="w-32 h-3 rounded bg-muted"></div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted"></div>
            <div className="w-20 h-6 rounded bg-muted"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted"></div>
            <div className="w-16 h-4 rounded bg-muted"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotasList({
  notas,
  loading,
  refreshing = false,
  hasMore,
  pagination,
  periodo,
  mes,
  ano,
  nomeMes,
  isMesAtual,
  loadMoreNotas,
  refreshNotas,
  alterarPeriodo,
  voltarMesAtual,
}: NotasListProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Função para formatar data corretamente
  const formatarData = (dataString: string) => {
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      const hasScroll =
        window.innerHeight < document.documentElement.scrollHeight;
      setShowScrollTop(hasScroll && window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initially
    return () => window.removeEventListener("scroll", handleScroll);
  }, [notas.length]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    await loadMoreNotas();
    setIsLoadingMore(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Validação se notas é array
  if (!Array.isArray(notas)) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Erro: Dados de notas inválidos</p>
      </div>
    );
  }

  // Loading inicial (apenas quando não há notas carregadas)
  if (loading && !isLoadingMore && notas.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Carregando Notas de {nomeMes} {ano}...
          </h2>
        </div>
        <div className="space-y-4">
          <NotaCardSkeleton />
          <NotaCardSkeleton />
          <NotaCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Navegação de período */}
      <div className="mb-4">
        <NotasActions
          mes={mes}
          ano={ano}
          isMesAtual={isMesAtual}
          onPeriodoChange={alterarPeriodo}
          onVoltarMesAtual={voltarMesAtual}
        />
      </div>

      {/* Header com contador e indicador de refresh */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            {nomeMes} {ano} ({notas.length}
            {pagination && ` de ${pagination.total}`})
          </h2>

          {/* Indicador de refresh em background */}
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verificando atualizações...</span>
            </div>
          )}
        </div>

        {/* Informação do período */}
        {periodo && (
          <div className="mt-2 text-sm text-muted-foreground">
            Período: {formatarData(periodo.data_inicio)} até{" "}
            {formatarData(periodo.data_fim)}
          </div>
        )}
      </div>

      {/* Lista de notas */}
      <div className="space-y-3">
        <AnimatePresence>
          {notas.map((nota, index) => (
            <NotaCard key={`${nota.id}-${index}`} nota={nota} index={index} />
          ))}
        </AnimatePresence>

        {/* Mensagem quando não há notas */}
        {notas.length === 0 && !loading && (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              Nenhuma nota encontrada para {nomeMes} {ano}
            </p>
            <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={refreshNotas}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Tentar novamente
              </Button>
              {!isMesAtual && (
                <Button variant="outline" onClick={voltarMesAtual}>
                  Ir para mês atual
                </Button>
              )}
            </div>
          </div>
        )}

        {isLoadingMore && (
          <div className="py-6 text-center">
            <Loading
              variant="dots"
              size="md"
              text="Carregando mais notas..."
              color="primary"
            />
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex flex-col items-center gap-4 pt-4">
          {/* Condição melhorada para mostrar o botão "Ver Mais" */}
          {hasMore &&
            notas.length > 0 &&
            pagination &&
            pagination.current_page < pagination.last_page && (
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore || refreshing}
                className="w-full max-w-xs"
              >
                {isLoadingMore ? "Carregando..." : "Ver Mais"}
              </Button>
            )}

          {showScrollTop && (
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
