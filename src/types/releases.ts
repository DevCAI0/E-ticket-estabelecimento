// src/types/releases.ts
export interface Refeicao {
    id: number;
    tipo_id: number;
    tipo_nome: string;
  }
  
  export interface Liberacao {
    data: string;
    data_formatada: string;
    refeicoes: Refeicao[];
  }
  
  export interface FuncionarioLiberacao {
    funcionario: {
      id: number;
      nome: string;
      cpf: string;
    };
    liberacoes: Liberacao[];
  }
  
  export interface SelectionState {
    liberacaoId: number ;
    tipoRefeicao: number;
    municipio: number ;
    estabelecimento: number ;
    restaurante: number ;
    reconhecimento_facial: boolean; // Adicionado
  }