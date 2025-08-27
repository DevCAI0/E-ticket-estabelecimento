import { api } from "@/lib/axios";
import { showErrorToast } from "@/components/ui/sonner";

export interface Funcionario {
  id_funcionario: number | null;
  nome: string;
  cpf: string;
}

export interface UsuarioLeitura {
  id: number;
  nome: string;
}

export interface TicketData {
  id: number;
  numero: number;
  codigo?: string;
  funcionario: Funcionario;
  tipo_refeicao: string;
  valor: number;
  status: number;
  status_texto: string;
  data_emissao: string;
  data_cadastro: string;
  data_validade?: string;
  expiracao?: string;
  tempo_restante: string;
  data_hora_leitura_restaurante: string | null;
  usuario_leitura: UsuarioLeitura | null;
  expirado?: boolean;
}

export interface TicketItem {
  tipo: "ticket_normal" | "ticket_avulso";
  data: TicketData;
}

export interface TicketsResponse {
  success: boolean;
  tickets: TicketItem[];
  total: number;
}

export async function buscarTicketsRestaurante(
  idRestaurante: number,
  page: number = 1,
  perPage: number = 15,
): Promise<TicketsResponse> {
  try {
    const response = await api.get<TicketsResponse>(
      `/restaurantes/${idRestaurante}/tickets?page=${page}&per_page=${perPage}`,
    );

    if (!response.data || !response.data.success) {
      throw new Error("Resposta inválida da API");
    }

    if (!Array.isArray(response.data.tickets)) {
      return {
        success: false,
        tickets: [],
        total: 0,
      };
    }

    return response.data;
  } catch (error) {
    showErrorToast("Erro ao carregar tickets");
    throw error;
  }
}

export async function buscarTicketsParaAtualizacao(
  idRestaurante: number,
  page: number = 1,
  perPage: number = 15,
): Promise<TicketsResponse> {
  try {
    const response = await api.get<TicketsResponse>(
      `/restaurantes/${idRestaurante}/tickets/atualizacao?page=${page}&per_page=${perPage}`,
    );

    if (!response.data || !response.data.success) {
      throw new Error("Resposta inválida da API");
    }

    if (!Array.isArray(response.data.tickets)) {
      return {
        success: false,
        tickets: [],
        total: 0,
      };
    }

    return response.data;
  } catch (error) {
    showErrorToast("Erro ao carregar tickets para atualização");
    throw error;
  }
}
