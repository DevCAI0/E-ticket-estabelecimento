import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./pages/_layouts/app";
import { AuthLayout } from "./pages/_layouts/auth";
import Home from "./pages/app/dashboard/dashboard";
// import TicketsPage from "./pages/app/tickets";
import SignIn from "./pages/auth/sign-in";
import { AuthGuard, GuestGuard } from "./components/route-guards/AuthGuards";
import { Ajustes } from "./pages/app/ajustes";
import { PaginaLeituraTickets } from "./pages/app/tickets/leitura-tickets";
import AprovarTickets from "./pages/app/tickets/aprovar-tickets";
import VerificacaoManualPage from "./pages/app/tickets/verificacao-manual";
import NotFound from "./pages/app/404";

// Definição do roteador
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <Home /> },
      // {
      //   path: "/tickets",
      //   element: <TicketsPage />,
      // },
      {
        path: "/settings",
        element: <Ajustes />,
      },
      {
        path: "/read-tickets",
        element: <PaginaLeituraTickets />,
      },
      {
        path: "/manual-check",
        element: <VerificacaoManualPage />,
      },
      {
        path: "/approve-tickets",
        element: <AprovarTickets />,
      },
    ],
  },
  {
    path: "/auth",
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [{ path: "/auth/login", element: <SignIn /> }],
  },
]);
