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
import { MapPin, Building2 } from 'lucide-react';
import Loading from '@/components/Loading';
import { showErrorToast, showSuccessToast } from '@/components/ui/sonner';
import { SearchFilter } from '@/components/SearchFilter';
import { api } from '@/lib/axios';

interface Municipio {
  id: number;
  nome: string;
}

interface MunicipalitySelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMunicipio: number | null;
  tipoRefeicao: number | null;
  onSelect: (id: number) => void;
  onNext: () => void;
}

const MunicipalitySelection: FC<MunicipalitySelectionProps> = ({
  open,
  onOpenChange,
  selectedMunicipio,
  tipoRefeicao,
  onSelect,
  onNext,
}) => {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [filteredMunicipios, setFilteredMunicipios] = useState<Municipio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const removeAccents = (str: string): string => {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '');
  };
  
  useEffect(() => {
    if (open && tipoRefeicao) {
      loadMunicipios();
    }
  }, [open, tipoRefeicao]);

  useEffect(() => {
    const filtered = municipios.filter(municipio => {
      const normalizedMunicipio = removeAccents(municipio.nome.toLowerCase());
      const normalizedSearch = removeAccents(searchTerm.toLowerCase());
      return normalizedMunicipio.includes(normalizedSearch);
    });
    setFilteredMunicipios(filtered);
  }, [searchTerm, municipios]);;

  const loadMunicipios = async () => {
    if (!tipoRefeicao) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/municipios/tipo-refeicao/${tipoRefeicao}`);
      setMunicipios(response.data);
      setFilteredMunicipios(response.data);
      showSuccessToast('Municípios carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar municípios:', error);
      showErrorToast('Erro ao carregar municípios');
      setMunicipios([]);
      setFilteredMunicipios([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setMunicipios([]);
    setFilteredMunicipios([]);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione o Município</DialogTitle>
          <DialogDescription>
            Escolha o município onde deseja realizar sua refeição
          </DialogDescription>
        </DialogHeader>

        <SearchFilter
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar município..."
          className="mb-4"
        />

        {isLoading ? (
          <div className="py-8">
            <Loading size="lg" text="Carregando municípios..." />
          </div>
        ) : filteredMunicipios.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              {searchTerm 
                ? "Nenhum município encontrado para esta busca."
                : "Nenhum município disponível para este tipo de refeição."}
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <RadioGroup
              value={selectedMunicipio?.toString()}
              onValueChange={(value) => onSelect(Number(value))}
              className="space-y-4"
            >
              {filteredMunicipios.map((municipio) => (
                <div key={municipio.id}
                  className="flex items-center space-x-3 rounded-lg border p-4"
                >
                  <RadioGroupItem value={municipio.id.toString()} id={municipio.id.toString()} />
                  <Label 
                    htmlFor={municipio.id.toString()} 
                    className="flex-1 cursor-pointer flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div className="font-medium">{municipio.nome}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleClose}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!selectedMunicipio}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Selecionar Estabelecimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MunicipalitySelection;