import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import AprovarTicket from './aprovar-ticket'; // Importando o componente

export const LerQrCode = () => {
  const [ticketInfo, setTicketInfo] = useState<any | null>(null);
  const [isTicketApproved, setIsTicketApproved] = useState<boolean>(false); // Novo estado para controlar a aprovação

  useEffect(() => {
    const storedData = localStorage.getItem('ticketInfo');
    if (storedData) {
      setTicketInfo(JSON.parse(storedData));
    }
  }, []);

  const startScanning = () => {
    const qrCodeScanner = new Html5Qrcode('reader');
    qrCodeScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (text) => {
        try {
          console.log(`Texto do QR Code: ${text}`);

          const info = JSON.parse(text);
          console.log('Informações do ticket:', info);

          setTicketInfo(info);

          // Lógica para verificar se o ticket é aprovado
          if (info.numeroTicket && info.motorista) { // Ajustar a lógica de aprovação conforme necessário
            setIsTicketApproved(true);
          } else {
            setIsTicketApproved(false);
          }

          const approvedTickets = JSON.parse(localStorage.getItem('approvedTickets') || '[]');
          approvedTickets.push(info);
          localStorage.setItem('approvedTickets', JSON.stringify(approvedTickets));

          qrCodeScanner.stop();
        } catch (error) {
          console.error('Erro ao processar QR Code:', error);
        }
      },
      (error) => {
        console.warn(`Erro de leitura: ${error}`);
      }
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Leitor de QR Code</h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={startScanning}
          className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Iniciar Escaneamento
        </button>
      </div>

      <div id="reader" className="w-full max-w-md mx-auto mt-4"></div>

      {ticketInfo ? (
        <div className="bg-green-100 p-4 rounded-lg shadow-md mt-4">
          <h2 className="text-lg font-semibold text-green-700 mb-2">Informações do Ticket</h2>
          <p className="text-sm text-gray-800">Número do Ticket: {ticketInfo.numeroTicket}</p>
          <p className="text-sm text-gray-800">Motorista: {ticketInfo.motorista}</p>
          <p className="text-sm text-gray-800">Tipo de Refeição: {ticketInfo.tipoRefeicao}</p>
          <p className="text-sm text-gray-800">Data: {ticketInfo.data}</p>

          {/* Exibir o componente AprovarTicket apenas se o ticket for aprovado */}
          {isTicketApproved && <AprovarTicket />}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-4">Posicione o QR Code na frente da câmera.</p>
      )}
    </div>
  );
};

export default LerQrCode;
