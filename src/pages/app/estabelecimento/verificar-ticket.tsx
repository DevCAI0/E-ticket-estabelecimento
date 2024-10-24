import { Card } from '@/components/cards/card'; // Certifique-se de que o caminho esteja correto
import { QrCode, User } from 'lucide-react'; // Usando ícones do react-icons como exemplo

export const VerificarTicket = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Verificar Ticket</h1>
      <div className="grid grid-cols-2 gap-4">
        {/* Card para leitura de QR Code */}
        <Card
          title="Ler QR Code"
          url="/estabelecimento/verificar-ticket/qrcode"
          icon={<QrCode className="w-6 h-6" />}
          color="#0EA5E9" // Azul
        />

        {/* Card para verificação manual */}
        <Card
          title="Verificar Manualmente"
          url="/estabelecimento/verificar-ticket/manual"
          icon={<User className="w-6 h-6" />}
          color="#F59E0B" // Amarelo
        />
      </div>
    </div>
  );
};
