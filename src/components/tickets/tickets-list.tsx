// import { TicketCard } from "./ticket-card";
// import { useTickets } from "@/hooks/useTickets";
// import { AlertCircle } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// interface TicketListProps {
//   status: 'active' | 'used' | 'expired';
// }

// export function TicketCardSkeleton() {
//   return (
//     <div className="p-4 space-y-4 border rounded-lg">
//       <div className="flex items-start justify-between">
//         <div className="space-y-2">
//           <div className="w-32 h-5 rounded bg-muted animate-pulse" />
//           <div className="w-40 h-4 rounded bg-muted animate-pulse" />
//         </div>
//         <div className="w-20 h-6 rounded bg-muted animate-pulse" />
//       </div>
//       <div className="w-24 h-6 rounded bg-muted animate-pulse" />
//     </div>
//   );
// }

// export function TicketList({ status }: TicketListProps) {
//   const { tickets, useTicket, isLoading } = useTickets();

//   // Mostra o esqueleto durante o carregamento
//   if (isLoading) {
//     return (
//       <div className="space-y-4">
//         <TicketCardSkeleton />
//         <TicketCardSkeleton />
//         <TicketCardSkeleton />
//       </div>
//     );
//   }

//   // Filtra os tickets pelo status e considera o tempo_restante para expirados
//   const filteredTickets = tickets.filter(ticket => {
//     if (status === 'expired') {
//       return ticket.status === 'expired' || ticket.tempo_restante === "Expirado";
//     }
//     if (status === 'active') {
//       return ticket.status === status && ticket.tempo_restante !== "Expirado";
//     }
//     return ticket.status === status;
//   });

//   const handleUseTicket = async (ticketId: string) => {
//     try {
//       await useTicket(ticketId);
//     } catch (error) {
//       console.error('Erro ao usar ticket:', error);
//     }
//   };

//   // Mostra a mensagem apenas se não estiver carregando e não houver tickets
//   if (!isLoading && filteredTickets.length === 0) {
//     return (
//       <Alert variant="default" className="bg-muted/50">
//         <AlertCircle className="w-4 h-4" />
//         <AlertDescription>
//           {status === 'active' && 'Você não tem tickets ativos no momento.'}
//           {status === 'used' && 'Nenhum ticket usado recentemente.'}
//           {status === 'expired' && 'Nenhum ticket expirado.'}
//         </AlertDescription>
//       </Alert>
//     );
//   }

//   return (
//     <div className="mb-6 space-y-4">
//       {filteredTickets.map(ticket => (
//         <TicketCard
//           key={ticket.id}
//           ticket={{
//             ...ticket,
//             status: ticket.tempo_restante === "Expirado" ? 'expired' : ticket.status
//           }}
//           onUseTicket={status === 'active' ? handleUseTicket : undefined}
//         />
//       ))}
//     </div>
//   );
// }