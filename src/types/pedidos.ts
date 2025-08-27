// types/pedidos.ts - Definições completas para o novo fluxo

export interface Estabelecimento {
  id: number;
  nome: string;
  logradouro?: string;
}

export interface Restaurante {
  id: number;
  nome: string;
  logradouro?: string;
}

export interface RestauranteDisponivel {
  id: number;
  nome: string;
  logradouro?: string;
  id_estabelecimento: number;
  tipos_refeicao_disponiveis: TipoRefeicaoDisponivel[];
}

export interface TipoRefeicaoDisponivel {
  id: number;
  nome: string;
}

export interface Usuario {
  id: number;
  nome: string;
}

export interface TipoRefeicao {
  id: number;
  nome: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
}

export interface Ticket {
  id: number;
  numero: string;
  funcionario?: Funcionario;
}

export interface TicketAvulso {
  id: number;
  numero: string;
  nome: string;
  cpf: string;
}

export interface PedidoItem {
  id: number;
  numero_ticket: string;
  tipo_ticket: "normal" | "avulso";
  id_ticket?: number;
  id_ticket_avulso?: number;
  id_tipo_refeicao: number;
  nome_funcionario: string;
  cpf_funcionario: string;
  valor_unitario: number;
  quantidade: number;
  tipoRefeicao?: TipoRefeicao;
  ticket?: Ticket;
  ticketAvulso?: TicketAvulso;
}

export interface PedidoSimplificado {
  id: number;
  codigo_pedido: string;
  status: number;
  status_texto: string;
  data_pedido: string;
  data_aceito?: string;
  data_em_preparo?: string;
  data_pronto?: string;
  data_entregue?: string;
  data_recusado?: string;
  data_cancelado?: string;
  observacoes?: string;
  quantidade_total: number;
  valor_total: string;
  estabelecimento: Estabelecimento;
  restaurante: Restaurante;
  solicitante: Usuario;
  total_itens: number;
  motivo_recusa?: string;
  metodo_entrega?: "qr_code" | "codigo_manual";
  qr_code_usado_em?: string;
}

export interface Pedido extends PedidoSimplificado {
  usuarioSolicitante: Usuario;
  usuarioAceito?: Usuario;
  usuarioEmPreparo?: Usuario;
  usuarioRecusado?: Usuario;
  usuarioPronto?: Usuario;
  usuarioEntregue?: Usuario;
  usuarioCancelado?: Usuario;
  itensPedido: PedidoItem[];
  qr_code_data?: string;
}

export interface CriarPedidoRequest {
  id_restaurante: number;
  tickets: string[];
  observacoes?: string;
}

export const TIPOS_REFEICAO = {
  1: "Café",
  2: "Lanche",
  3: "Almoço",
  4: "Jantar",
} as const;

export interface BuscarTicketsRequest {
  numeros_tickets: string[];
  id_restaurante: number;
}

export interface TicketDisponivel {
  numero: string;
  tipo: "normal" | "avulso";
  encontrado: boolean;
  ticket_id?: number;
  empresa_id?: number;
  funcionario_nome?: string;
  funcionario_cpf?: string;
  tipo_refeicao?: string;
  valor?: number;
  valor_formatado?: string;
  erro?: string;
}

export interface PedidosFilters {
  status?: number;
  data_inicio?: string;
  data_fim?: string;
  id_restaurante?: number;
  id_estabelecimento?: number;
  codigo_pedido?: string;
  apenas_hoje?: boolean;
  apenas_pendentes?: boolean;
  per_page?: number;
  page?: number;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface PedidosListResponse {
  success: boolean;
  pedidos: PedidoSimplificado[];
  pagination: PaginationMeta;
}

export interface PedidoResponse {
  success: boolean;
  message?: string;
  pedido: Pedido;
}

// ✅ NOVAS INTERFACES PARA QR CODE
export interface QRCodeResponse {
  success: boolean;
  qr_code_data: string;
  codigo_pedido: string;
  estabelecimento?: string;
  message: string;
}

export interface QRScanResponse {
  success: boolean;
  message: string;
  pedido?: Pedido; // ✅ Tipo específico em vez de any
  qr_valido?: boolean;
}

// ✅ STATUS CORRETOS
export const PEDIDO_STATUS = {
  PENDENTE: 1,
  EM_PREPARO: 3, // ✅ Aceitar vai direto para EM_PREPARO
  PRONTO: 4,
  ENTREGUE: 5,
  RECUSADO: 6,
  CANCELADO: 7,
} as const;

export const STATUS_LABELS = {
  [PEDIDO_STATUS.PENDENTE]: "Pendente",
  [PEDIDO_STATUS.EM_PREPARO]: "Em Preparo",
  [PEDIDO_STATUS.PRONTO]: "Pronto",
  [PEDIDO_STATUS.ENTREGUE]: "Entregue",
  [PEDIDO_STATUS.RECUSADO]: "Recusado",
  [PEDIDO_STATUS.CANCELADO]: "Cancelado",
} as const;

export const PEDIDO_STATUS_TEXTO = {
  1: "Pendente",
  3: "Em Preparo",
  4: "Pronto",
  5: "Entregue",
  6: "Recusado",
  7: "Cancelado",
} as const;

// ✅ AÇÕES E PERMISSÕES ATUALIZADAS
export const ACOES_USUARIO = {
  CRIAR_PEDIDO: "criar_pedido",
  BUSCAR_TICKETS: "buscar_tickets",
  ADICIONAR_ITENS: "adicionar_itens",
  REMOVER_ITENS: "remover_itens",
  ACEITAR_PEDIDO: "aceitar_pedido",
  RECUSAR_PEDIDO: "recusar_pedido",
  MARCAR_PRONTO: "marcar_pronto",
  VISUALIZAR_PEDIDOS: "visualizar_pedidos",
  CANCELAR_PEDIDO: "cancelar_pedido",
  VER_ESTATISTICAS: "ver_estatisticas",
  VER_QR_CODE: "ver_qr_code", // ✅ Apenas estabelecimento
  ESCANEAR_QR_CODE: "escanear_qr_code", // ✅ Apenas restaurante
} as const;

// ✅ Tipo das ações do usuário
export type AcaoUsuario = (typeof ACOES_USUARIO)[keyof typeof ACOES_USUARIO];

// ✅ Adicionando admin ao PERMISSOES_POR_TIPO
export const PERMISSOES_POR_TIPO = {
  estabelecimento: [
    ACOES_USUARIO.CRIAR_PEDIDO,
    ACOES_USUARIO.BUSCAR_TICKETS,
    ACOES_USUARIO.ADICIONAR_ITENS,
    ACOES_USUARIO.REMOVER_ITENS,
    ACOES_USUARIO.VISUALIZAR_PEDIDOS,
    ACOES_USUARIO.CANCELAR_PEDIDO,
    ACOES_USUARIO.VER_ESTATISTICAS,
    ACOES_USUARIO.VER_QR_CODE, // ✅ Apenas estabelecimento pode ver
  ] as AcaoUsuario[],
  restaurante: [
    ACOES_USUARIO.ACEITAR_PEDIDO,
    ACOES_USUARIO.RECUSAR_PEDIDO,
    ACOES_USUARIO.MARCAR_PRONTO,
    ACOES_USUARIO.VISUALIZAR_PEDIDOS,
    ACOES_USUARIO.CANCELAR_PEDIDO,
    ACOES_USUARIO.VER_ESTATISTICAS,
    ACOES_USUARIO.ESCANEAR_QR_CODE, // ✅ Apenas restaurante pode escanear
  ] as AcaoUsuario[],
  fornecedor: [] as AcaoUsuario[],
  admin: [
    // ✅ Admin tem todas as permissões
    ACOES_USUARIO.CRIAR_PEDIDO,
    ACOES_USUARIO.BUSCAR_TICKETS,
    ACOES_USUARIO.ADICIONAR_ITENS,
    ACOES_USUARIO.REMOVER_ITENS,
    ACOES_USUARIO.ACEITAR_PEDIDO,
    ACOES_USUARIO.RECUSAR_PEDIDO,
    ACOES_USUARIO.MARCAR_PRONTO,
    ACOES_USUARIO.VISUALIZAR_PEDIDOS,
    ACOES_USUARIO.CANCELAR_PEDIDO,
    ACOES_USUARIO.VER_ESTATISTICAS,
    ACOES_USUARIO.VER_QR_CODE,
    ACOES_USUARIO.ESCANEAR_QR_CODE,
  ] as AcaoUsuario[],
  indefinido: [] as AcaoUsuario[],
} as const;

// ✅ USER PERMISSIONS INTERFACE
export interface UserPermissions {
  canCreateOrders: boolean;
  canViewOrders: boolean;
  canAddItems: boolean;
  canRemoveItems: boolean;
  canCancelOrders: boolean;
  canAcceptOrders: boolean;
  canRejectOrders: boolean;
  canMarkReady: boolean;
  canViewQRCode: boolean; // ✅ Ver QR Code (estabelecimento)
  canScanQRCode: boolean; // ✅ Escanear QR Code (restaurante)
  canViewStatistics: boolean;
}

// ✅ USER CONTEXT INTERFACE
export interface UsuarioContexto {
  id: number;
  nome: string;
  login: string;
  tipo:
    | "estabelecimento"
    | "restaurante"
    | "fornecedor"
    | "admin"
    | "indefinido";
  tipo_descricao: string;
  estabelecimento: {
    id: number | null;
    nome: string | null;
  };
  restaurante: {
    id: number | null;
    nome: string | null;
  };
  fornecedor: {
    id: number | null;
    nome: string | null;
  };
  permissoes: {
    pode_criar_pedidos: boolean;
    pode_gerenciar_restaurante: boolean;
    pode_entregar_pedidos: boolean;
    pode_buscar_tickets: boolean;
    pode_modificar_itens: boolean;
    pode_ver_qr_code: boolean; // ✅ Novo
    pode_escanear_qr_code: boolean; // ✅ Novo
  };
}

// ✅ USER TYPE
export type UserType =
  | "estabelecimento"
  | "restaurante"
  | "fornecedor"
  | "admin"
  | "indefinido";

// ✅ MAPEAMENTO DE CORES PARA STATUS
export const STATUS_COLORS = {
  [PEDIDO_STATUS.PENDENTE]: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    border: "border-yellow-500",
  },
  [PEDIDO_STATUS.EM_PREPARO]: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-400",
    border: "border-purple-500",
  },
  [PEDIDO_STATUS.PRONTO]: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-800 dark:text-orange-400",
    border: "border-orange-500",
  },
  [PEDIDO_STATUS.ENTREGUE]: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    border: "border-green-500",
  },
  [PEDIDO_STATUS.RECUSADO]: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-400",
    border: "border-red-500",
  },
  [PEDIDO_STATUS.CANCELADO]: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-800 dark:text-gray-400",
    border: "border-gray-500",
  },
} as const;

// ✅ HELPER FUNCTIONS
export const getStatusText = (status: number): string => {
  return (
    PEDIDO_STATUS_TEXTO[status as keyof typeof PEDIDO_STATUS_TEXTO] ||
    "Indefinido"
  );
};

// ✅ Corrigindo a função isStatusFinal - removendo tipo não usado
export const isStatusFinal = (status: number): boolean => {
  const statusFinais = [
    PEDIDO_STATUS.ENTREGUE,
    PEDIDO_STATUS.RECUSADO,
    PEDIDO_STATUS.CANCELADO,
  ] as number[];

  return statusFinais.includes(status);
};

export const canTransitionTo = (
  currentStatus: number,
  targetStatus: number,
): boolean => {
  const validTransitions: Record<number, number[]> = {
    [PEDIDO_STATUS.PENDENTE]: [
      PEDIDO_STATUS.EM_PREPARO,
      PEDIDO_STATUS.RECUSADO,
      PEDIDO_STATUS.CANCELADO,
    ],
    [PEDIDO_STATUS.EM_PREPARO]: [PEDIDO_STATUS.PRONTO, PEDIDO_STATUS.CANCELADO],
    [PEDIDO_STATUS.PRONTO]: [PEDIDO_STATUS.ENTREGUE],
    [PEDIDO_STATUS.RECUSADO]: [],
    [PEDIDO_STATUS.ENTREGUE]: [],
    [PEDIDO_STATUS.CANCELADO]: [],
  };

  return validTransitions[currentStatus]?.includes(targetStatus) || false;
};

// ✅ QR CODE STRUCTURE
export interface QRCodeData {
  codigo_pedido: string;
  id_estabelecimento: number;
  id_empresa: number;
  timestamp: number;
  hash: string;
}
