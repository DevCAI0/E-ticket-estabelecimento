// utils/pedidosUtils.ts
import { PEDIDOS_UPDATE_EVENT } from "@/hooks/usePedidosPendentes";

/**
 * Dispara evento para atualizar contadores de pedidos pendentes
 * Use esta função sempre que uma ação modificar o status dos pedidos
 */
export function notificarAtualizacaoPedidos() {
  const event = new CustomEvent(PEDIDOS_UPDATE_EVENT);
  window.dispatchEvent(event);
}

/**
 * Hook para facilitar o uso da notificação em componentes
 */
export function useNotificarPedidos() {
  return {
    notificar: notificarAtualizacaoPedidos,
  };
}
