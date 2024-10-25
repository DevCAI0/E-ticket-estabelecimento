import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const LerQrCode = () => {
  const [ticketInfo, setTicketInfo] = useState<any | null>(null);

  useEffect(() => {
    // Verifica se existem dados salvos no Local Storage ao carregar o componente
    const storedData = localStorage.getItem('ticketInfo');
    if (storedData) {
      setTicketInfo(JSON.parse(storedData));
    }
  }, []);

  const startScanning = () => {
    const qrCodeScanner = new Html5Qrcode('reader');
    qrCodeScanner.start(
      { facingMode: 'environment' }, // Câmera traseira
      { fps: 10, qrbox: 250 },
      (decodedText: string) => {
        try {
          console.log(`Texto do QR Code: ${decodedText}`);
          
          // Converte o texto do QR Code para JSON
          const info = JSON.parse(decodedText);
          console.log('Informações do ticket:', info);

          setTicketInfo(info);

          // Salva o ticket no Local Storage
          const approvedTickets = JSON.parse(localStorage.getItem('approvedTickets') || '[]');
          approvedTickets.push(info);
          localStorage.setItem('approvedTickets', JSON.stringify(approvedTickets));

          qrCodeScanner.stop(); // Para o scanner após leitura bem-sucedida
        } catch (error) {
          // Converte o error para string antes de exibir no alerta
          const errorMessage = (error instanceof Error) ? error.message : String(error);
          console.error('Erro ao processar QR Code:', errorMessage);
          alert(`Erro ao processar QR Code: ${errorMessage}`);
        }
      },
      (errorMessage: string) => {
        console.warn(`Erro de leitura: ${errorMessage}`);
        alert(`Erro de leitura: ${errorMessage}`);
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
        <div className="bg-green-100 p-6 rounded-lg shadow-md mt-4">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Informações do Ticket</h2>
          <p className="text-lg text-gray-800">Número do Ticket: {ticketInfo.numeroTicket}</p>
          <p className="text-lg text-gray-800">Motorista: {ticketInfo.motorista}</p>
          <p className="text-lg text-gray-800">Tipo de Refeição: {ticketInfo.tipoRefeicao}</p>
          <p className="text-lg text-gray-800">Data: {ticketInfo.data}</p>
          <button
            onClick={() => console.log('Consumir Ticket')} // Lógica para consumir o ticket
            className="mt-4 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Consumir Ticket
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-4">Posicione o QR Code na frente da câmera.</p>
      )}
    </div>
  );
};
