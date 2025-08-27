// src/services/ticket-service.ts
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/auth/useAuth";
import { ApiResponse } from "@/types/ticket";

export const useTicketService = () => {
  const { user } = useAuth();

  const handleApiError = (error: unknown): ApiResponse => {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      if (axiosError.response?.data) {
        return {
          success: false,
          message: axiosError.response.data.message || "Erro na operação",
        };
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Erro de conexão",
      };
    }

    return {
      success: false,
      message: "Erro desconhecido",
    };
  };

  const lerQRCode = async (
    qrCode: string,
    restauranteId?: number,
  ): Promise<ApiResponse> => {
    try {
      const targetRestauranteId = restauranteId || user?.id_restaurante;

      if (!targetRestauranteId) {
        throw new Error("Restaurante não identificado");
      }

      const response = await api.post<ApiResponse>(
        `/restaurantes/${targetRestauranteId}/tickets/ler-qrcode`,
        {
          qr_code: qrCode,
        },
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  const verificarTicketManual = async (
    numeroTicket: string,
    cpfFuncionario: string,
    restauranteId?: number,
  ): Promise<ApiResponse> => {
    try {
      const targetRestauranteId = restauranteId || user?.id_restaurante;

      if (!targetRestauranteId) {
        throw new Error("Restaurante não identificado");
      }

      const response = await api.post<ApiResponse>(
        `/restaurantes/${targetRestauranteId}/tickets/verificar-manual`,
        {
          numero_ticket: numeroTicket,
          cpf_funcionario: cpfFuncionario,
        },
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  const aprovarTicket = async (
    ticketId: number,
    reconhecimentoFacial: boolean,
    restauranteId?: number,
  ): Promise<ApiResponse> => {
    try {
      const targetRestauranteId = restauranteId || user?.id_restaurante;

      if (!targetRestauranteId) {
        throw new Error("Restaurante não identificado");
      }

      const response = await api.post<ApiResponse>(
        `/restaurantes/${targetRestauranteId}/tickets/${ticketId}/aprovar`,
        {
          reconhecimento_facial: reconhecimentoFacial,
        },
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  const aprovarTicketAvulso = async (
    codigo: string,
    restauranteId?: number,
  ): Promise<ApiResponse> => {
    try {
      const targetRestauranteId = restauranteId || user?.id_restaurante;

      if (!targetRestauranteId) {
        throw new Error("Restaurante não identificado");
      }

      const response = await api.post<ApiResponse>(
        `/restaurantes/${targetRestauranteId}/tickets/aprovar-avulso`,
        {
          codigo: codigo,
        },
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  const aprovarTicketParaEstabelecimento = async (
    ticketId: number,
    reconhecimentoFacial: boolean,
    restauranteId: number,
  ): Promise<ApiResponse> => {
    try {
      if (!restauranteId) {
        throw new Error("ID do restaurante é obrigatório");
      }

      const response = await api.post<ApiResponse>(
        `/restaurantes/${restauranteId}/tickets/${ticketId}/aprovar`,
        {
          reconhecimento_facial: reconhecimentoFacial,
        },
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  const aprovarTicketAvulsoParaEstabelecimento = async (
    codigo: string,
    restauranteId: number,
  ): Promise<ApiResponse> => {
    try {
      if (!restauranteId) {
        throw new Error("ID do restaurante é obrigatório");
      }

      const response = await api.post<ApiResponse>(
        `/restaurantes/${restauranteId}/tickets/aprovar-avulso`,
        {
          codigo: codigo,
        },
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  };

  const aprovarTicketInteligente = async (
    ticketId: number,
    reconhecimentoFacial: boolean,
    restauranteIdDoPedido?: number,
  ): Promise<ApiResponse> => {
    try {
      if (user?.id_restaurante) {
        return await aprovarTicket(ticketId, reconhecimentoFacial);
      }

      if (restauranteIdDoPedido) {
        return await aprovarTicketParaEstabelecimento(
          ticketId,
          reconhecimentoFacial,
          restauranteIdDoPedido,
        );
      }

      throw new Error(
        "Não foi possível determinar o restaurante para aprovação do ticket",
      );
    } catch (error) {
      return handleApiError(error);
    }
  };

  const aprovarTicketAvulsoInteligente = async (
    codigo: string,
    restauranteIdDoPedido?: number,
  ): Promise<ApiResponse> => {
    try {
      if (user?.id_restaurante) {
        return await aprovarTicketAvulso(codigo);
      }

      if (restauranteIdDoPedido) {
        return await aprovarTicketAvulsoParaEstabelecimento(
          codigo,
          restauranteIdDoPedido,
        );
      }

      throw new Error(
        "Não foi possível determinar o restaurante para aprovação do ticket avulso",
      );
    } catch (error) {
      return handleApiError(error);
    }
  };

  return {
    verificarTicketManual,
    lerQRCode,
    aprovarTicket,
    aprovarTicketAvulso,
    aprovarTicketParaEstabelecimento,
    aprovarTicketAvulsoParaEstabelecimento,
    aprovarTicketInteligente,
    aprovarTicketAvulsoInteligente,
  };
};
