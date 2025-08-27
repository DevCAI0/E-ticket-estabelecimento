import { api } from "@/lib/axios";
import { showErrorToast } from "@/components/ui/sonner";

interface Ticket {
  id: number;
  numero: string;
  codigo?: string;
  funcionario: {
    id_funcionario: number | null;
    nome: string;
    cpf: string;
  } | null;
  tipo_refeicao: string;
  valor: number;
  status: number;
  status_texto: string;
  data_emissao: string;
  data_cadastro?: string;
  data_validade?: string;
  expiracao?: string;
  tempo_restante: string;
  expirado?: boolean;
}

interface TicketResponse {
  tipo: "ticket_normal" | "ticket_avulso";
  data: Ticket;
}

interface ApprovedTicketsResponse {
  success: boolean;
  tickets: TicketResponse[];
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
      showErrorToast(`Erro ao buscar tickets aprovados: ${error.message}`);
      throw new Error(error.message);
    }
    showErrorToast("Erro desconhecido ao buscar tickets aprovados");
    throw new Error("Erro desconhecido ao buscar tickets aprovados");
  }
};

export const getTicketsRestaurante = async (
  restauranteId: number,
  filters?: {
    data_inicio?: string;
    data_fim?: string;
    page?: number;
    per_page?: number;
  },
): Promise<{
  success: boolean;
  tickets: TicketResponse[];
  total: number;
}> => {
  try {
    const params = new URLSearchParams();

    if (filters?.data_inicio) params.append("data_inicio", filters.data_inicio);
    if (filters?.data_fim) params.append("data_fim", filters.data_fim);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());

    const response = await api.get(
      `/restaurantes/${restauranteId}/tickets?${params.toString()}`,
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      showErrorToast(`Erro ao buscar tickets: ${error.message}`);
      throw new Error(error.message);
    }
    showErrorToast("Erro desconhecido ao buscar tickets do restaurante");
    throw new Error("Erro desconhecido ao buscar tickets do restaurante");
  }
};
