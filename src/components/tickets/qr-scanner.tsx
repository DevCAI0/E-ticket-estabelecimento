import { useState } from "react";
import QrReader from "react-qr-scanner";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (result: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (data: { text: string } | null) => {
    if (data) {
      onScan(data.text);
      setIsScanning(false);
      showSuccessToast("QR Code lido com sucesso!");
    }
  };

  const handleError = (error: { message: string }) => {
    console.error(error.message);
    showErrorToast("Erro ao processar QR Code.");
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="mb-4 text-center text-lg font-semibold text-foreground">
        {isScanning
          ? "Posicione o QR Code na câmera"
          : "Clique para iniciar a leitura"}
      </h2>
      {isScanning && (
        <QrReader
          delay={300}
          style={{ width: "100%", maxWidth: 300 }}
          onError={handleError}
          onScan={handleScan}
        />
      )}
      <Button
        onClick={() => setIsScanning(!isScanning)}
        variant={isScanning ? "destructive" : "default"}
        className="mt-4 w-full max-w-[200px]"
      >
        {isScanning ? "Parar" : "Iniciar Escaneamento"}
      </Button>
    </div>
  );
}
