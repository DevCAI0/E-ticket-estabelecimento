import { useState, useEffect } from "react";
import { Ticket } from "@/types/ticket";

interface PendingTicket extends Ticket {
  addedAt: string;
}

export function usePendingTickets() {
  const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("pendingTickets");
    if (stored) {
      const tickets: PendingTicket[] = JSON.parse(stored);
      const validTickets = tickets.filter((ticket) => {
        const expirationDate = new Date(ticket.expiracao);
        return expirationDate > new Date() && ticket.status !== 3;
      });
      setPendingTickets(validTickets);
      if (validTickets.length !== tickets.length) {
        localStorage.setItem("pendingTickets", JSON.stringify(validTickets));
      }
    }
  }, []);

  const addTicket = (ticket: Ticket) => {
    if (ticket.status === 3) return;

    setPendingTickets((current) => {
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

  const updateTicketStatus = (ticketId: number, newStatus: number) => {
    setPendingTickets((current) => {
      if (newStatus === 3) {
        const newTickets = current.filter((t) => t.id !== ticketId);
        localStorage.setItem("pendingTickets", JSON.stringify(newTickets));
        return newTickets;
      }

      const newTickets = current.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket,
      );
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
    updateTicketStatus,
    removeTicket,
    clearTickets,
  };
}
