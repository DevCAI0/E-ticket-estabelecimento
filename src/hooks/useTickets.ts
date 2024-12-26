// src/hooks/useTickets.ts
import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Ticket } from '@/types/tickets';
import { showErrorToast, showSuccessToast } from '@/components/ui/sonner';

interface UseTicketsReturn {
  tickets: Ticket[];
  isLoading: boolean;
  isError: boolean;
  refresh: () => Promise<void>;
  useTicket: (ticketId: string) => Promise<void>;
}

export function useTickets(): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { user, token } = useAuth();

  const mapStatus = (status: number): 'active' | 'used' | 'expired' => {
    switch (status) {
      case 1:
        return 'active';
      case 2:
        return 'used';
      case 3:
        return 'expired';
      default:
        return 'expired'; // Caso inesperado
    }
  };
  
  const fetchTickets = useCallback(async () => {
    if (!user?.id || !token) return;
  
    try {
      setIsLoading(true);
      setIsError(false);
  
      const response = await api.get(`/tickets/funcionario/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Mapeia os tickets para ajustar o status
      const normalizedTickets = response.data.tickets.map((ticket: any) => ({
        ...ticket,
        status: mapStatus(ticket.status),
      }));
  
      setTickets(normalizedTickets);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      setIsError(true);
      showErrorToast('Não foi possível carregar seus tickets');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token]);
  

  // Usa um ticket
  const useTicket = useCallback(async (ticketId: string) => {
    if (!token) {
      showErrorToast('Você precisa estar logado para usar um ticket');
      return;
    }

    try {
      await api.post(`/tickets/funcionario/${ticketId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Atualiza o estado local
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            status: 'used',
            usedAt: new Date().toISOString()
          };
        }
        return ticket;
      }));

      showSuccessToast('Ticket utilizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao usar ticket:', error);
      showErrorToast(
        error.response?.data?.message || 'Não foi possível usar o ticket'
      );
      throw error;
    }
  }, [token]);

  // Atualiza tickets manualmente
  const refresh = useCallback(async () => {
    await fetchTickets();
  }, [fetchTickets]);

  // Carrega tickets inicialmente
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Atualiza tickets periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets();
    }, 5 * 60 * 1000); // A cada 5 minutos

    return () => clearInterval(interval);
  }, [fetchTickets]);

  return {
    tickets,
    isLoading,
    isError,
    refresh,
    useTicket
  };
}

