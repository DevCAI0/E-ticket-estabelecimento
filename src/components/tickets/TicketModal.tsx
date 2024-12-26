// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import QRCode from "react-qr-code";
// import { Building2, Receipt, User, Clock, Store, Calendar } from "lucide-react";
// import { useState, useEffect } from 'react';
// import { DialogTitle } from "@radix-ui/react-dialog";

// interface TicketData {
//  id: string;
//  numero: number;
//  numero_serie: number;
//  linha: string | null;
//  id_restaurante: number;
//  id_estabelecimento: number;
//  id_funcionario: number;
//  nome_funcionario: string;
//  id_tipo_refeicao: number;
//  valor: number;
//  status: number;
//  data_cadastro: string;
//  tempo_restante: string;
//  tipo_refeicao: string;
//  restaurante: string;
//  estabelecimento: string;
//  emissor: string;
//  empresa: string;
//  id_empresa: number;
//  qrcode: string;
// }

// interface TicketModalProps {
//   open: boolean;
//   onClose: () => void;
//   data: TicketData | null;
//   isLoading: boolean;
//   isOffline?: boolean; // Add this line
// }
// interface ImportedModule {
//   default: string;
// }
// export const TicketModal = ({ open, onClose, data, isLoading }: TicketModalProps) => {
//   const [logoUrl, setLogoUrl] = useState<string | null>(null);

//   useEffect(() => {
//     const loadLogo = async () => {
//       if (data?.id_empresa) {
//         try {
//           const logoModules = import.meta.glob<ImportedModule>('/src/assets/empresa/*');
//           const extensions = ['svg', 'png'];

//           for (const ext of extensions) {
//             const path = `/src/assets/empresa/${data.id_empresa}.${ext}`;
//             if (logoModules[path]) {
//               try {
//                 const module = await logoModules[path]();
//                 setLogoUrl(module.default);
//                 break;
//               } catch {
//                 continue;
//               }
//             }
//           }
//         } catch (error) {
//           console.error('Erro ao carregar logo:', error);
//           setLogoUrl(null);
//         }
//       }
//     };

//     loadLogo();
//   }, [data?.id_empresa]);

//  if (isLoading || !data) {
//    return (
//      <Dialog open={open} onOpenChange={onClose}>
//        <DialogContent className="w-[280px] p-0">
//          <div className="flex justify-center items-center h-[300px]">
//            <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-primary" />
//          </div>
//        </DialogContent>
//      </Dialog>
//    );
//  }

//  const isValid = data.status === 1;
//  const formattedDate = new Date(data.data_cadastro).toLocaleDateString('pt-BR', {
//    day: '2-digit',
//    month: '2-digit',
//    year: 'numeric',
//    hour: '2-digit',
//    minute: '2-digit'
//  });

//  return (
//    <Dialog open={open} onOpenChange={onClose}>
//      <DialogContent className="w-[280px] max-h-[90vh] overflow-y-auto p-0">
//        <div className="flex flex-col items-center p-3 space-y-2">
//          {/* Logo Empresa */}
//          <div className="relative flex items-center justify-center w-12 h-12">
//            {logoUrl ? (
//              <img
//                src={logoUrl}
//                alt={`Logo ${data.empresa}`}
//                className="object-contain w-16 h-16"
//              />
//            ) : (
//              <Building2 className="w-8 h-8 text-muted-foreground" />
//            )}
//          </div>

//          {/* Título e Status */}
//          <div className="space-y-1 text-center">
//          <DialogTitle className="text-base font-bold">Ticket Refeição</DialogTitle>
//            <Badge
//              variant="secondary"
//              className={isValid
//                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
//                : "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
//              }
//            >
//              {isValid ? "Válido" : "Expirado"}
//            </Badge>
//          </div>

//          {/* Funcionário */}
//          <div className="flex items-center gap-1.5 text-sm">
//            <User className="w-4 h-4" />
//            <span className="font-medium">{data.nome_funcionario}</span>
//          </div>

//          {/* Empresa e Estabelecimento */}
//          <div className="space-y-1 text-center">
//            <p className="text-xs font-semibold">{data.empresa}</p>
//            <p className="text-xs text-muted-foreground">{data.estabelecimento}</p>
//          </div>

//          {/* Restaurante */}
//          <div className="flex items-center gap-1.5 text-xs font-medium">
//            <Store className="h-3.5 w-3.5" />
//            <span>{data.restaurante}</span>
//          </div>

//          {/* Data e Tempo Restante */}
//          <div className="space-y-1 text-center">
//            <div className="flex items-center gap-1.5 text-xs justify-center font-medium">
//              <Calendar className="h-3.5 w-3.5" />
//              <span>{formattedDate}</span>
//            </div>
//            {data.tempo_restante && (
//              <div className="flex items-center gap-1.5 text-xs justify-center text-primary font-medium">
//                <Clock className="h-3.5 w-3.5" />
//                <span>Tempo restante: {data.tempo_restante}</span>
//              </div>
//            )}
//          </div>

//          {/* Tipo de Refeição */}
//          <div className="text-center">
//            <p className="text-sm font-medium text-green-600 dark:text-green-400">
//              {data.tipo_refeicao}
//            </p>
//          </div>

//          {/* Emissor */}
//          <p className="text-xs font-medium text-muted-foreground">
//            Emissor: {data.emissor}
//          </p>

//          {/* QR Code */}
//          {isValid && (
//            <div className="p-2 bg-white border-2 rounded-lg border-border">
//              <QRCode
//                value={data.qrcode}
//                size={120}
//                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
//                viewBox={`0 0 256 256`}
//                level="H"
//              />
//            </div>
//          )}

//          {/* Número do Ticket */}
//          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
//            <Receipt className="w-4 h-4" />
//            <span>#{data.numero}</span>
//          </div>

//          {/* Série do Ticket */}
//          <p className="text-[10px] text-muted-foreground">
//            Série: {data.numero_serie}
//          </p>
//        </div>
//      </DialogContent>
//    </Dialog>
//  );
// };

// export default TicketModal;
