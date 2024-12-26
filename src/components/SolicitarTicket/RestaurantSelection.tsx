import { FC, useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Utensils, ArrowLeft } from 'lucide-react';
import Loading from '@/components/Loading';
import { showErrorToast, showSuccessToast } from '@/components/ui/sonner';
import { api } from '@/lib/axios';

interface Restaurante {
  id: number;
  nome: string;
}

interface RestaurantSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRestaurante: number | null;
  estabelecimentoId: number | null;
  tipoRefeicao: number | null;
  onSelect: (restauranteId: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const RestaurantSelection: FC<RestaurantSelectionProps> = ({
  open,
  onOpenChange,
  selectedRestaurante,
  estabelecimentoId,
  tipoRefeicao,
  onSelect,
  onNext,
  onBack
}) => {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && estabelecimentoId && tipoRefeicao) {
      loadRestaurantes();
    }
  }, [open, estabelecimentoId, tipoRefeicao]);

  const loadRestaurantes = async () => {
    if (!estabelecimentoId || !tipoRefeicao) return;

    setIsLoading(true);
    try {
      console.log(`Buscando restaurantes para estabelecimentoId=${estabelecimentoId} e tipoRefeicao=${tipoRefeicao}`);
      
      const response = await api.get(`/estabelecimentos/${estabelecimentoId}/tipo-refeicao/${tipoRefeicao}/restaurantes`);
      
      console.log('Restaurantes carregados:', response.data);
      setRestaurantes(response.data);
      showSuccessToast('Restaurantes carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
      showErrorToast('Erro ao carregar restaurantes');
      setRestaurantes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setRestaurantes([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione o Restaurante</DialogTitle>
          <DialogDescription>
            Escolha o restaurante para sua refeição
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8">
            <Loading size="lg" text="Carregando restaurantes..." />
          </div>
        ) : restaurantes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              Nenhum restaurante disponível para este estabelecimento.
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <RadioGroup
              value={selectedRestaurante?.toString()}
              onValueChange={(value) => onSelect(Number(value))}
              className="space-y-4"
            >
              {restaurantes.map((restaurante) => (
                <div key={restaurante.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 "
                >
                  <RadioGroupItem value={restaurante.id.toString()} id={restaurante.id.toString()} />
                  <Label 
                    htmlFor={restaurante.id.toString()} 
                    className="flex-1 cursor-pointer"
                  >
                    {restaurante.nome}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!selectedRestaurante}
            className="flex items-center gap-2"
          >
            <Utensils className="h-4 w-4" />
            Selecionar Restaurante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantSelection;