// src/services/ticket-service.ts
import { api } from "@/lib/axios";
import { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import { ApiResponse, ApiErrorResponse } from "@/types/ticket";

export const useTicketService = () => {
  const { user } = useAuth();

  const lerQRCode = async (qrCode: string): Promise<ApiResponse> => {
    if (!user?.id_restaurante) {
      throw new Error("Usuário sem restaurante associado");
    }

    try {
      const response = await api.post<ApiResponse>(
        `/restaurantes/${user.id_restaurante}/tickets/ler-qrcode`,
        {
          qr_code: qrCode,
        },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Erro ao processar o ticket");
      }
      throw new Error("Erro ao processar o ticket");
    }
  };

  const verificarTicketManual = async (
    numeroTicket: string,
    cpfFuncionario: string,
  ): Promise<ApiResponse> => {
    if (!user?.id_restaurante) {
      throw new Error("Usuário sem restaurante associado");
    }

    try {
      const response = await api.post<ApiResponse>(
        `/restaurantes/${user.id_restaurante}/tickets/verificar-manual`,
        {
          numero_ticket: numeroTicket,
          cpf_funcionario: cpfFuncionario,
        },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Erro ao verificar o ticket");
      }
      throw new Error("Erro ao verificar o ticket");
    }
  };

  const aprovarTicket = async (
    ticketId: number,
    reconhecimentoFacial: boolean,
  ): Promise<ApiResponse> => {
    if (!user?.id_restaurante) {
      throw new Error("Usuário sem restaurante associado");
    }

    try {
      const response = await api.post<ApiResponse>(
        `/restaurantes/${user.id_restaurante}/tickets/${ticketId}/aprovar`,
        {
          reconhecimento_facial: reconhecimentoFacial,
        },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || "Erro ao aprovar ticket");
      }
      throw new Error("Erro ao aprovar ticket");
    }
  };

  return {
    verificarTicketManual,
    lerQRCode,
    aprovarTicket,
  };
};
