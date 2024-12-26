// import { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Wallet, Timer } from "lucide-react";
// import { useTickets } from "@/hooks/useTickets";
// import { Ticket } from "@/types/tickets";
// import { api } from "@/lib/axios";
// import { toast } from "@/hooks/use-toast";
// import TicketModal from "./TicketModal";

// interface SummaryCardProps {
//   title: string;
//   value: string | number;
//   icon: React.ReactNode;
//   onClick?: () => void;
// }

// function SummaryCard({ title, value, icon, onClick }: SummaryCardProps) {
//   const renderValue = () => {
//     if (typeof value === "string" && value.includes("#")) {
//       const [number, ...rest] = value.split(" - ");
//       return (
//         <div className="flex flex-col">
//           <span className="font-bold text-primary">{number}</span>
//           <span className="text-xs text-muted-foreground">{rest.join(" - ")}</span>
//         </div>
//       );
//     }
//     return value;
//   };

//   return (
//     <Card
//       className="flex-1 transition-shadow cursor-pointer hover:shadow-md"
//       onClick={onClick}
//     >
//       <CardContent className="p-4">
//         <div className="flex items-center justify-between space-x-4">
//           <div className="flex-1 min-w-0">
//             <p className="text-xs text-muted-foreground font-medium mb-0.5">{title}</p>
//             <div className="text-lg font-bold lg:text-xl">{renderValue()}</div>
//           </div>
//           <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">{icon}</div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// const isTicketValid = (ticket: Ticket): boolean => {
//   return ticket.status === "active" && ticket.tempo_restante !== "Expirado";
// };

// const sortTicketsByDate = (a: Ticket, b: Ticket): number => {
//   return new Date(a.data_cadastro).getTime() - new Date(b.data_cadastro).getTime();
// };

// const getValidTickets = (tickets: Ticket[]): Ticket[] => {
//   return tickets.filter(isTicketValid);
// };

// const getNextExpiringTicket = (tickets: Ticket[]): Ticket | null => {
//   const validTickets = getValidTickets(tickets);
//   return validTickets.length > 0 ? validTickets.sort(sortTicketsByDate)[0] : null;
// };

// const formatNextExpirationText = (ticket: Ticket | null): string => {
//   if (!ticket) return "Nenhum";
//   return `#${ticket.numero} - ${ticket.tempo_restante}`;
// };

// export function TicketsSummary() {
//   const [selectedTicket, setSelectedTicket] = useState<any>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoadingDetails, setIsLoadingDetails] = useState(false);
//   const { tickets, isLoading } = useTickets();

//   const handleViewTicket = async (ticketId: string) => {
//     setIsLoadingDetails(true);
//     try {
//       const response = await api.get(`/tickets/${ticketId}`);
//       const ticketData = response.data.ticket;

//       // Adaptar os dados do ticket para o tipo TicketData
//       const adaptedTicket = {
//         ...ticketData,
//         emissor: ticketData.emissor || "Desconhecido", // Adicionar emissor
//         qrcode: ticketData.qrcode || "Sem QR Code",   // Adicionar qrcode
//         status: parseInt(ticketData.status, 10),     // Converter status para número
//       };

//       setSelectedTicket(adaptedTicket);
//       setIsModalOpen(true);
//     } catch (error: any) {
//       toast({
//         title: "Erro",
//         description: "Não foi possível carregar os detalhes do ticket.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoadingDetails(false);
//     }
//   };

//   const summary = isLoading
//     ? {
//         availableTickets: "-",
//         nextExpirationText: "Carregando...",
//         nextExpiringTicket: null,
//       }
//     : {
//         availableTickets: getValidTickets(tickets).length,
//         nextExpirationText: formatNextExpirationText(getNextExpiringTicket(tickets)),
//         nextExpiringTicket: getNextExpiringTicket(tickets),
//       };

//   return (
//     <>
//       <div className="flex gap-4 p-4">
//         <SummaryCard
//           title="Tickets Disponíveis"
//           value={summary.availableTickets}
//           icon={<Wallet className="w-5 h-5 text-primary" />}
//         />
//         <SummaryCard
//           title="Próximo Vencimento"
//           value={summary.nextExpirationText}
//           icon={<Timer className="w-5 h-5 text-primary" />}
//           onClick={() =>
//             summary.nextExpiringTicket && handleViewTicket(summary.nextExpiringTicket.id)
//           }
//         />
//       </div>

//       <TicketModal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         data={selectedTicket}
//         isLoading={isLoadingDetails}
//       />
//     </>
//   );
// }
