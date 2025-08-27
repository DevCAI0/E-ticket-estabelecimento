import { useState, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, Copy, Loader2 } from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";
import { PedidosAPI } from "@/api/pedidos";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoSimplificado | null;
}

export function QRCodeDialog({
  open,
  onOpenChange,
  pedido,
}: QRCodeDialogProps) {
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const carregarQRCode = useCallback(async () => {
    if (!pedido) return;

    try {
      setLoading(true);
      setError("");

      const response = await PedidosAPI.obterQRCode(pedido.id);

      if (response.success && response.qr_code_data) {
        setQrCodeData(response.qr_code_data);
      } else {
        const errorMsg = response.message || "Erro ao carregar QR Code";
        setError(errorMsg);
        showErrorToast(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao carregar QR Code";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [pedido]);

  useEffect(() => {
    if (open && pedido) {
      carregarQRCode();
    } else {
      setQrCodeData("");
      setError("");
    }
  }, [open, pedido, carregarQRCode]);

  const copiarCodigo = async () => {
    if (!pedido?.codigo_pedido) return;

    try {
      await navigator.clipboard.writeText(pedido.codigo_pedido);
      showSuccessToast("Código do pedido copiado!");
    } catch {
      showErrorToast("Erro ao copiar código");
    }
  };

  if (!pedido) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-h-[95vh] w-[95vw] max-w-sm overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-center text-lg font-semibold text-white">
            QR Code do Pedido
          </DialogTitle>

          <DialogDescription asChild>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-white">
                    #{pedido.codigo_pedido}
                  </div>
                  <div className="truncate text-sm text-gray-400">
                    {pedido.restaurante.nome}
                  </div>
                </div>
                <Badge className="ml-2 shrink-0 bg-orange-500 text-white hover:bg-orange-600">
                  {pedido.status_texto}
                </Badge>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-full max-w-[280px] rounded-lg border border-gray-600 bg-white p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-orange-500" />
                  <div className="text-sm text-gray-600">
                    Carregando QR Code...
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <QrCode className="mb-2 h-12 w-12 text-red-400" />
                  <div className="mb-3 text-center text-sm text-red-500">
                    {error}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={carregarQRCode}
                    className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : qrCodeData ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <QRCode
                      value={qrCodeData}
                      size={200}
                      level="M"
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                    />
                  </div>
                  <div className="text-center text-xs text-gray-600">
                    Mostre este QR Code para quem irá retirar o pedido
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <QrCode className="mb-2 h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    QR Code não disponível
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Código do Pedido:
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copiarCodigo}
                  className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center">
                <code className="flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-2 font-mono text-sm text-white">
                  {pedido.codigo_pedido}
                </code>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
