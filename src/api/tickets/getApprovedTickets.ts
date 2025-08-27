import { api } from "@/lib/axios";
import { showErrorToast } from "@/components/ui/sonner";

interface Ticket {
  id: number;
  numero: string;
  funcionario: {
    id_funcionario: number;
    nome: string;
    cpf: string;
  } | null;
  tipo_refeicao: string;
  valor: number;
  status: number;
  status_texto: string;
  data_emissao: string;
  expiracao: string;
  tempo_restante: string;
}

interface ApprovedTicketsResponse {
  tickets: Ticket[];
  total: number;
}

export const getApprovedTickets = async (
  restauranteId: number,
): Promise<ApprovedTicketsResponse> => {
  try {
    const response = await api.get<ApprovedTicketsResponse>(
      `/restaurantes/${restauranteId}/tickets/aprovados-ultimas-24h`,
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      showErrorToast(`Erro ao buscar tickets: ${error.message}`);
      throw new Error(error.message);
    }
    showErrorToast("Erro desconhecido ao buscar tickets aprovados");
    throw new Error("Erro desconhecido ao buscar tickets aprovados");
  }
};
