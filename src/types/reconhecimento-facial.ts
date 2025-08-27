// src/types/reconhecimento-facial.ts
export type EtapaVerificacao = "INICIAL" | "COMPARANDO" | "SUCESSO" | "FALHA";

// ✅ Adicionar EstadosVerificacao que estava faltando
export enum EstadosVerificacao {
  INICIAL = "INICIAL",
  POSICIONANDO = "POSICIONANDO",
  PRONTO = "PRONTO",
  ESCANEANDO = "ESCANEANDO",
  SUCESSO = "SUCESSO",
  FALHA = "FALHA",
  NEGADO = "NEGADO",
}

export interface ResultadoVerificacao {
  corresponde: boolean;
  rotulo: string;
  similaridade: number;
  confianca: number;
  tempoProcessamento: number;
  quantidadeImagensReferencia: number;
  timestamp: string;
  distancia: number;
  imagemVerificacao?: string; // URL/base64 da imagem que foi usada para verificação
  imagemCapturada?: string; // URL/base64 da imagem que foi capturada durante o processo
}

// ✅ Adicionar RegistroVerificacao que pode ser usado em outros hooks
export interface RegistroVerificacao {
  id: string;
  tipo: "sucesso" | "erro" | "info" | "aviso";
  mensagem: string;
  timestamp: string;
  detalhes?: string;
  resultado?: ResultadoVerificacao;
  funcionarioId?: number;
  etapa?: EtapaVerificacao;
}

// Interfaces auxiliares para o serviço
export interface ConfiguracaoReconhecimento {
  limiarConfianca: number;
  maxTentativas: number;
  timeoutVerificacao: number;
}

export interface DadosCaptura {
  imagem: string;
  qualidade: number;
  dimensoes: {
    largura: number;
    altura: number;
  };
}
