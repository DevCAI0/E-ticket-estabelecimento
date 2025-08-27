"use client";

import { useEffect, useState } from "react";
import { getApprovedTickets } from "@/api/tickets/getApprovedTickets";
import useAuth from "@/hooks/auth/useAuth";
import { showErrorToast } from "@/components/ui/sonner";
import { useTicketsPendentes } from "@/hooks/use-pending-tickets";

interface ChartData {
  id: string;
  category: string;
  amount: number;
  color: string;
  radius: number;
}

export const EarningsChart = () => {
  const { user } = useAuth();
  const { ticketsPendentes } = useTicketsPendentes();
  const [isLoading, setIsLoading] = useState(true);

  // Dados iniciais com cores do tema
  const [data, setData] = useState<ChartData[]>([
    {
      id: "approved_tickets",
      category: "Últimas 24h",
      amount: 0,
      color: "hsl(var(--chart-1))", // Usando a variável chart-1 do tema
      radius: 42,
    },
    {
      id: "pending_tickets",
      category: "Pendentes",
      amount: 0,
      color: "hsl(var(--chart-2))", // Usando a variável chart-2 do tema
      radius: 30,
    },
  ]);

  useEffect(() => {
    const fetchApprovedTickets = async () => {
      if (!user) return;

      if (!user.id_restaurante) {
        showErrorToast("Usuário não possui um ID de restaurante associado");
        return;
      }

      setIsLoading(true);
      try {
        const tickets = await getApprovedTickets(user.id_restaurante);
        const totalAmount = tickets.tickets.length;

        setData((prevData) =>
          prevData.map((item) =>
            item.id === "approved_tickets"
              ? { ...item, amount: totalAmount }
              : item.id === "pending_tickets"
                ? { ...item, amount: ticketsPendentes.length }
                : item,
          ),
        );
      } catch (err) {
        if (err instanceof Error) {
          showErrorToast(err.message);
        } else {
          showErrorToast("Erro desconhecido ao buscar tickets");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedTickets();
  }, [user, ticketsPendentes.length]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const calculateStrokeDashArray = (amount: number) => {
    if (total === 0) return 0;
    return (amount / total) * 100;
  };

  return (
    <div className="flex flex-col space-y-4 rounded-lg bg-background p-4 text-foreground">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-md bg-[hsl(var(--chart-3))]"></div>
        <span className="text-sm font-medium">Resumo de Tickets</span>
      </div>

      <div className="flex items-start justify-between">
        <div className="relative h-20 w-20">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[hsl(var(--chart-1))]/20 border-t-[hsl(var(--chart-1))]"></div>
            </div>
          ) : (
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              {/* Círculo de fundo */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
              />

              {/* Círculos de progresso */}
              {data.map((item) => {
                const circumference = 2 * Math.PI * item.radius;
                const percent = calculateStrokeDashArray(item.amount);
                const dashArray = `${(percent * circumference) / 100} ${circumference}`;

                return (
                  <circle
                    key={item.id}
                    cx="50"
                    cy="50"
                    r={item.radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={dashArray}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* Área de informações de texto */}
        <div className="flex w-32 flex-col">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-0.5"
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs font-medium">{item.category}</span>
              </div>
              <span className="text-xs font-medium">{item.amount}</span>
            </div>
          ))}

          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full bg-[hsl(var(--chart-3))]"></div>
              <span className="text-xs font-medium">Total</span>
            </div>
            <span className="text-xs font-medium">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
