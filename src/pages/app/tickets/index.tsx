// // src/pages/app/tickets/index.tsx
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { TicketList } from "@/components/tickets/tickets-list";
// import { useTickets } from "@/hooks/useTickets";

// export default function TicketsPage() {
//   const { isLoading } = useTickets();

//   if (isLoading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2, 3].map(i => (
//           <TicketCardSkeleton key={i} />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">Meus Tickets</h1>
//         <p className="text-muted-foreground">
//           Gerencie seus tickets de alimentação
//         </p>
//       </div>

//       <Tabs defaultValue="active" className="w-full">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="active">
//             Ativos
//           </TabsTrigger>
//           <TabsTrigger value="used">
//             Usados
//           </TabsTrigger>
//           <TabsTrigger value="expired">
//             Expirados
//           </TabsTrigger>
//         </TabsList>

//         {/* <TabsContent value="active" className="mt-4">
//           <TicketList status="active" />
//         </TabsContent>

//         <TabsContent value="used" className="mt-4">
//           <TicketList status="used" />
//         </TabsContent>

//         <TabsContent value="expired" className="mt-4">
//           <TicketList status="expired" />
//         </TabsContent> */}
//       </Tabs>
//     </div>
//   );
// }

// function TicketCardSkeleton() {
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
