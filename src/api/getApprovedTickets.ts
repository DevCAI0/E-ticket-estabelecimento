import { api } from "@/lib/axios";

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

/**
 * Obtém os tickets aprovados nas últimas 24 horas para um restaurante específico.
 *
 * @param restauranteId O ID do restaurante associado ao usuário logado.
 * @returns {Promise<ApprovedTicketsResponse>} Dados dos tickets aprovados.
 */
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
      console.error("Erro ao buscar tickets aprovados:", error.message);
      throw new Error(error.message);
    }
    throw new Error("Erro desconhecido ao buscar tickets aprovados");
  }
};
