// // components/tickets/TicketCard.tsx
// import { useState } from 'react';
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { History, Clock, Coffee, Store } from "lucide-react";
// import { TicketModal } from "./TicketModal";
// import { toast } from '@/hooks/use-toast';
// import { api } from '@/lib/axios';


// interface Ticket {
//   id: string;
//   numero: number; 
//   tipo_refeicao: string;
//   restaurante: string;
//   tempo_restante?: string;
//   status: 'active' | 'used' | 'expired';
//   usedAt?: string;
//   usedAt_location?: string;
// }

// interface StatusConfigs {
//   [key: string]: {
//     label: string;
//     className: string;
//   };
// }

// const statusConfig: StatusConfigs = {
//   active: {
//     label: "Ativo",
//     className: "bg-green-100 text-green-700 border-green-300 font-medium dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
//   },
//   used: {
//     label: "Usado",
//     className: "bg-secondary text-secondary-foreground border-secondary font-medium",
//   },
//   expired: {
//     label: "Expirado",
//     className: "bg-red-100 text-red-700 border-red-300 font-medium dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
//   },
// };
// interface TicketCardProps {
//   ticket: Ticket;
//   onUseTicket?: (ticketId: string) => void;
// }

// export function TicketCard({ ticket }: TicketCardProps) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [ticketDetails, setTicketDetails] = useState<any>(null);

//   const usedAtDate = ticket.usedAt
//     ? new Date(ticket.usedAt).toLocaleDateString("pt-BR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     })
//     : null;

//     const handleUseTicket = async (ticketId: string) => {
//       setIsLoading(true);
//       try {
//         const response = await api.get(`/tickets/${ticketId}`);
//         // Extrair o ticket do objeto de resposta
//         setTicketDetails(response.data.ticket); // Mudado aqui para acessar response.data.ticket
//         setIsModalOpen(true);
//       } catch (error: any) {
//         console.error('Erro ao carregar detalhes do ticket:', error);
//         const errorMessage = error.response?.status === 404
//           ? "Ticket não encontrado."
//           : "Não foi possível carregar os detalhes do ticket.";
    
//         toast({
//           title: "Erro",
//           description: errorMessage,
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     return (
//       <>
//         <Card className="p-4 space-y-3 border border-foreground">
//           <div className="flex items-start justify-between">
//             <div>
//               <div className="flex items-center gap-2">
//                 <Badge 
//                   variant="secondary" 
//                   className="text-xs font-medium bg-secondary text-secondary-foreground"
//                 >
//                   #{ticket.numero}
//                 </Badge>
//               </div>
//               <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
//                 <Coffee className="h-3.5 w-3.5" />
//                 <span>{ticket.tipo_refeicao}</span>
//               </div>
//               <div className="flex items-center gap-1.5 mt-1 text-xs font-medium">
//                 <Store className="h-3.5 w-3.5" />
//                 <span className="truncate">{ticket.restaurante}</span>
//               </div>
//               {ticket.tempo_restante && ticket.status === 'active' && (
//                 <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-primary">
//                   <Clock className="h-3.5 w-3.5" />
//                   <span>{ticket.tempo_restante}</span>
//                 </div>
//               )}
//             </div>
//             <Badge className={statusConfig[ticket.status].className}>
//               {statusConfig[ticket.status].label}
//             </Badge>
//           </div>
  
//           {ticket.status === "used" && (
//             <div className="flex items-center gap-2 pt-3 text-xs font-medium border-t border-muted">
//               <History className="h-3.5 w-3.5" />
//               <div>
//                 <p>Usado em: {usedAtDate}</p>
//                 {ticket.usedAt_location && (
//                   <p>Local: {ticket.usedAt_location}</p>
//                 )}
//               </div>
//             </div>
//           )}
  
//           {ticket.status === "active" && (
//             <div className="pt-3 border-t border-foreground">
//               <Button
//                 onClick={() => handleUseTicket(ticket.id)}
//                 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
//                 size="sm"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Carregando..." : "Usar Ticket"}
//               </Button>
//             </div>
//           )}
//         </Card>
  
//         <TicketModal
//           open={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           data={ticketDetails}
//           isLoading={isLoading}
//         />
//       </>
//     );
//   }
// export default TicketCard;