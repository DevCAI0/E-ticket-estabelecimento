// // src/components/tickets/leitor-qrcode.tsx
// import { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { CheckCircle2, AlertCircle } from "lucide-react";
// import { useTicketService } from "@/services/ticket-service";
// import { QrScanner } from "./qr-scanner";
// import { TicketDetails } from "./ticket-details";
// import { Ticket } from "@/types/ticket";
// import { useAuth } from "@/hooks/useAuth";
// import { usePendingTickets } from "@/hooks/use-pending-tickets";

// interface ResultadoLeitura {
//   status: "success" | "error" | "approved";
//   mensagem: string;
//   ticket?: Ticket;
// }

// export function LeitorQRCode() {
//   const [lendo, setLendo] = useState(true);
//   const [resultado, setResultado] = useState<ResultadoLeitura | null>(null);
//   const ticketService = useTicketService();
//   const { addTicket } = usePendingTickets();

//   const { user } = useAuth();

//   const handleScan = async (qrCode: string) => {
//     setLendo(false);

//     if (!user?.id_restaurante) {
//       setResultado({
//         status: "error",
//         mensagem: "Usuário sem restaurante associado",
//       });
//       return;
//     }

//     try {
//       const response = await ticketService.lerQRCode(qrCode);
//       // Adiciona o ticket à lista de pendentes
//       if (response.ticket) {
//         addTicket(response.ticket);
//       }
//       setResultado({
//         status: "success",
//         mensagem: response.message,
//         ticket: response.ticket,
//       });
//     } catch (error) {
//       setResultado({
//         status: "error",
//         mensagem:
//           error instanceof Error ? error.message : "Erro ao processar o ticket",
//       });
//     }
//   };

//   const handleNovoPedido = () => {
//     setResultado(null);
//     setLendo(true);
//   };

//   const handleTicketApproved = () => {
//     setResultado((prev) =>
//       prev
//         ? {
//             status: "approved",
//             mensagem: "Ticket aprovado com sucesso",
//             ticket: prev.ticket,
//           }
//         : null,
//     );
//   };

//   // Verifica permissão do usuário
//   if (!user?.id_restaurante) {
//     return (
//       <div className="flex flex-col items-center gap-4 p-4">
//         <Card className="w-full max-w-md border border-border bg-card">
//           <CardContent className="p-6">
//             <Alert variant="destructive">
//               <AlertCircle className="w-5 h-5" />
//               <AlertTitle>Acesso Negado</AlertTitle>
//               <AlertDescription>
//                 Você não tem permissão para ler tickets. Contate o
//                 administrador.
//               </AlertDescription>
//             </Alert>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const renderContent = () => {
//     if (lendo) {
//       return <QrScanner onScan={handleScan} />;
//     }

//     if (!resultado) return null;

//     return (
//       <div className="space-y-4">
//         {resultado.status === "approved" && (
//           <Alert variant="default">
//             <div className="flex items-center gap-2">
//               <CheckCircle2 className="w-5 h-5" />
//               <AlertTitle>Ticket Aprovado!</AlertTitle>
//             </div>
//           </Alert>
//         )}

//         {resultado.status === "error" && (
//           <Alert variant="destructive">
//             <div className="flex items-center gap-2">
//               <AlertCircle className="w-5 h-5" />
//               <AlertTitle>Erro na Leitura</AlertTitle>
//             </div>
//             <AlertDescription>{resultado.mensagem}</AlertDescription>
//           </Alert>
//         )}

//         {resultado.status === "success" && resultado.ticket && (
//           <TicketDetails
//             ticket={resultado.ticket}
//             onApproved={handleTicketApproved}
//           />
//         )}

//         {/* Botão sempre visível após a leitura */}
//         <button
//           onClick={handleNovoPedido}
//           className="w-full px-4 py-2 transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
//         >
//           {resultado.status === "error"
//             ? "Tentar Novamente"
//             : "Ler Novo Ticket"}
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col items-center gap-4 p-4">
//       <Card className="w-full max-w-md border border-border bg-card">
//         <CardContent className="p-6">{renderContent()}</CardContent>
//       </Card>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";

export const LerQrCode = () => {
  const [ticketInfo, setTicketInfo] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [, setIsTicketApproved] = useState<boolean>(false);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("ticketInfo");
    if (storedData) {
      setTicketInfo(JSON.parse(storedData));
    }
  }, []);

  const startScanning = () => {
    if (!qrCodeScannerRef.current) {
      qrCodeScannerRef.current = new Html5Qrcode("reader");
    }

    setIsScanning(true);
    qrCodeScannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (text) => {
        try {
          console.log(`Texto do QR Code: ${text}`);

          // Verificar se o texto é um JSON válido
          let info;
          try {
            info = JSON.parse(text);
          } catch (e) {
            showErrorToast("QR Code inválido!");
            stopScanning();
            return;
          }

          // Verificar se o ticket é válido e aprovado
          if (info.numeroTicket && info.motorista) {
            setTicketInfo(info);
            setIsTicketApproved(true);
            const approvedTickets = JSON.parse(
              localStorage.getItem("approvedTickets") || "[]",
            );
            approvedTickets.push(info);
            localStorage.setItem(
              "approvedTickets",
              JSON.stringify(approvedTickets),
            );
            showSuccessToast("Ticket aprovado com sucesso!");
          } else {
            showErrorToast("Ticket inválido!");
          }

          stopScanning();
        } catch (error: any) {
          console.error("Erro ao processar QR Code:", error);
          stopScanning();
          showErrorToast("Erro ao processar QR Code.");
        }
      },
      (error: any) => {
        // Lida com erros de leitura sem disparar alertas continuamente
        if (
          error &&
          typeof error === "object" &&
          error.name !== "NotFoundException"
        ) {
          console.warn(`Erro de leitura: ${error.message || error}`);
          showErrorToast(`Erro de leitura: ${error.message || error}`);
        }
      },
    );
  };

  const stopScanning = () => {
    if (qrCodeScannerRef.current && isScanning) {
      qrCodeScannerRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
          showSuccessToast("Escaneamento parado.");
        })
        .catch((err) => {
          console.error("Erro ao parar a leitura:", err);
          showErrorToast("Erro ao parar a leitura.");
        });
    } else {
      console.warn("Scanner não está rodando.");
      setIsScanning(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <h1 className="ml-2 text-2xl font-bold">Leitor de QR Code</h1>
      </div>

      <div className="mb-4 flex justify-center">
        <button
          onClick={isScanning ? stopScanning : startScanning}
          className={`rounded-lg px-6 py-2 font-semibold transition ${
            isScanning
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {isScanning ? "Parar Escaneamento" : "Iniciar Escaneamento"}
        </button>
      </div>

      <div id="reader" className="mx-auto mt-4 w-full max-w-md"></div>

      {ticketInfo && (
        <div className="mt-4 rounded-lg bg-green-100 p-4 shadow-md">
          <h2 className="mb-2 text-lg font-semibold text-green-700">
            Informações do Ticket
          </h2>
          <p className="text-sm text-gray-800">
            Número do Ticket: {ticketInfo.numeroTicket}
          </p>
          <p className="text-sm text-gray-800">
            Motorista: {ticketInfo.motorista}
          </p>
          <p className="text-sm text-gray-800">
            Tipo de Refeição: {ticketInfo.tipoRefeicao}
          </p>
        </div>
      )}
    </div>
  );
};

export default LerQrCode;
