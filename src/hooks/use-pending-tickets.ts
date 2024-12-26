// src/hooks/use-pending-tickets.ts
import { useState, useEffect } from "react";
import { Ticket } from "@/types/ticket";

interface PendingTicket extends Ticket {
  addedAt: string;
}

export function usePendingTickets() {
  const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([]);

  // Carrega tickets do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem("pendingTickets");
    if (stored) {
      const tickets: PendingTicket[] = JSON.parse(stored);
      // Filtra tickets expirados
      const validTickets = tickets.filter((ticket) => {
        const expirationDate = new Date(ticket.expiracao);
        return expirationDate > new Date();
      });
      setPendingTickets(validTickets);
      // Atualiza localStorage se algum ticket foi removido por expiração
      if (validTickets.length !== tickets.length) {
        localStorage.setItem("pendingTickets", JSON.stringify(validTickets));
      }
    }
  }, []);

  const addTicket = (ticket: Ticket) => {
    setPendingTickets((current) => {
      // Verifica se o ticket já existe
      if (current.some((t) => t.id === ticket.id)) {
        return current;
      }

      const newTicket: PendingTicket = {
        ...ticket,
        addedAt: new Date().toISOString(),
      };

      const newTickets = [...current, newTicket];
      localStorage.setItem("pendingTickets", JSON.stringify(newTickets));
      return newTickets;
    });
  };

  const removeTicket = (ticketId: number) => {
    setPendingTickets((current) => {
      const newTickets = current.filter((t) => t.id !== ticketId);
      localStorage.setItem("pendingTickets", JSON.stringify(newTickets));
      return newTickets;
    });
  };

  const clearTickets = () => {
    localStorage.removeItem("pendingTickets");
    setPendingTickets([]);
  };

  return {
    pendingTickets,
    addTicket,
    removeTicket,
    clearTickets,
  };
}