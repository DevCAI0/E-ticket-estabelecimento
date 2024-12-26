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
import { Building2, ArrowLeft } from 'lucide-react';
import Loading from '@/components/Loading';
import { showErrorToast, showSuccessToast } from '@/components/ui/sonner';
import { api } from '@/lib/axios';

interface Estabelecimento {
  id: number;
  nome: string;
  endereco: string;
}

interface EstablishmentSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEstabelecimento: number | null;
  municipioId: number | null;
  tipoRefeicao: number | null;
  onSelect: (id: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const EstablishmentSelection: FC<EstablishmentSelectionProps> = ({
  open,
  onOpenChange,
  selectedEstabelecimento,
  municipioId,
  tipoRefeicao,
  onSelect,
  onNext,
  onBack
}) => {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (open && municipioId && tipoRefeicao) {
      console.log(`Chamando loadEstabelecimentos para municipioId=${municipioId} e tipoRefeicao=${tipoRefeicao}`);
      loadEstabelecimentos(municipioId, tipoRefeicao);
    }
  }, [open, municipioId, tipoRefeicao]);

  const loadEstabelecimentos = async (currentMunicipioId: number, currentTipoRefeicao: number) => {
    if (!currentMunicipioId || !currentTipoRefeicao) return;

    setIsLoading(true);
    try {
      console.log(`Buscando estabelecimentos para municipioId=${currentMunicipioId} e tipoRefeicao=${currentTipoRefeicao}`);
      
      const response = await api.get(`/estabelecimentos/municipio/${currentMunicipioId}/tipo-refeicao/${currentTipoRefeicao}`);
      
      console.log('Estabelecimentos carregados:', response.data);
      setEstabelecimentos(response.data);
      showSuccessToast('Estabelecimentos carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
      showErrorToast('Erro ao carregar estabelecimentos');
      setEstabelecimentos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEstabelecimentos([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione o Estabelecimento</DialogTitle>
          <DialogDescription>
            Escolha o estabelecimento onde deseja realizar sua refeição
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8">
            <Loading size="lg" text="Carregando estabelecimentos..." />
          </div>
        ) : estabelecimentos.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              Nenhum estabelecimento disponível para este município.
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <RadioGroup
              value={selectedEstabelecimento?.toString()}
              onValueChange={(value) => onSelect(Number(value))}
              className="space-y-4"
            >
              {estabelecimentos.map((estab) => (
                <div key={estab.id}
                  className="flex items-center space-x-3 rounded-lg border p-4"
                >
                  <RadioGroupItem value={estab.id.toString()} id={estab.id.toString()} />
                  <Label 
                    htmlFor={estab.id.toString()} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{estab.nome}</div>
                    <div className="text-sm text-gray-500">{estab.endereco}</div>
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
            disabled={!selectedEstabelecimento}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Selecionar Restaurante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstablishmentSelection;