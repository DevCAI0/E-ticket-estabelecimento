import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { showErrorToast, showSuccessToast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

interface Refeicao {
  id: number;
  tipo_id: number;
  tipo_nome: string;
}

interface Liberacao {
  data: string;
  data_formatada: string;
  refeicoes: Refeicao[];
}

interface FuncionarioLiberacao {
  funcionario: {
    id: number;
    nome: string;
    cpf: string;
  };
  liberacoes: Liberacao[];
}

interface ApiResponse {
  success: boolean;
  message: FuncionarioLiberacao;
}

export interface SelectionState {
  liberacaoId: number;
  tipoRefeicao: number;
  municipio: number;
  estabelecimento: number;
  restaurante: number;
  reconhecimento_facial: boolean;
}

export function useReleases() {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liberacoes, setLiberacoes] = useState<FuncionarioLiberacao | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const fetchLiberacoes = useCallback(async (isRefresh: boolean = false) => {
    if (!user?.id || !token) {
      setIsLoading(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await api.get<ApiResponse>(`/liberacoes/funcionario/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.data.success) {
        setLiberacoes(response.data.message);
        if (isRefresh) {
          showSuccessToast('Liberações atualizadas com sucesso');
        }
      } else {
        throw new Error('Falha ao carregar liberações');
      }
    } catch (error) {
      console.log(error)
      showErrorToast(  'Erro ao carregar liberações');
      setLiberacoes(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, token]);

  const updateLiberacoesAfterTicket = useCallback((refeicaoId: number, tipoRefeicaoId: number) => {
    setLiberacoes(prevLiberacoes => {
      if (!prevLiberacoes) return null;

      const updatedLiberacoes = prevLiberacoes.liberacoes
        .map(liberacao => ({
          ...liberacao,
          refeicoes: liberacao.refeicoes.filter(
            refeicao => !(refeicao.id === refeicaoId && refeicao.tipo_id === tipoRefeicaoId)
          ),
        }))
        .filter(liberacao => liberacao.refeicoes.length > 0);

      return {
        ...prevLiberacoes,
        liberacoes: updatedLiberacoes,
      };
    });
  }, []);

  const solicitarTicket = useCallback(async (selection: SelectionState): Promise<boolean> => {
    if (isProcessing) return false; // Evita múltiplas execuções simultâneas
    setIsProcessing(true);
  
    try {
      const { data } = await api.post(
        `/liberacoes/${selection.liberacaoId}/solicitar-ticket`,
        {
          id_estabelecimento: selection.estabelecimento,
          id_restaurante: selection.restaurante,
          id_tipo_refeicao: selection.tipoRefeicao,
          reconhecimento_facial: selection.reconhecimento_facial,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (data?.ticket) {
        showSuccessToast('Ticket gerado com sucesso!');
        updateLiberacoesAfterTicket(selection.liberacaoId!, selection.tipoRefeicao!);
        navigate('/tickets');
        return true;
      }
  
      showErrorToast('Erro ao gerar ticket.');
      return false;
    } catch (error) {
      console.log('❌ Erro ao gerar ticket:', error);
      showErrorToast( 'Erro ao solicitar ticket');
      return false;
    } finally {
      setIsProcessing(false); // Libera o estado de processamento
    }
  }, [isProcessing, token, updateLiberacoesAfterTicket, navigate]);
  

  useEffect(() => {
    fetchLiberacoes();
  }, [fetchLiberacoes]);

  return {
    liberacoes,
    isLoading,
    isRefreshing,
    refresh: () => fetchLiberacoes(true),
    solicitarTicket,
  };
}
