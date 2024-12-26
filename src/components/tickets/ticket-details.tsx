// // src/components/tickets/ticket-details.tsx
// import { useState } from "react";
// import { Ticket } from "@/types/ticket";
// import { useTicketService } from "@/services/ticket-service";
// import { VerificationResult } from "@/types/face-recognition";
// import FacialRecognitionDialog from "../facial-recognition/FacialRecognitionDialog";
// import { toast } from "sonner";

// interface TicketDetailsProps {
//   ticket: Ticket;
//   onNovoPedido?: () => void;
//   onApproved?: () => void;
// }

// export function TicketDetails({ ticket, onApproved }: TicketDetailsProps) {
//   const [showRecognition, setShowRecognition] = useState(false);
//   const ticketService = useTicketService();

//   const handleVerificationSuccess = async (result: VerificationResult) => {
//     try {
//       if (result.isMatch && result.similarity >= result.confidence) {
//         await ticketService.aprovarTicket(ticket.id, true);
//         toast.success("Ticket Aprovado", {
//           description: "Reconhecimento facial confirmado com sucesso",
//         });
//         setShowRecognition(false);
//         onApproved?.();
//       } else {
//         toast.error("Verificação Falhou", {
//           description: "Não foi possível confirmar a identidade",
//         });
//       }
//     } catch {
//       toast.error("Erro", {
//         description: "Erro ao processar verificação facial",
//       });
//     }
//   };

//   const formatarMoeda = (valor: number) => {
//     return new Intl.NumberFormat("pt-BR", {
//       style: "currency",
//       currency: "BRL",
//     }).format(valor);
//   };

//   const formatarData = (dataString: string) => {
//     try {
//       return new Date(dataString).toLocaleDateString("pt-BR");
//     } catch {
//       return "Data inválida";
//     }
//   };

//   const getStatusColor = (status: number) => {
//     switch (status) {
//       case 1:
//         return "text-yellow-600"; // Emitido
//       case 2:
//         return "text-green-600"; // Usado
//       case 3:
//         return "text-red-600"; // Cancelado
//       default:
//         return "text-gray-600";
//     }
//   };

//   return (
//     <div className="p-4 mt-4 space-y-2 rounded-lg bg-muted">
//       <h3 className="font-medium text-foreground">Detalhes do Ticket:</h3>

//       <div className="grid gap-2 text-sm text-muted-foreground">
//         <p>
//           <span className="font-medium text-foreground">Código:</span>{" "}
//           {ticket.numero}
//         </p>

//         <p>
//           <span className="font-medium text-foreground">Tipo:</span>{" "}
//           {ticket.tipo_refeicao}
//         </p>

//         <p>
//           <span className="font-medium text-foreground">Valor:</span>{" "}
//           {formatarMoeda(ticket.valor)}
//         </p>

//         <p>
//           <span className="font-medium text-foreground">Funcionário:</span>{" "}
//           {ticket.funcionario.nome}
//         </p>

//         <p>
//           <span className="font-medium text-foreground">CPF:</span>{" "}
//           {ticket.funcionario.cpf}
//         </p>

//         <p>
//           <span className="font-medium text-foreground">Data de Emissão:</span>{" "}
//           {formatarData(ticket.data_emissao)}
//         </p>

//         <p>
//           <span className="font-medium text-foreground">Expiração:</span>{" "}
//           {formatarData(ticket.expiracao)}
//         </p>

//         <p>
//           <span className="font-medium text-foreground">Tempo Restante:</span>{" "}
//           {ticket.tempo_restante}
//         </p>

//         <p>
//           <span className="font-medium text-foreground">Status:</span>{" "}
//           <span className={getStatusColor(ticket.status)}>
//             {ticket.status_texto}
//           </span>
//         </p>

//         {ticket.status === 1 && (
//           <button
//             onClick={() => setShowRecognition(true)}
//             className="w-full px-4 py-2 mt-4 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
//           >
//             Aprovar Ticket
//           </button>
//         )}
//       </div>

//       <FacialRecognitionDialog
//         open={showRecognition}
//         onSuccess={handleVerificationSuccess}
//         onClose={() => setShowRecognition(false)}
//         funcionarioId={ticket.funcionario.id_funcionario}
//       />
//     </div>
//   );
// }
