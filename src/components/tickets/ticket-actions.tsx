// // src/components/tickets/ticket-actions.tsx
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Ticket } from 'lucide-react';

// interface TicketActionsProps {
//   onConfirm: () => Promise<void>;
//   isDisabled?: boolean;
// }

// export function TicketActions({ onConfirm, isDisabled }: TicketActionsProps) {
//   return (
//     <AlertDialog>
//       <AlertDialogTrigger asChild>
//         <Button
//           className="w-full"
//           variant="secondary"
//           disabled={isDisabled}
//         >
//           <Ticket className="w-4 h-4 mr-2" />
//           Usar Ticket
//         </Button>
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Usar Ticket</AlertDialogTitle>
//           <AlertDialogDescription>
//             Tem certeza que deseja usar este ticket? Esta ação não pode ser desfeita.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancelar</AlertDialogCancel>
//           <AlertDialogAction onClick={onConfirm}>
//             Confirmar
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }
