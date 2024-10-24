import { Card } from './card';
import { CheckCircle, FileText, CreditCard, ClipboardCheck, QrCode, } from 'lucide-react'; // Ícones de react-icons

// Dados das categorias, links e cores
const cardsData = [
  {
    category: 'Estabelecimento',
    links: [
      {
        title: 'Ler Ticket',
        url: '/estabelecimento/verificar-ticket/qrcode',
        icon: <QrCode className="w-6 h-6" />,
        color: '#1E3A8A', // Azul Escuro
      },
      {
        title: 'Verificar Manualmente',
        url: '/estabelecimento/verificar-ticket/manual',
        icon: <CheckCircle className="w-6 h-6" />,
        color: '#ffffff', // Branco Azulado
      },
      {
        title: 'Aprovar Ticket',
        url: '/estabelecimento/aprovar-ticket',
        icon: <CheckCircle className="w-6 h-6" />,
        color: '#F43F5E', // Vermelho
      },
      {
        title: 'Relatórios',
        url: '/estabelecimento/relatorios',
        icon: <FileText className="w-6 h-6" />,
        color: '#F43F5E', // Vermelho
      },
      {
        title: 'Faturamento',
        url: '/estabelecimento/faturamento',
        icon: <CreditCard className="w-6 h-6" />,
        color: '#F43F5E', // Vermelho
      },
      {
        title: 'Enviar Notas',
        url: '/estabelecimento/enviar-notas',
        icon: <ClipboardCheck className="w-6 h-6" />,
        color: '#F43F5E', // Vermelho
      },
    ],
  }
  
];

const CardList = () => {
    return (
      <div className="p-4">
        {cardsData.map((categoryData) => (
          <div key={categoryData.category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{categoryData.category}</h2>
            <div className="grid grid-cols-2 gap-4">
              {categoryData.links.map((link, index) => (
                <Card
                  key={index}
                  title={link.title}
                  url={link.url}
                  icon={link.icon}
                  color={link.color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

export default CardList;
