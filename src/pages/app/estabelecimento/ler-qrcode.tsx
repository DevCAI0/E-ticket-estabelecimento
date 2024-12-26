import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import AprovarTicket from "./aprovar-ticket";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";
import BackButton from "@/components/BackButton";

export const LerQrCode = () => {
  const [ticketInfo, setTicketInfo] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isTicketApproved, setIsTicketApproved] = useState<boolean>(false);
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
        <BackButton />
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
          <p className="text-sm text-gray-800">Data: {ticketInfo.data}</p>
          {isTicketApproved && <AprovarTicket />}
        </div>
      )}
    </div>
  );
};

export default LerQrCode;
