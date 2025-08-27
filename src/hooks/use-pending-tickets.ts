import { useState, useEffect } from "react";
import { Ticket } from "@/types/ticket";
import { encryptData, decryptData } from "@/lib/crypto";
import { showErrorToast } from "@/components/ui/sonner";

interface TicketPendente extends Ticket {
  adicionadoEm: string;
}

const STORAGE_KEY = "ticketsPendentes";

export function useTicketsPendentes() {
  const [ticketsPendentes, setTicketsPendentes] = useState<TicketPendente[]>(
    [],
  );

  useEffect(() => {
    const armazenado = localStorage.getItem(STORAGE_KEY);
    if (armazenado) {
      try {
        const tickets: TicketPendente[] = decryptData(armazenado);
        if (Array.isArray(tickets)) {
          const ticketsValidos = tickets.filter((ticket) => {
            if (!ticket.expiracao) {
              return false;
            }

            const dataExpiracao = new Date(ticket.expiracao);
            return dataExpiracao > new Date() && ticket.status !== 3;
          });

          setTicketsPendentes(ticketsValidos);

          if (ticketsValidos.length !== tickets.length) {
            const dadosCriptografados = encryptData(ticketsValidos);
            localStorage.setItem(STORAGE_KEY, dadosCriptografados);
          }
        }
      } catch (_error) {
        showErrorToast("Erro ao carregar tickets pendentes");
        localStorage.removeItem(STORAGE_KEY);
        setTicketsPendentes([]);
      }
    }
  }, []);

  const salvarTickets = (tickets: TicketPendente[]) => {
    try {
      const dadosCriptografados = encryptData(tickets);
      localStorage.setItem(STORAGE_KEY, dadosCriptografados);
    } catch (_error) {
      showErrorToast("Erro ao salvar tickets");
    }
  };

  const adicionarTicket = (ticket: Ticket) => {
    if (ticket.status === 3) return;

    setTicketsPendentes((atual) => {
      if (atual.some((t) => t.id === ticket.id)) {
        return atual;
      }

      const novoTicket: TicketPendente = {
        ...ticket,
        adicionadoEm: new Date().toISOString(),
      };

      const novosTickets = [...atual, novoTicket];
      salvarTickets(novosTickets);
      return novosTickets;
    });
  };

  const atualizarStatusTicket = (ticketId: number, novoStatus: number) => {
    setTicketsPendentes((atual) => {
      if (novoStatus === 3) {
        const novosTickets = atual.filter((t) => t.id !== ticketId);
        salvarTickets(novosTickets);
        return novosTickets;
      }

      const novosTickets = atual.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: novoStatus } : ticket,
      );
      salvarTickets(novosTickets);
      return novosTickets;
    });
  };

  const removerTicket = (ticketId: number) => {
    setTicketsPendentes((atual) => {
      const novosTickets = atual.filter((t) => t.id !== ticketId);
      salvarTickets(novosTickets);
      return novosTickets;
    });
  };

  const limparTickets = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTicketsPendentes([]);
  };

  return {
    ticketsPendentes,
    adicionarTicket,
    atualizarStatusTicket,
    removerTicket,
    limparTickets,
  };
}
