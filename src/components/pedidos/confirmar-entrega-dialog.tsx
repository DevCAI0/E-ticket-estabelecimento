import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Package, AlertTriangle } from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";
import { showErrorToast } from "@/components/ui/sonner";

interface ConfirmarEntregaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoSimplificado | null;
  onConfirm: (codigoPedido?: string) => Promise<void>;
  loading: boolean;
}

export function ConfirmarEntregaDialog({
  open,
  onOpenChange,
  pedido,
  onConfirm,
  loading,
}: ConfirmarEntregaDialogProps) {
  const [codigoInformado, setCodigoInformado] = useState("");
  const [validarCodigo, setValidarCodigo] = useState(false);
  const [erro, setErro] = useState("");

  const handleConfirm = async () => {
    setErro("");

    if (validarCodigo && pedido) {
      if (!codigoInformado.trim()) {
        setErro("Por favor, informe o código do pedido");
        return;
      }

      const codigoLimpo = codigoInformado
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const codigoPedidoLimpo = pedido.codigo_pedido
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

      if (codigoLimpo !== codigoPedidoLimpo) {
        setErro("Código do pedido incorreto");
        return;
      }
    }

    try {
      await onConfirm(validarCodigo ? codigoInformado : undefined);
      handleClose();
    } catch (error) {
      showErrorToast("Erro ao confirmar entrega");
    }
  };

  const handleClose = () => {
    setCodigoInformado("");
    setValidarCodigo(false);
    setErro("");
    onOpenChange(false);
  };

  if (!pedido) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            <DialogTitle>Confirmar Entrega</DialogTitle>
          </div>
          <DialogDescription>
            Confirme a entrega do pedido #{pedido.codigo_pedido}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pedido:</span>
              <span className="font-mono font-medium">
                #{pedido.codigo_pedido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Restaurante:
              </span>
              <span className="text-right font-medium">
                {pedido.restaurante.nome}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Itens:</span>
              <span className="font-medium">
                {pedido.total_itens} ticket(s)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Solicitante:
              </span>
              <span className="text-right font-medium">
                {pedido.solicitante.nome}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="validar-codigo"
                checked={validarCodigo}
                onChange={(e) => setValidarCodigo(e.target.checked)}
                className="mt-1"
              />
              <div>
                <Label htmlFor="validar-codigo" className="cursor-pointer">
                  Validar código com quem está retirando
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Recomendado para maior segurança na entrega
                </p>
              </div>
            </div>

            {validarCodigo && (
              <div className="space-y-2">
                <Label htmlFor="codigo">Código informado pela pessoa:</Label>
                <Input
                  id="codigo"
                  placeholder="Digite o código do pedido"
                  value={codigoInformado}
                  onChange={(e) => {
                    setCodigoInformado(e.target.value);
                    setErro("");
                  }}
                  className={erro ? "border-red-500" : ""}
                  autoFocus
                />
                {erro && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    {erro}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Atenção!
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  Após confirmar a entrega, os tickets serão liberados para
                  consumo e não poderão mais ser alterados.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Entrega
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
