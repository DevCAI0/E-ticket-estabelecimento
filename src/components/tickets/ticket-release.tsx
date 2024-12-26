// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Ticket, AlertCircle, RefreshCcw, Calendar, Utensils } from "lucide-react";
// import Loading from "@/components/Loading";
// import { useReleases } from '@/hooks/useReleases';
// import { SelectionState } from '@/types/releases';
// import { useAuth } from '@/hooks/useAuth';
// import MunicipalitySelection from '../SolicitarTicket/MunicipalitySelection';
// import EstablishmentSelection from '../SolicitarTicket/EstablishmentSelection';
// import RestaurantSelection from '../SolicitarTicket/RestaurantSelection';
// import FacialRecognitionDialog from '../facial-recognition/FacialRecognitionDialog';
// import { toast } from '@/hooks/use-toast';

// interface DialogState {
//   municipio: boolean;
//   estabelecimento: boolean;
//   restaurante: boolean;
//   reconhecimento: boolean;
// }

// export function TicketReleases() {
//   const { token } = useAuth();
//   const { liberacoes, isLoading, isRefreshing, refresh, solicitarTicket } = useReleases();

//   const [selected, setSelected] = useState<SelectionState>({
//     liberacaoId: 0,
//     tipoRefeicao: 0,
//     municipio: 0,
//     estabelecimento: 0,
//     restaurante: 0,
//     reconhecimento_facial: false,
//   });

//   const [dialogs, setDialogs] = useState<DialogState>({
//     municipio: false,
//     estabelecimento: false,
//     restaurante: false,
//     reconhecimento: false,
//   });

//   const hasReleases = liberacoes?.liberacoes && liberacoes.liberacoes.length > 0;

//   const handleFacialRecognitionSuccess = async () => {
//     try {
//       const updatedSelection = {
//         ...selected,
//         reconhecimento_facial: true
//       };

//       const success = await solicitarTicket(updatedSelection);

//       if (success) {
//         toast({
//           title: "Sucesso",
//           description: "Ticket gerado com sucesso!"
//         });
//       }

//       setDialogs(prev => ({ ...prev, reconhecimento: false }));
//       handleReset();
//       refresh();
//     } catch (error) {
//       console.error('Erro ao processar ticket:', error);
//       toast({
//         title: "Erro",
//         description: "Erro ao gerar o ticket. Tente novamente.",
//         variant: "destructive"
//       });
//       handleReset();
//     }
//   };

//   const handleFacialRecognitionClose = () => {
//     setDialogs(prev => ({ ...prev, reconhecimento: false }));
//     handleReset();
//   };

//   const handleLiberacaoSelect = (liberacaoId: number, tipoRefeicao: number) => {
//     setSelected((prev) => ({
//       ...prev,
//       liberacaoId,
//       tipoRefeicao,
//       municipio: 0,
//       estabelecimento: 0,
//       restaurante: 0,
//       reconhecimento_facial: false,
//     }));
//     setDialogs((prev) => ({
//       ...prev,
//       municipio: true,
//     }));
//   };

//   const handleMunicipalitySelection = (municipioId: number) => {
//     setSelected((prev) => ({
//       ...prev,
//       municipio: municipioId,
//       estabelecimento: 0,
//       restaurante: 0,
//     }));
//   };

//   const handleEstablishmentSelection = (estabelecimentoId: number) => {
//     setSelected((prev) => ({
//       ...prev,
//       estabelecimento: estabelecimentoId,
//       restaurante: 0,
//     }));
//   };

//   const handleRestaurantSelection = (restauranteId: number) => {
//     setSelected((prev) => ({
//       ...prev,
//       restaurante: restauranteId,
//     }));
//   };

//   const handleReset = () => {
//     setSelected({
//       liberacaoId: 0,
//       tipoRefeicao: 0,
//       municipio: 0,
//       estabelecimento: 0,
//       restaurante: 0,
//       reconhecimento_facial: false,
//     });
//     setDialogs({
//       municipio: false,
//       estabelecimento: false,
//       restaurante: false,
//       reconhecimento: false,
//     });
//   };

//   if (!token) {
//     return (
//       <div className="flex flex-col items-center justify-center p-4">
//         <AlertCircle className="w-8 h-8 mb-2 text-destructive" />
//         <h2 className="text-lg font-semibold">Acesso Negado</h2>
//         <p className="text-sm text-muted-foreground">
//           Você precisa estar logado para solicitar tickets.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <Card className="w-full transition-shadow duration-300 shadow-md hover:shadow-lg">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex items-center gap-2 text-xl">
//             <Ticket className="w-6 h-6 text-primary" />
//             Liberações Disponíveis
//           </CardTitle>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={refresh}
//             disabled={isRefreshing}
//             className="transition-colors hover:bg-muted/50 hover:text-primary"
//           >
//             <RefreshCcw
//               className={`h-4 w-4 ${isRefreshing ? "animate-spin text-muted-foreground" : ""}`}
//             />
//           </Button>
//         </div>
//         {liberacoes?.funcionario && (
//           <CardDescription>
//             {liberacoes.funcionario.nome}
//           </CardDescription>
//         )}
//       </CardHeader>

//       <CardContent>
//         {isLoading ? (
//           <div className="flex items-center justify-center py-8">
//             <Loading size="lg" text="Carregando liberações..." />
//           </div>
//         ) : (
//           <>
//             {!hasReleases && (
//               <div className="flex flex-col items-center justify-center py-8 space-y-4">
//                 <div className="p-3 rounded-full bg-muted/50">
//                   <AlertCircle className="w-6 h-6 text-muted-foreground" />
//                 </div>
//                 <div className="space-y-2 text-center">
//                   <h3 className="text-lg font-semibold">Nenhuma liberação disponível</h3>
//                   <p className="text-sm text-muted-foreground">
//                     No momento não há liberações disponíveis para solicitação.
//                   </p>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={refresh}
//                     className="mt-2"
//                     disabled={isRefreshing}
//                   >
//                     <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
//                     Atualizar
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {hasReleases && (
//               <div className="space-y-4">
//                 {liberacoes.liberacoes.map((liberacao) => (
//                   <Card
//                     key={liberacao.data}
//                     className="p-4 transition-colors border rounded-lg hover:bg-secondary/50"
//                   >
//                     <div className="flex items-center gap-2 mb-3">
//                       <Calendar className="w-5 h-5 text-gray-500" />
//                       <span className="font-medium">{liberacao.data_formatada}</span>
//                     </div>
//                     <div className="space-y-2">
//                       {liberacao.refeicoes.map((refeicao) => (
//                         <div
//                           key={refeicao.id}
//                           className="flex items-center justify-between p-3 transition-all border rounded-lg hover:bg-muted/30 hover:shadow-sm"
//                         >
//                           <div className="flex items-center gap-2">
//                             <Utensils className="w-4 h-4 text-gray-500" />
//                             <span className="font-medium">{refeicao.tipo_nome}</span>
//                           </div>
//                           <Button
//                             size="sm"
//                             onClick={() => handleLiberacaoSelect(refeicao.id, refeicao.tipo_id)}
//                             className="flex items-center gap-2 transition-colors hover:bg-primary hover:text-primary-foreground"
//                           >
//                             <Ticket className="w-4 h-4" />
//                             Solicitar
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </CardContent>

//       <CardFooter className="flex justify-center text-sm text-muted-foreground">
//         <p>Atualizado em: {new Date().toLocaleString()}</p>
//       </CardFooter>

//       <MunicipalitySelection
//         open={dialogs.municipio}
//         onOpenChange={(open) => setDialogs((prev) => ({ ...prev, municipio: open }))}
//         selectedMunicipio={selected.municipio}
//         tipoRefeicao={selected.tipoRefeicao}
//         onSelect={handleMunicipalitySelection}
//         onNext={() => setDialogs((prev) => ({ ...prev, municipio: false, estabelecimento: true }))}
//       />

//       <EstablishmentSelection
//         open={dialogs.estabelecimento}
//         onOpenChange={(open) => setDialogs((prev) => ({ ...prev, estabelecimento: open }))}
//         selectedEstabelecimento={selected.estabelecimento}
//         municipioId={selected.municipio}
//         tipoRefeicao={selected.tipoRefeicao}
//         onSelect={handleEstablishmentSelection}
//         onNext={() => setDialogs((prev) => ({ ...prev, estabelecimento: false, restaurante: true }))}
//         onBack={() => setDialogs((prev) => ({ ...prev, estabelecimento: false, municipio: true }))}
//       />

//       <RestaurantSelection
//         open={dialogs.restaurante}
//         onOpenChange={(open) => setDialogs((prev) => ({ ...prev, restaurante: open }))}
//         selectedRestaurante={selected.restaurante}
//         estabelecimentoId={selected.estabelecimento}
//         tipoRefeicao={selected.tipoRefeicao}
//         onSelect={handleRestaurantSelection}
//         onNext={() => setDialogs((prev) => ({ ...prev, restaurante: false, reconhecimento: true }))}
//         onBack={() => setDialogs((prev) => ({ ...prev, restaurante: false, estabelecimento: true }))}
//       />

//       <FacialRecognitionDialog
//         open={dialogs.reconhecimento}
//         onClose={handleFacialRecognitionClose}
//         onSuccess={handleFacialRecognitionSuccess}
//       />
//     </Card>
//   );
// }
