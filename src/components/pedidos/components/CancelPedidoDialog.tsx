import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";

interface CancelPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoSimplificado | null;
  onConfirm: (motivo: string) => void;
}

const motivosCancelamento = [
  "Cliente solicitou cancelamento",
  "Produto em falta",
  "Problema no pagamento",
  "Erro no pedido",
  "Problemas técnicos",
  "Outros",
];

export function CancelPedidoDialog({
  open,
  onOpenChange,
  pedido,
  onConfirm,
}: CancelPedidoDialogProps) {
  const [motivoSelecionado, setMotivoSelecionado] = useState("");
  const [motivoCustomizado, setMotivoCustomizado] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const motivoFinal =
      motivoSelecionado === "Outros"
        ? motivoCustomizado.trim()
        : motivoSelecionado;

    setLoading(true);
    try {
      await onConfirm(motivoFinal);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setMotivoSelecionado("");
    setMotivoCustomizado("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancelar Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">
              <strong>Pedido #{pedido?.codigo_pedido || "N/A"}</strong>
            </p>
            <p className="mt-1 text-xs text-red-600">
              Esta ação não pode ser desfeita
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo do cancelamento (opcional)</Label>
            <Select
              value={motivoSelecionado}
              onValueChange={setMotivoSelecionado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo..." />
              </SelectTrigger>
              <SelectContent>
                {motivosCancelamento.map((motivo) => (
                  <SelectItem key={motivo} value={motivo}>
                    {motivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {motivoSelecionado === "Outros" && (
            <div className="space-y-2">
              <Label htmlFor="motivo-customizado">Descreva o motivo</Label>
              <Textarea
                id="motivo-customizado"
                placeholder="Digite o motivo do cancelamento..."
                value={motivoCustomizado}
                onChange={(e) => setMotivoCustomizado(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
