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
  