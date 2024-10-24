import { useState, useEffect } from 'react';
import { TicketAprovado } from '@/api/ticket-aprovado';
import FacialRecognition from '../../../components/CameraRecognition';

// Componente de Aprovar Ticket
export const AprovarTicket = () => {
  const [tickets, setTickets] = useState<TicketAprovado[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketAprovado | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Busca os tickets aprovados no Local Storage
    const storedTickets = localStorage.getItem('approvedTickets');
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    }
  }, []);

  // Função para iniciar a verificação facial
  const handleApproveTicket = (ticket: TicketAprovado) => {
    setSelectedTicket(ticket);
    setIsVerifying(true);
  };

  // Função para lidar com o fechamento da verificação facial
  const handleVerificationClose = (isApproved: boolean) => {
    setIsVerifying(false);
    if (isApproved) {
      // Lógica para aprovação do ticket
      alert(`Ticket ${selectedTicket?.numeroTicket} aprovado!`);
    } else {
      alert('Verificação negada.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Aprovar Tickets</h2>

      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.numeroTicket}
              className="bg-white p-4 shadow-md rounded-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">{ticket.motorista}</h3>
                <p className="text-sm text-gray-600 mb-2">Número do Ticket: {ticket.numeroTicket}</p>
              </div>
              <button
                onClick={() => handleApproveTicket(ticket)}
                className="mt-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Aprovar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">Nenhum ticket para aprovar.</p>
      )}

      {/* Componente de verificação facial */}
      {isVerifying && (
        <FacialRecognition onClose={() => handleVerificationClose(true)} />
      )}
    </div>
  );
};

export default AprovarTicket;
