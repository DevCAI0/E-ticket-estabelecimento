// api/pedidos.ts - Métodos atualizados para o novo fluxo

import { api } from "@/lib/axios";
import { decryptData } from "@/lib/crypto";
import {
  PedidosListResponse,
  PedidoResponse,
  CriarPedidoRequest,
  BuscarTicketsRequest,
  TicketDisponivel,
  PedidosFilters,
  RestauranteDisponivel,
  QRCodeResponse,
  QRScanResponse,
} from "@/types/pedidos";

// ✅ Interface para configuração de requisições
interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

export class PedidosAPI {
  private static readonly BASE_URL = "/restaurante-pedidos";

  private static getEmpresaId(): string {
    try {
      const userStr = localStorage.getItem("encryptedUser");
      if (userStr) {
        const decryptedUser = decryptData(userStr);
        const user = JSON.parse(decryptedUser);
        return user.id_empresa?.toString() || "1";
      }
      return "1";
    } catch {
      return "1";
    }
  }

  private static getConfigWithEmpresa(
    additionalConfig: RequestConfig = {},
  ): RequestConfig {
    return {
      ...additionalConfig,
      headers: {
        "X-Current-Company": this.getEmpresaId(),
        ...(additionalConfig.headers || {}),
      },
    };
  }

  static async listarRestaurantesDisponiveis(): Promise<{
    success: boolean;
    data: {
      restaurantes: RestauranteDisponivel[];
      total: number;
      estabelecimento: {
        id: number;
        nome: string;
      };
    };
  }> {
    try {
      const response = await api.get(
        `${this.BASE_URL}/restaurantes-disponiveis`,
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao listar restaurantes");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao listar restaurantes",
      );
    }
  }

  static async listarPedidos(
    filters: PedidosFilters = {},
  ): Promise<PedidosListResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get(
        `${this.BASE_URL}?${params.toString()}`,
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao listar pedidos");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao listar pedidos",
      );
    }
  }

  static async obterPedido(id: number): Promise<PedidoResponse> {
    try {
      const response = await api.get(
        `${this.BASE_URL}/${id}`,
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao obter pedido");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(responseError || errorMessage || "Erro ao obter pedido");
    }
  }

  static async criarPedido(data: CriarPedidoRequest): Promise<PedidoResponse> {
    try {
      const response = await api.post(
        this.BASE_URL,
        data,
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao criar pedido");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as {
        response?: {
          status?: number;
          data?: {
            error?: string;
            validation_errors?: Record<string, string[]>;
          };
        };
      };

      if (apiError.response?.status === 422) {
        const validationErrors = apiError.response.data?.validation_errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat();
          throw new Error(errorMessages.join(", "));
        }
      }

      const responseError = apiError.response?.data?.error;
      throw new Error(responseError || errorMessage || "Erro ao criar pedido");
    }
  }

  static async buscarTicketsDisponiveis(data: BuscarTicketsRequest): Promise<{
    success: boolean;
    tickets_encontrados: TicketDisponivel[];
    total_encontrados: number;
    total_solicitados: number;
  }> {
    try {
      const response = await api.get(`${this.BASE_URL}/tickets-disponiveis`, {
        params: data,
        ...this.getConfigWithEmpresa(),
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao buscar tickets");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao buscar tickets",
      );
    }
  }

  static async cancelarPedido(
    id: number,
    motivoCancelamento?: string,
  ): Promise<PedidoResponse> {
    try {
      const response = await api.post(
        `${this.BASE_URL}/${id}/cancelar`,
        { motivo_cancelamento: motivoCancelamento },
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao cancelar pedido");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao cancelar pedido",
      );
    }
  }

  static async adicionarItens(
    id: number,
    tickets: string[],
  ): Promise<PedidoResponse> {
    try {
      const response = await api.post(
        `${this.BASE_URL}/${id}/itens`,
        { tickets },
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao adicionar itens");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao adicionar itens",
      );
    }
  }

  static async removerItem(
    pedidoId: number,
    itemId: number,
  ): Promise<PedidoResponse> {
    try {
      const response = await api.delete(
        `${this.BASE_URL}/${pedidoId}/itens/${itemId}`,
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao remover item");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(responseError || errorMessage || "Erro ao remover item");
    }
  }

  // ✅ ACEITAR PEDIDO (vai direto para EM_PREPARO)
  static async aceitarPedido(id: number): Promise<PedidoResponse> {
    try {
      const response = await api.post(
        `${this.BASE_URL}/${id}/aceitar`,
        {},
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao aceitar pedido");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao aceitar pedido",
      );
    }
  }

  static async recusarPedido(
    id: number,
    motivo: string,
  ): Promise<PedidoResponse> {
    try {
      const response = await api.post(
        `${this.BASE_URL}/${id}/recusar`,
        { motivo_recusa: motivo },
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao recusar pedido");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao recusar pedido",
      );
    }
  }

  static async marcarPronto(id: number): Promise<PedidoResponse> {
    try {
      const response = await api.post(
        `${this.BASE_URL}/${id}/pronto`,
        {},
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao marcar como pronto");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao marcar como pronto",
      );
    }
  }

  // ✅ NOVO: Obter QR Code do pedido (apenas estabelecimento)
  static async obterQRCode(id: number): Promise<QRCodeResponse> {
    try {
      const response = await api.get(
        `${this.BASE_URL}/${id}/qr-code`,
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao obter QR Code");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(responseError || errorMessage || "Erro ao obter QR Code");
    }
  }

  // ✅ NOVO: Escanear QR Code e entregar (apenas restaurante)
  static async escanearQRCodeEEntregar(
    id: number,
    qrCodeData: string,
  ): Promise<QRScanResponse> {
    try {
      const response = await api.post(
        `${this.BASE_URL}/${id}/escanear-entregar`,
        { qr_code_data: qrCodeData },
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "QR Code inválido");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao escanear QR Code",
      );
    }
  }

  // ✅ NOVO: Método para marcar entregue (compatibilidade)
  static async marcarEntregue(
    id: number,
    codigoPedido?: string,
  ): Promise<PedidoResponse> {
    try {
      const requestData = codigoPedido ? { codigo_pedido: codigoPedido } : {};

      const response = await api.post(
        `${this.BASE_URL}/${id}/entregar`,
        requestData,
        this.getConfigWithEmpresa(),
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao marcar como entregue");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao marcar como entregue",
      );
    }
  }

  static async obterEstatisticas(
    filtros: {
      data_inicio?: string;
      data_fim?: string;
    } = {},
  ): Promise<{
    success: boolean;
    periodo: {
      data_inicio: string;
      data_fim: string;
    };
    resumo_geral: {
      total_pedidos: number;
      pedidos_pendentes: number;
      pedidos_aceitos: number;
      pedidos_recusados: number;
      pedidos_entregues: number;
      valor_total: string;
      quantidade_total: number;
    };
    pedidos_por_status: Record<string, number>;
    pedidos_por_restaurante: Array<{
      restaurante: string;
      total_pedidos: number;
      valor_total: string;
    }>;
  }> {
    try {
      const response = await api.get(`${this.BASE_URL}/estatisticas`, {
        params: filtros,
        ...this.getConfigWithEmpresa(),
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao obter estatísticas");
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      const apiError = error as { response?: { data?: { error?: string } } };
      const responseError = apiError.response?.data?.error;

      throw new Error(
        responseError || errorMessage || "Erro ao obter estatísticas",
      );
    }
  }
}
