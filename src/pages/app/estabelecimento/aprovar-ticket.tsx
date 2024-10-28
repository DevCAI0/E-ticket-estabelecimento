import { useState, useEffect } from 'react';
import { TicketAprovado } from '@/api/ticket-aprovado';
import FacialRecognition from '../../../components/CameraRecognition';
import { showErrorToast, showSuccessToast } from '@/components/ui/sonner';

export const AprovarTicket = () => {
  const [tickets, setTickets] = useState<TicketAprovado[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketAprovado | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const storedTickets = localStorage.getItem('approvedTickets');
    if (storedTickets) setTickets(JSON.parse(storedTickets));
  }, []);

  const handleApproveTicket = (ticket: TicketAprovado) => {
    setSelectedTicket(ticket);
    setIsVerifying(true);
  };

  const handleVerificationClose = (isApproved: boolean) => {
    setIsVerifying(false);
    if (isApproved) {
      showSuccessToast(`Ticket ${selectedTicket?.numeroTicket} aprovado!`);
    } else {
      showErrorToast('Verificação negada.');
    }
  };

  const handleDeleteTicket = (ticketToDelete: TicketAprovado) => {
    const updatedTickets = tickets.filter((ticket) => ticket.numeroTicket !== ticketToDelete.numeroTicket);
    setTickets(updatedTickets);
    localStorage.setItem('approvedTickets', JSON.stringify(updatedTickets));
    showSuccessToast(`Ticket ${ticketToDelete.numeroTicket} deletado!`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Aprovar Tickets</h2>
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <div key={ticket.numeroTicket} className="bg-white p-4 shadow-md rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{ticket.motorista}</h3>
                <p className="text-sm text-gray-600 mb-2">Número do Ticket: {ticket.numeroTicket}</p>
              </div>
              <div className="flex mt-4">
                <button
                  onClick={() => handleApproveTicket(ticket)}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition mr-2"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleDeleteTicket(ticket)}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">Nenhum ticket para aprovar.</p>
      )}
      {isVerifying && <FacialRecognition onClose={handleVerificationClose} />}
    </div>
  );
};

export default AprovarTicket;
