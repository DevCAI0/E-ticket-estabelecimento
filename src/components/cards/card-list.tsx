import { Card } from './card';
import { PlusCircle, CheckCircle, FileText, CreditCard, ClipboardCheck, } from 'lucide-react'; // Ícones de react-icons

// Dados das categorias, links e cores
const cardsData = [
  {
    category: 'Estabelecimento',
    color: '#F43F5E', // Rosa
    links: [
      { title: 'Verificar Ticket', url: '/estabelecimento/verificar-ticket', icon: <PlusCircle className="w-6 h-6" /> },
      { title: 'Aprovar Ticket', url: '/estabelecimento/aprovar-ticket', icon: <CheckCircle className="w-6 h-6" /> },
      { title: 'Tickets Aprovados', url: '/estabelecimento/tickets-aprovados', icon: <CheckCircle className="w-6 h-6" /> },
      { title: 'Relatórios', url: '/estabelecimento/relatorios', icon: <FileText className="w-6 h-6" /> },
      { title: 'Faturamento', url: '/estabelecimento/faturamento', icon: <CreditCard className="w-6 h-6" /> },
      { title: 'Enviar Notas', url: '/estabelecimento/enviar-notas', icon: <ClipboardCheck className="w-6 h-6" /> },
    ],
  },
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
                  color={categoryData.color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

export default CardList;
