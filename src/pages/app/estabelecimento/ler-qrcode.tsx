import { Button } from '@/components/ui/button';
import { Html5Qrcode } from 'html5-qrcode';
import { useState } from 'react';

export const LerQrCode = () => {
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  let qrCodeScanner: Html5Qrcode | null = null;

  // Inicia o escaneamento
  const startScanning = () => {
    if (!isScanning) {
      qrCodeScanner = new Html5Qrcode('reader');
      qrCodeScanner.start(
        { facingMode: 'environment' }, // Usa a câmera traseira
        { fps: 60, qrbox: 250 },
        (decodedText) => {
          setDecodedText(decodedText); // Atualiza o estado com o texto decodificado
          qrCodeScanner?.stop(); // Para o escaneamento após a leitura bem-sucedida
          setIsScanning(false);
        },
        (error) => {
          console.warn(`Erro de leitura: ${error}`);
        }
      ).then(() => setIsScanning(true))
        .catch((error) => console.error('Erro ao iniciar o escaneamento:', error));
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">Leitor de QR Code</h1>

      {/* Botão para iniciar o escaneamento */}
      {!isScanning && (
        <div className="flex justify-center mb-4">
          <Button
            onClick={startScanning}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Start Scanning
          </Button>
        </div>
      )}

      {/* Área do scanner */}
      <div id="reader" className="w-full max-w-md mx-auto mt-4" />

      {/* Exibe o conteúdo decodificado em um card */}
      {decodedText ? (
        <div className="bg-green-100 p-4 rounded-lg shadow-md mt-4">
          <h2 className="text-lg font-semibold text-green-700 mb-2">
            Ticket Valido 
          </h2>
          <p className="text-sm text-gray-800">{decodedText}</p>
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-4">
          Posicione o QR Code na frente da câmera.
        </p>
      )}
    </div>
  );
};
