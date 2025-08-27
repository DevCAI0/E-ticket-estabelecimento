import { api } from "@/lib/axios";
import { showErrorToast } from "@/components/ui/sonner";

export interface NotaRestaurante {
  id: number;
  nome_solicitante: string;
  cpf_cnpj_solicitante: string;
  valor: number;
  valor_formatado: string;
  status: number;
  status_texto: string;
  data_cadastro_formatada: string;
  data_pagamento_formatada?: string;
  tipo_nota: string;
  usuario_cadastro: string;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PeriodoInfo {
  data_inicio: string;
  data_fim: string;
}

export interface NotasRestauranteResponse {
  success: boolean;
  data: NotaRestaurante[];
  pagination: PaginationInfo;
  periodo: PeriodoInfo;
}

export interface ParametrosListagemNotas {
  mes?: number;
  ano?: number;
  page?: number;
  per_page?: number;
}

export const listarNotasRestaurante = async (
  parametros: ParametrosListagemNotas = {},
): Promise<NotasRestauranteResponse> => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(parametros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/restaurantes/notas${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await api.get<NotasRestauranteResponse>(url);

    if (!response.data.success) {
      throw new Error("Falha ao buscar notas do restaurante");
    }

    return response.data;
  } catch (error) {
    showErrorToast("Erro ao listar notas do restaurante");
    throw error;
  }
};

export const buscarNotasComPaginacao = async (
  pagina: number = 1,
  porPagina: number = 20,
  mes?: number,
  ano?: number,
): Promise<NotasRestauranteResponse> => {
  return listarNotasRestaurante({
    mes,
    ano,
    page: pagina,
    per_page: Math.min(porPagina, 20),
  });
};

export const buscarNotasMesAtual = async (
  pagina: number = 1,
  porPagina: number = 20,
): Promise<NotasRestauranteResponse> => {
  const agora = new Date();
  return buscarNotasComPaginacao(
    pagina,
    porPagina,
    agora.getMonth() + 1,
    agora.getFullYear(),
  );
};

export const buscarNotasPorMes = async (
  mes: number,
  ano: number,
  pagina: number = 1,
  porPagina: number = 20,
): Promise<NotasRestauranteResponse> => {
  return buscarNotasComPaginacao(pagina, porPagina, mes, ano);
};

export const STATUS_NOTAS = {
  AGUARDANDO_APROVACAO: 1,
  APROVADO: 2,
  REJEITADO: 3,
  NOTA_EMITIDA: 4,
  PAGO: 5,
} as const;

export const obterNomeMes = (mes: number): string => {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return meses[mes - 1] || "";
};

export const validarPeriodo = (mes: number, ano: number): boolean => {
  return mes >= 1 && mes <= 12 && ano >= 2020 && ano <= 2030;
};
