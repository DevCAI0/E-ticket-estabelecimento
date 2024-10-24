import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./pages/_layouts/app";
import { Home } from "./pages/app/dashboard/home";
import { AuthLayout } from "./pages/_layouts/auth";

// Importação das novas páginas
import { AprovarTicket } from "./pages/app/estabelecimento/aprovar-ticket"; 
import { TicketsAprovados } from "./pages/app/estabelecimento/tickets-aprovados"; 
import { EnviarNotas } from "./pages/app/estabelecimento/enviar-notas"; 
import { RelatoriosEstabelecimento } from "./pages/app/estabelecimento/relatorios";
import { FaturamentoEstabelecimento } from "./pages/app/estabelecimento/faturamento";
import { VerificarTicket } from "./pages/app/estabelecimento/verificar-ticket";
import { LerQrCode } from "./pages/app/estabelecimento/ler-qrcode";
import { VerificarManual } from "./pages/app/estabelecimento/verificar-manual";

// Definição do roteador
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />, // Layout principal
    children: [
      { path: '/', element: <Home /> },
      { path: '/estabelecimento/aprovar-ticket', element: <AprovarTicket /> },
      { path: '/estabelecimento/relatorios', element: <RelatoriosEstabelecimento /> },
      { path: '/estabelecimento/verificar-ticket', element: <VerificarTicket /> },
      { path: '/estabelecimento/verificar-ticket/qrcode', element: <LerQrCode /> },
      { path: '/estabelecimento/verificar-ticket/manual', element: <VerificarManual /> },
      { path: '/estabelecimento/tickets-aprovados', element: <TicketsAprovados /> },
      { path: '/estabelecimento/faturamento', element: <FaturamentoEstabelecimento /> },
      { path: '/estabelecimento/enviar-notas', element: <EnviarNotas /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: '/auth/login', element: <div>Login Page</div> },
    ],
  },
]);
