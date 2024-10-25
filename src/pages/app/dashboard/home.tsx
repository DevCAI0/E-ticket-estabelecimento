import CardList from "@/components/cards/card-list";
import InstallPWAButton from "./InstallPWAButton";
import { useState, useEffect } from "react";

interface Ticket {
  numeroTicket: string;
  motorista: string;
  tipoRefeicao: string;
  data: string;
  readTime: string; // Assumindo que a data de leitura está salva como string
}

export const TicketSummaryCard = () => {
  const [ticketCount, setTicketCount] = useState<number>(0);

  useEffect(() => {
    const approvedTickets: Ticket[] = JSON.parse(localStorage.getItem('approvedTickets') || '[]');
    const now = new Date();

    // Filtra os tickets das últimas 24 horas
    const recentTickets = approvedTickets.filter((ticket) => {
      const ticketDate = new Date(ticket.readTime);
      const timeDiff = (now.getTime() - ticketDate.getTime()) / (1000 * 60 * 60); // Diferença em horas
      return timeDiff <= 24;
    });

    setTicketCount(recentTickets.length);
  }, []);

  return (
    <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg w-80 h-44">
      <h2 className="text-2xl font-bold mb-4">Tickets lidos nas últimas 24 horas</h2>
      <p className="text-3xl">{ticketCount}</p>
    </div>
  );
};


export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <CardList />
      <InstallPWAButton />
      <TicketSummaryCard />
    </div>
  );
};
