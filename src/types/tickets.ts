export interface Ticket {
  id: string; // ID único do ticket
  numero: number; // Número do ticket
  numero_serie: number; // Número de série do ticket
  linha: string | null; // Linha relacionada ao ticket (se aplicável)
  id_restaurante: number; // ID do restaurante
  id_estabelecimento: number; // ID do estabelecimento
  id_funcionario: number; // ID do funcionário
  nome_funcionario: string; // Nome do funcionário associado ao ticket
  id_tipo_refeicao: number; // ID do tipo de refeição
  tipo_refeicao: string; // Nome do tipo de refeição (Ex.: Almoço, Café)
  id_liberacao: number; // ID da liberação
  id_funcao: number; // ID da função do funcionário
  id_serie: number | null; // Número de série (se aplicável)
  valor: number; // Valor do ticket
  data_hora_leitura_restaurante: string | null; // Data e hora de leitura no restaurante
  id_usuario_leitura_restaurante: number | null; // ID do usuário que leu no restaurante
  data_hora_leitura_conferencia: string | null; // Data e hora de leitura na conferência
  id_usuario_leitura_conferencia: number | null; // ID do usuário que leu na conferência
  id_nota: number | null; // ID da nota associada ao ticket
  quantidade_impressoes: number | null; // Quantidade de impressões do ticket
  impressao: string | null; // Informações de impressão
  id_ticket_avulso: number | null; // ID do ticket avulso
  id_empresa: number; // ID da empresa associada ao ticket
  id_cadastro: number; // ID do cadastro do ticket
  nome_emissor: string; // Nome do emissor (baseado no `id_cadastro`)
  empresa: string; // Nome da empresa associada ao ticket
  data_cadastro: string; // Data de cadastro do ticket
  expiration: string;
  id_alteracao: number | null; // ID de alteração
  data_alteracao: string | null; // Data de alteração
  status: "active" | "used" | "expired"; // Status do ticket
  tempo_restante?: string; // Tempo restante até o vencimento do ticket
  restaurante: string; // Nome do restaurante associado ao ticket
  estabelecimento: string; // Nome do estabelecimento associado ao ticket
  funcao: string; // Nome da função associada ao funcionário
  expirationDate?: string; // Data de expiração (opcional, se calculado no frontend)
  usedAt?: string; // Data e hora em que o ticket foi usado
  usedAt_location?: string; // Local onde o ticket foi usado
}

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

export type StatusConfigs = {
  [key in Ticket["status"]]: StatusConfig;
};
