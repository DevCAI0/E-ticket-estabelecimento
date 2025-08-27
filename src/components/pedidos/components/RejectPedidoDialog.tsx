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
import { XCircle } from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";

interface RejectPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoSimplificado | null;
  onConfirm: (motivo: string) => void;
}

const motivosRecusa = [
  "Ingredientes em falta",
  "Equipamento com defeito",
  "Horário de funcionamento",
  "Capacidade esgotada",
  "Problema com delivery",
  "Produto indisponível",
  "Outros",
];

export function RejectPedidoDialog({
  open,
  onOpenChange,
  pedido,
  onConfirm,
}: RejectPedidoDialogProps) {
  const [motivoSelecionado, setMotivoSelecionado] = useState("");
  const [motivoCustomizado, setMotivoCustomizado] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const motivoFinal =
      motivoSelecionado === "Outros"
        ? motivoCustomizado.trim()
        : motivoSelecionado;

    if (!motivoFinal) {
      return;
    }

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

  const isFormValid =
    motivoSelecionado &&
    (motivoSelecionado !== "Outros" || motivoCustomizado.trim());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <XCircle className="h-5 w-5" />
            Recusar Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-sm text-orange-800">
              <strong>Pedido #{pedido?.codigo_pedido || "N/A"}</strong>
            </p>
            <p className="mt-1 text-xs text-orange-600">
              O cliente será notificado sobre a recusa
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da recusa *</Label>
            <Select
              value={motivoSelecionado}
              onValueChange={setMotivoSelecionado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo..." />
              </SelectTrigger>
              <SelectContent>
                {motivosRecusa.map((motivo) => (
                  <SelectItem key={motivo} value={motivo}>
                    {motivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {motivoSelecionado === "Outros" && (
            <div className="space-y-2">
              <Label htmlFor="motivo-customizado">Descreva o motivo *</Label>
              <Textarea
                id="motivo-customizado"
                placeholder="Digite o motivo da recusa..."
                value={motivoCustomizado}
                onChange={(e) => setMotivoCustomizado(e.target.value)}
                rows={3}
                className={
                  !motivoCustomizado.trim() && motivoSelecionado === "Outros"
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }
              />
            </div>
          )}

          {!isFormValid && motivoSelecionado && (
            <p className="text-sm text-red-600">
              É obrigatório informar o motivo da recusa
            </p>
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
            disabled={loading || !isFormValid}
          >
            {loading ? "Recusando..." : "Confirmar Recusa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
