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
import { SearchFilter } from '@/components/SearchFilter';
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
  const [filteredEstabelecimentos, setFilteredEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && municipioId && tipoRefeicao) {
      loadEstabelecimentos();
    }
  }, [open, municipioId, tipoRefeicao]);

  // Efeito para filtrar estabelecimentos
  useEffect(() => {
    const filtered = estabelecimentos.filter(estab => 
      estab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estab.endereco.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEstabelecimentos(filtered);
  }, [searchTerm, estabelecimentos]);

  const loadEstabelecimentos = async () => {
    if (!municipioId || !tipoRefeicao) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/estabelecimentos/municipio/${municipioId}/tipo-refeicao/${tipoRefeicao}`);
      setEstabelecimentos(response.data);
      setFilteredEstabelecimentos(response.data);
      showSuccessToast('Estabelecimentos carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
      showErrorToast('Erro ao carregar estabelecimentos');
      setEstabelecimentos([]);
      setFilteredEstabelecimentos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEstabelecimentos([]);
    setFilteredEstabelecimentos([]);
    setSearchTerm('');
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

        <SearchFilter
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar estabelecimento..."
          className="mb-4"
        />

        {isLoading ? (
          <div className="py-8">
            <Loading size="lg" text="Carregando estabelecimentos..." />
          </div>
        ) : filteredEstabelecimentos.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              {searchTerm 
                ? "Nenhum estabelecimento encontrado para esta busca."
                : "Nenhum estabelecimento disponível para este município."}
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <RadioGroup
              value={selectedEstabelecimento?.toString()}
              onValueChange={(value) => onSelect(Number(value))}
              className="space-y-4"
            >
              {filteredEstabelecimentos.map((estab) => (
                <div key={estab.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 "
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