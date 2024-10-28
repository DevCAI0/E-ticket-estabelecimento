import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipo de Ticket
interface Ticket {
  numeroTicket: string;
  motorista: string;
  data: string;
  status: 'aprovado' | 'Consumido'; // Status do ticket
}

export const TicketsAprovados = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [aprovados, setAprovados] = useState<Ticket[]>([]);
  const [consumidos, setConsumidos] = useState<Ticket[]>([]);

  useEffect(() => {
    const storedTickets = JSON.parse(localStorage.getItem('approvedTickets') || '[]');
    setTickets(storedTickets);

    const approved = storedTickets.filter((ticket: Ticket) => ticket.status === 'aprovado');
    const denied = storedTickets.filter((ticket: Ticket) => ticket.status === 'Consumido');

    setAprovados(approved);
    setConsumidos(denied);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Tabs defaultValue="todos" className="w-full h-full flex flex-col">
        <TabsList className="w-full flex bg-gray-200 rounded-t-lg">
          <TabsTrigger 
            value="todos" 
            className="flex-1 py-2 text-center hover:bg-blue-200 border border-gray-300 rounded-t-lg"
          >
            Todos
          </TabsTrigger>
          <TabsTrigger 
            value="aprovados" 
            className="flex-1 py-2 text-center hover:bg-green-200 border border-gray-300 rounded-t-lg"
          >
            Aprovados
          </TabsTrigger>
          <TabsTrigger 
            value="Consumidos" 
            className="flex-1 py-2 text-center hover:bg-red-200 border border-gray-300 rounded-t-lg"
          >
            Consumidos
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo para todos os tickets */}
        <TabsContent value="todos" className="flex-1 overflow-auto">
          {tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <Card key={index} className="mt-4 mx-4">
                <CardHeader>
                  <CardTitle>{ticket.numeroTicket}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Motorista: {ticket.motorista}</CardDescription>
                  <CardDescription>Data: {ticket.data}</CardDescription>
                  <CardDescription>
                    Status: {ticket.status === 'aprovado' ? 'Consumido' : 'Inválido'}
                  </CardDescription>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center mt-4">Nenhum ticket encontrado.</p>
          )}
        </TabsContent>

        {/* Conteúdo para tickets aprovados */}
        <TabsContent value="aprovados" className="flex-1 overflow-auto">
          {aprovados.length > 0 ? (
            aprovados.map((ticket, index) => (
              <Card key={index} className="mt-4 mx-4">
                <CardHeader>
                  <CardTitle>{ticket.numeroTicket}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Motorista: {ticket.motorista}</CardDescription>
                  <CardDescription>Data: {ticket.data}</CardDescription>
                  <CardDescription>Status: Consumido</CardDescription>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center mt-4">Nenhum ticket aprovado.</p>
          )}
        </TabsContent>

        {/* Conteúdo para tickets consumidos */}
        <TabsContent value="consumidos" className="flex-1 overflow-auto">
          {consumidos.length > 0 ? (
            consumidos.map((ticket, index) => (
              <Card key={index} className="mt-4 mx-4">
                <CardHeader>
                  <CardTitle>{ticket.numeroTicket}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Motorista: {ticket.motorista}</CardDescription>
                  <CardDescription>Data: {ticket.data}</CardDescription>
                  <CardDescription>Status: Inválido</CardDescription>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center mt-4">Nenhum ticket negado.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketsAprovados;
