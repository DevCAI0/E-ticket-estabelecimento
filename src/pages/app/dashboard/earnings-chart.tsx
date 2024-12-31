import { useEffect, useState } from "react";
import { getApprovedTickets } from "@/api/getApprovedTickets";
import useAuth from "@/hooks/useAuth";
import { showErrorToast } from "@/components/ui/sonner";
import { usePendingTickets } from "@/hooks/use-pending-tickets";

interface ChartData {
  id: string;
  category: string;
  amount: number;
  color: string;
  radius: number;
}

export const EarningsChart = () => {
  const { user } = useAuth();
  const { pendingTickets } = usePendingTickets();
  const [data, setData] = useState<ChartData[]>([
    {
      id: "approved_tickets",
      category: "Tickets últimas 24h",
      amount: 0,
      color: "hsl(var(--chart-1))",
      radius: 42,
    },
    {
      id: "pending_tickets",
      category: "pendentes",
      amount: 0,
      color: "hsl(var(--chart-2))",
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

      try {
        const tickets = await getApprovedTickets(user.id_restaurante);
        const totalAmount = tickets.tickets.length;

        setData((prevData) =>
          prevData.map((item) =>
            item.id === "approved_tickets"
              ? { ...item, amount: totalAmount }
              : item.id === "pending_tickets"
                ? { ...item, amount: pendingTickets.length }
                : item,
          ),
        );
      } catch (err) {
        if (err instanceof Error) {
          showErrorToast(err.message);
        } else {
          showErrorToast("Erro desconhecido ao buscar tickets");
        }
      }
    };

    fetchApprovedTickets();
  }, [user, pendingTickets.length]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const calculateStrokeDashArray = (amount: number) => {
    return (amount / total) * 100;
  };

  return (
    <div className="flex flex-row items-center justify-between gap-4 p-6">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
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
      </div>

      <div className="flex flex-col space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">
              {item.category}
            </span>
            <span className="text-sm font-medium">
              {item.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
