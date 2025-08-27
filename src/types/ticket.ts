// src/types/ticket.ts - Tipos unificados para tickets (versão limpa)

// ✅ INTERFACE BASE PARA FUNCIONÁRIO
export interface Funcionario {
  id_funcionario: number | null;
  nome: string;
  cpf: string;
}

// ✅ INTERFACE PRINCIPAL PARA TICKET (uso geral)
export interface Ticket {
  id: number;
  numero: number;
  codigo?: string; // Para tickets avulsos
  funcionario: Funcionario;
  tipo_refeicao: string;
  valor: number;
  status: number;
  status_texto: string;
  data_emissao: string;
  data_cadastro?: string;
  data_validade?: string; // Para tickets avulsos
  expiracao?: string; // Para tickets normais
  tempo_restante: string;
  expirado?: boolean; // Para tickets avulsos
}

// ✅ INTERFACE PARA TICKET DETALHADO (dados completos da API)
export interface TicketDetalhado {
  id: string;
  numero: number;
  numero_serie: number;
  linha: string | null;
  id_restaurante: number;
  id_estabelecimento: number;
  id_funcionario: number;
  nome_funcionario: string;
  id_tipo_refeicao: number;
  tipo_refeicao: string;
  id_liberacao: number;
  id_funcao: number;
  id_serie: number | null;
  valor: number;
  data_hora_leitura_restaurante: string | null;
  id_usuario_leitura_restaurante: number | null;
  data_hora_leitura_conferencia: string | null;
  id_usuario_leitura_conferencia: number | null;
  id_nota: number | null;
  quantidade_impressoes: number | null;
  impressao: string | null;
  id_ticket_avulso: number | null;
  id_empresa: number;
  id_cadastro: number;
  nome_emissor: string;
  empresa: string;
  data_cadastro: string;
  expiration: string;
  id_alteracao: number | null;
  data_alteracao: string | null;
  status: "active" | "used" | "expired";
  tempo_restante?: string;
  restaurante: string;
  estabelecimento: string;
  funcao: string;
  expirationDate?: string;
  usedAt?: string;
  usedAt_location?: string;
}

// ✅ INTERFACE PARA TICKET NO PEDIDO (usado no DeliverToEmployeeDialog)
export interface TicketPedido {
  id: number;
  numero_ticket: string;
  tipo_ticket: "normal" | "avulso";
  nome_funcionario: string;
  cpf_funcionario: string;
  id_tipo_refeicao: number;
  valor_unitario: number;
  quantidade: number;
  funcionario_id?: number;
  id_ticket?: number;
  id_ticket_avulso?: number;
  status?: "pending" | "consumed" | "error";
  error_message?: string;

  // ✅ NOVOS CAMPOS ADICIONADOS
  status_ticket?: number; // Status do ticket (1=emitido, 2=lido, 3=consumido)
  ticket_entregue?: boolean; // Se já foi entregue ao funcionário
  pode_entregar?: boolean; // Se pode ser entregue
  status_ticket_texto?: string; // Texto do status do ticket
}

// ✅ INTERFACE PARA RESPOSTA DA API
export interface ApiResponse {
  success: boolean;
  message: string;
  ticket?: Ticket;
  tipo?: "ticket_normal" | "ticket_avulso";
  pode_consumir?: boolean;
}

// ✅ INTERFACE PARA ERRO DA API
export interface ApiErrorResponse {
  success: false;
  error?: string;
  message?: string;
  exception?: string;
}

// ✅ INTERFACE PARA TICKET APROVADO
export interface TicketAprovado {
  id: number;
  tipo: string;
  empresa: string;
  localEmissao: string;
  motorista: string;
  matricula: string;
  localRefeicao: string;
  numeroTicket: string;
  data: string;
  tipoRefeicao: string;
  qrCode: {
    numeroTicket: string;
    motorista: string;
    tipoRefeicao: string;
    data: string;
  };
}

// ✅ INTERFACES AUXILIARES
export interface Liberacao {
  data: string;
  data_formatada: string;
  refeicoes: Refeicao[];
}

export interface Refeicao {
  id: number;
  tipo_id: number;
  tipo_nome: string;
}

export interface StatusConfig {
  label: string;
  className: string;
}

// ✅ TYPE PARA CONFIGURAÇÕES DE STATUS
export type StatusConfigs = {
  [key in TicketDetalhado["status"]]: StatusConfig;
};

// ✅ FUNÇÃO HELPER PARA CONVERTER TIPOS
export function converterTicketDetalhadoParaTicket(
  ticketDetalhado: TicketDetalhado,
): Ticket {
  return {
    id: parseInt(ticketDetalhado.id),
    numero: ticketDetalhado.numero,
    funcionario: {
      id_funcionario: ticketDetalhado.id_funcionario,
      nome: ticketDetalhado.nome_funcionario,
      cpf: "", // Não disponível no TicketDetalhado
    },
    tipo_refeicao: ticketDetalhado.tipo_refeicao,
    valor: ticketDetalhado.valor,
    status:
      ticketDetalhado.status === "active"
        ? 1
        : ticketDetalhado.status === "used"
          ? 2
          : 0,
    status_texto: ticketDetalhado.status,
    data_emissao: ticketDetalhado.data_cadastro,
    data_cadastro: ticketDetalhado.data_cadastro,
    expiracao: ticketDetalhado.expiration,
    tempo_restante: ticketDetalhado.tempo_restante || "",
  };
}
