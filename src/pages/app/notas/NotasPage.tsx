// src/pages/NotasPage.tsx
import { ArrowLeft, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotasList } from "@/components/notas/NotasList";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNotasList } from "@/hooks/notas/useNotasList";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";

export function NotasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lastVisibilityCheckRef = useRef<number>(0);

  const {
    notas,
    loading,
    refreshing,
    hasMore,
    error,
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
    verificarAtualizacoes,
    total,
  } = useNotasList();

  // Hook para detectar quando a página fica visível e verificar atualizações
  usePageVisibility({
    onVisible: () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastVisibilityCheckRef.current;

      // Verificar atualizações apenas se passou mais de 2 minutos desde a última verificação
      // e se há notas carregadas (evita verificação desnecessária na primeira carga)
      if (timeSinceLastCheck > 2 * 60 * 1000 && notas.length > 0) {
        lastVisibilityCheckRef.current = now;
        verificarAtualizacoes();
      }
    },
    debounceMs: 1500, // Aguardar 1.5s antes de verificar
  });

  if (!user) {
    return (
      <div className="p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Notas Financeiras</h1>
        </div>
        <p className="text-center text-muted-foreground">
          Usuário não encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <div className="sticky top-0 z-50 border-b border-border bg-background p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Notas Financeiras</h1>
          </div>
        </div>
      </div>

      <div className="pb-20">
        {/* Resumo rápido */}
        {total > 0 && (
          <div className="p-4">
            <Card className="bg-primary/5">
              <CardContent className="p-3">
                <div className="text-center">
                  <p className="text-sm text-primary">
                    <strong>{total}</strong>{" "}
                    {total === 1 ? "nota encontrada" : "notas encontradas"} em{" "}
                    <strong>
                      {nomeMes} {ano}
                    </strong>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Apenas notas aprovadas e pagas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="border-b border-border p-4">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <span className="font-medium">Erro:</span>
                  <span>{error}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshNotas}
                  disabled={refreshing}
                  className="mt-2 text-destructive hover:text-destructive/80"
                >
                  <RefreshCw
                    className={`mr-2 h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de notas */}
        <NotasList
          notas={notas}
          loading={loading}
          refreshing={refreshing}
          hasMore={hasMore}
          pagination={pagination}
          periodo={periodo}
          mes={mes}
          ano={ano}
          nomeMes={nomeMes}
          isMesAtual={isMesAtual}
          loadMoreNotas={loadMoreNotas}
          refreshNotas={refreshNotas}
          alterarPeriodo={alterarPeriodo}
          voltarMesAtual={voltarMesAtual}
        />
      </div>
    </div>
  );
}
