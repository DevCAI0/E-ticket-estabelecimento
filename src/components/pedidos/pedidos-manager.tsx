import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import {
  PedidoSimplificado,
  PedidosFilters,
  PedidosListResponse,
  CriarPedidoRequest,
  Pedido,
  PedidoItem,
} from "@/types/pedidos";
import { PedidosAPI } from "@/api/pedidos";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";
import { useUserType, useActionPermission } from "@/hooks/useUserType";
import { PedidoDetalhesDialog } from "./detalhes-pedido-dialog";
import { CriarPedidoDialog } from "./criar-pedido-dialog";
import { AdicionarItensDialog } from "./adicionar-itens-dialog";
import { CancelPedidoDialog } from "./components/CancelPedidoDialog";
import { RejectPedidoDialog } from "./components/RejectPedidoDialog";
import { QRCodeDialog } from "./qr-code-dialog";
import { QRScannerDialog } from "./qr-scanner-dialog";
import { DeliverToEmployeeDialog } from "./DeliverToEmployeeDialog";
import { PedidosHeader } from "./components/PedidosHeader";
import { PedidosList } from "./components/PedidosList";
import { PedidosListSkeleton } from "./components/PedidosListSkeleton";
import { notificarAtualizacaoPedidos } from "@/utils/pedidosUtils";

interface PedidosManagerProps {
  initialFilters?: PedidosFilters;
}

export function PedidosManager({ initialFilters = {} }: PedidosManagerProps) {
  const [pedidos, setPedidos] = useState<PedidoSimplificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PedidosFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [ticketsStatus, setTicketsStatus] = useState<{
    [key: number]: boolean;
  }>({});

  const [showCriarDialog, setShowCriarDialog] = useState(false);
  const [showAdicionarItensDialog, setShowAdicionarItensDialog] =
    useState(false);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [showQRScannerDialog, setShowQRScannerDialog] = useState(false);
  const [showDeliverToEmployeeDialog, setShowDeliverToEmployeeDialog] =
    useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const [pedidoSelecionado, setPedidoSelecionado] = useState<number | null>(
    null,
  );
  const [pedidoDetalhes, setPedidoDetalhes] = useState<Pedido | null>(null);
  const [pedidoParaQR, setPedidoParaQR] = useState<PedidoSimplificado | null>(
    null,
  );
  const [pedidoParaScanner, setPedidoParaScanner] =
    useState<PedidoSimplificado | null>(null);
  const [pedidoParaEntrega, setPedidoParaEntrega] =
    useState<PedidoSimplificado | null>(null);
  const [pedidoParaCancelar, setPedidoParaCancelar] =
    useState<PedidoSimplificado | null>(null);
  const [pedidoParaRecusar, setPedidoParaRecusar] =
    useState<PedidoSimplificado | null>(null);

  const [loadingActions, setLoadingActions] = useState<{
    [key: number]: string;
  }>({});

  const isInitialLoad = useRef(true);

  const { userType, isEstabelecimento, isRestaurante, permissions } =
    useUserType();
  const { canPerformAction, getRestrictedMessage } = useActionPermission();

  const checkTicketsStatus = useCallback(
    async (pedidosParaVerificar: PedidoSimplificado[]) => {
      const statusMap: { [key: number]: boolean } = {};

      for (const pedido of pedidosParaVerificar) {
        if (pedido.status === 5) {
          try {
            const response = await PedidosAPI.obterPedido(pedido.id);
            if (response.success && response.pedido.itensPedido) {
              const todosEntregues = response.pedido.itensPedido.every(
                (
                  item: PedidoItem & {
                    ticket_entregue?: boolean;
                    status_ticket?: number;
                  },
                ) => item.ticket_entregue || item.status_ticket === 3,
              );
              statusMap[pedido.id] = todosEntregues;
            } else {
              statusMap[pedido.id] = false;
            }
          } catch {
            statusMap[pedido.id] = false;
          }
        } else {
          statusMap[pedido.id] = false;
        }
      }

      setTicketsStatus((prev) => ({ ...prev, ...statusMap }));
    },
    [],
  );

  const carregarPedidos = useCallback(
    async (resetList = false) => {
      try {
        if (resetList) {
          setLoading(true);
          setCurrentPage(1);
        } else {
          setLoadingMore(true);
        }

        const page = resetList ? 1 : currentPage;
        let filtrosParaUsar = filters;

        if (isInitialLoad.current) {
          filtrosParaUsar = {};
        }

        const filtrosLimpos = Object.fromEntries(
          Object.entries(filtrosParaUsar).filter(
            ([, value]) =>
              value !== undefined && value !== null && value !== "",
          ),
        );

        const filtrosComPaginacao: PedidosFilters = {
          ...filtrosLimpos,
          page,
          per_page: 10,
        };

        const response: PedidosListResponse =
          await PedidosAPI.listarPedidos(filtrosComPaginacao);

        if (response.success) {
          const novosPedidos = response.pedidos;

          if (resetList) {
            setPedidos(novosPedidos);
            setTicketsStatus({});
          } else {
            setPedidos((prev) => [...prev, ...novosPedidos]);
          }

          setTotalCount(response.pagination.total);
          setHasMore(
            response.pagination.current_page < response.pagination.last_page,
          );

          if (!resetList) {
            setCurrentPage((prev) => prev + 1);
          }

          const pedidosEntregues = novosPedidos.filter((p) => p.status === 5);
          if (pedidosEntregues.length > 0) {
            await checkTicketsStatus(pedidosEntregues);
          }

          if (isInitialLoad.current && resetList) {
            const pedidosPendentes = response.pedidos.filter(
              (p) => p.status === 1,
            );
            if (pedidosPendentes.length > 0) {
              setSelectedStatus("1");
            } else {
              setSelectedStatus("all");
            }
          }
        }
      } catch {
        showErrorToast("Erro ao carregar pedidos");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, currentPage, checkTicketsStatus],
  );

  const buscarDetalhesPedido = async (id: number) => {
    if (!canPerformAction("canViewOrders")) {
      showErrorToast(getRestrictedMessage("canViewOrders"));
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [id]: "loading" }));
      const response = await PedidosAPI.obterPedido(id);

      if (response.success) {
        setPedidoDetalhes(response.pedido);
        setShowDetalhesDialog(true);
      }
    } catch {
      showErrorToast("Erro ao carregar detalhes do pedido");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const cancelarPedido = async (id: number) => {
    if (!canPerformAction("canCancelOrders")) {
      showErrorToast(getRestrictedMessage("canCancelOrders"));
      return;
    }

    const pedido = pedidos.find((p) => p.id === id);
    if (pedido) {
      setPedidoParaCancelar(pedido);
      setShowCancelDialog(true);
    }
  };

  const confirmarCancelamento = async (motivo: string) => {
    if (!pedidoParaCancelar) return;

    try {
      setLoadingActions((prev) => ({
        ...prev,
        [pedidoParaCancelar.id]: "canceling",
      }));
      const response = await PedidosAPI.cancelarPedido(
        pedidoParaCancelar.id,
        motivo,
      );

      if (response.success) {
        showSuccessToast("Pedido cancelado com sucesso");
        carregarPedidos(true);
        notificarAtualizacaoPedidos();
      }
    } catch {
      showErrorToast("Erro ao cancelar pedido");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [pedidoParaCancelar.id]: "" }));
      setShowCancelDialog(false);
      setPedidoParaCancelar(null);
    }
  };

  const aceitarPedido = async (id: number) => {
    if (!canPerformAction("canAcceptOrders")) {
      showErrorToast(getRestrictedMessage("canAcceptOrders"));
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [id]: "accepting" }));
      const response = await PedidosAPI.aceitarPedido(id);

      if (response.success) {
        showSuccessToast("Pedido aceito e em preparo!");
        carregarPedidos(true);
        notificarAtualizacaoPedidos();
      }
    } catch {
      showErrorToast("Erro ao aceitar pedido");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const recusarPedido = async (id: number) => {
    if (!canPerformAction("canRejectOrders")) {
      showErrorToast(getRestrictedMessage("canRejectOrders"));
      return;
    }

    const pedido = pedidos.find((p) => p.id === id);
    if (pedido) {
      setPedidoParaRecusar(pedido);
      setShowRejectDialog(true);
    }
  };

  const confirmarRecusa = async (motivo: string) => {
    if (!pedidoParaRecusar || !motivo.trim()) {
      showErrorToast("É necessário informar o motivo da recusa");
      return;
    }

    try {
      setLoadingActions((prev) => ({
        ...prev,
        [pedidoParaRecusar.id]: "rejecting",
      }));
      const response = await PedidosAPI.recusarPedido(
        pedidoParaRecusar.id,
        motivo,
      );

      if (response.success) {
        showSuccessToast("Pedido recusado");
        carregarPedidos(true);
        notificarAtualizacaoPedidos();
      }
    } catch {
      showErrorToast("Erro ao recusar pedido");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [pedidoParaRecusar.id]: "" }));
      setShowRejectDialog(false);
      setPedidoParaRecusar(null);
    }
  };

  const marcarPronto = async (id: number) => {
    if (!canPerformAction("canMarkReady")) {
      showErrorToast(getRestrictedMessage("canMarkReady"));
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [id]: "ready" }));
      const response = await PedidosAPI.marcarPronto(id);

      if (response.success) {
        showSuccessToast(
          "Pedido marcado como pronto! Agora você pode escanear o QR Code para entregar.",
        );
        carregarPedidos(true);
        notificarAtualizacaoPedidos();
      }
    } catch {
      showErrorToast("Erro ao marcar como pronto");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const mostrarQRCode = (pedido: PedidoSimplificado) => {
    if (!canPerformAction("canViewQRCode")) {
      showErrorToast(getRestrictedMessage("canViewQRCode"));
      return;
    }

    setPedidoParaQR(pedido);
    setShowQRCodeDialog(true);
  };

  const iniciarEscanearQR = (pedido: PedidoSimplificado) => {
    if (!canPerformAction("canScanQRCode")) {
      showErrorToast(getRestrictedMessage("canScanQRCode"));
      return;
    }

    setPedidoParaScanner(pedido);
    setShowQRScannerDialog(true);
  };

  const iniciarEntregaAoFuncionario = (pedido: PedidoSimplificado) => {
    if (!canPerformAction("canDeliverToEmployee")) {
      showErrorToast(getRestrictedMessage("canDeliverToEmployee"));
      return;
    }

    setPedidoParaEntrega(pedido);
    setShowDeliverToEmployeeDialog(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newFilters = {
      ...filters,
      codigo_pedido: value?.trim() || undefined,
    };
    setFilters(newFilters);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    let newFilters = { ...filters };

    if (status === "today") {
      const today = new Date().toISOString().split("T")[0];
      newFilters = {
        ...newFilters,
        data_inicio: today,
        data_fim: today,
        status: undefined,
      };
    } else if (status === "all") {
      newFilters = {
        status: undefined,
        data_inicio: undefined,
        data_fim: undefined,
        codigo_pedido: searchTerm?.trim() || undefined,
      };
    } else {
      newFilters = {
        ...newFilters,
        status: parseInt(status),
        data_inicio: undefined,
        data_fim: undefined,
      };
    }

    setFilters(newFilters);
  };

  const handleCriarPedido = async (data: CriarPedidoRequest) => {
    if (!canPerformAction("canCreateOrders")) {
      showErrorToast(getRestrictedMessage("canCreateOrders"));
      return false;
    }

    const response = await PedidosAPI.criarPedido(data);
    if (response.success) {
      carregarPedidos(true);
      notificarAtualizacaoPedidos();
      return true;
    }
    return false;
  };

  const handleAdicionarItens = async (tickets: string[]) => {
    if (!canPerformAction("canAddItems")) {
      showErrorToast(getRestrictedMessage("canAddItems"));
      return false;
    }

    if (!pedidoSelecionado) return false;

    const response = await PedidosAPI.adicionarItens(
      pedidoSelecionado,
      tickets,
    );
    if (response.success) {
      showSuccessToast("Itens adicionados com sucesso");
      carregarPedidos(true);
      notificarAtualizacaoPedidos();
      return true;
    }
    return false;
  };

  const handleRefreshDetalhes = () => {
    if (pedidoDetalhes) {
      buscarDetalhesPedido(pedidoDetalhes.id);
    }
    carregarPedidos(true);
    notificarAtualizacaoPedidos();
  };

  const handlePedidoEntregue = () => {
    carregarPedidos(true);
    notificarAtualizacaoPedidos();
    setPedidoParaScanner(null);
  };

  const handleDeliveryComplete = async () => {
    if (pedidoParaEntrega) {
      await checkTicketsStatus([pedidoParaEntrega]);
    }
    carregarPedidos(true);
    notificarAtualizacaoPedidos();
    setShowDeliverToEmployeeDialog(false);
    setPedidoParaEntrega(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    carregarPedidos(true);
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 100);
  }, [carregarPedidos]);

  useEffect(() => {
    if (isInitialLoad.current) {
      return;
    }

    const timer = setTimeout(() => {
      carregarPedidos(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [carregarPedidos, filters]);

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== null && value !== "",
  ).length;

  if (loading) {
    return <PedidosListSkeleton />;
  }

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="min-h-screen bg-background">
        <PedidosHeader
          isEstabelecimento={isEstabelecimento}
          isRestaurante={isRestaurante}
          permissions={permissions}
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          totalCount={totalCount}
          pedidos={pedidos}
          userType={userType}
          onCreateNew={() => setShowCriarDialog(true)}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />

        <PedidosList
          pedidos={pedidos}
          userType={userType}
          permissions={permissions}
          loadingActions={loadingActions}
          loadingMore={loadingMore}
          hasMore={hasMore}
          totalCount={totalCount}
          activeFiltersCount={activeFiltersCount}
          ticketsStatus={ticketsStatus}
          onViewDetails={buscarDetalhesPedido}
          onCancel={cancelarPedido}
          onAddItems={(pedidoId) => {
            setPedidoSelecionado(pedidoId);
            setShowAdicionarItensDialog(true);
          }}
          onAccept={aceitarPedido}
          onReject={recusarPedido}
          onMarkReady={marcarPronto}
          onShowQRCode={mostrarQRCode}
          onScanQRCode={iniciarEscanearQR}
          onLoadMore={() => carregarPedidos(false)}
          onCreateNew={() => setShowCriarDialog(true)}
          onDeliverToEmployee={iniciarEntregaAoFuncionario}
        />

        {showScrollTop && (
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-20 rounded-full shadow-lg transition-shadow hover:shadow-xl"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}

        {permissions.canCreateOrders && (
          <CriarPedidoDialog
            open={showCriarDialog}
            onOpenChange={setShowCriarDialog}
            onSubmit={handleCriarPedido}
            loading={false}
          />
        )}

        {permissions.canAddItems && (
          <AdicionarItensDialog
            open={showAdicionarItensDialog}
            onOpenChange={setShowAdicionarItensDialog}
            pedidoId={pedidoSelecionado}
            onSubmit={handleAdicionarItens}
            loading={false}
          />
        )}

        <PedidoDetalhesDialog
          open={showDetalhesDialog}
          onOpenChange={setShowDetalhesDialog}
          pedido={pedidoDetalhes}
          onRefresh={handleRefreshDetalhes}
        />

        <QRCodeDialog
          open={showQRCodeDialog}
          onOpenChange={setShowQRCodeDialog}
          pedido={pedidoParaQR}
        />

        <QRScannerDialog
          open={showQRScannerDialog}
          onOpenChange={setShowQRScannerDialog}
          pedido={pedidoParaScanner}
          onPedidoEntregue={handlePedidoEntregue}
        />

        <CancelPedidoDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          pedido={pedidoParaCancelar}
          onConfirm={confirmarCancelamento}
        />

        <RejectPedidoDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          pedido={pedidoParaRecusar}
          onConfirm={confirmarRecusa}
        />

        <DeliverToEmployeeDialog
          open={showDeliverToEmployeeDialog}
          onOpenChange={setShowDeliverToEmployeeDialog}
          pedido={pedidoParaEntrega}
          onDeliveryComplete={handleDeliveryComplete}
        />
      </div>
    </>
  );
}
