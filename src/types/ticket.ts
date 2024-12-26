// src/types/ticket.ts
export interface Ticket {
  id: number;
  numero: number;
  funcionario: {
    id_funcionario: number;
    nome: string;
    cpf: string;
  };
  tipo_refeicao: string;
  valor: number;
  status: number;
  status_texto: string;
  data_emissao: string;
  expiracao: string;
  tempo_restante: string;
}

export interface ApiResponse {
  message: string;
  ticket: Ticket;
}

export interface ApiErrorResponse {
  error: string;
}
