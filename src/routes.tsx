// router.tsx - Com restrições corretas baseadas no perfil do usuário
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./pages/_layouts/app";
import { AuthLayout } from "./pages/_layouts/auth";
import Home from "./pages/app/dashboard/dashboard";
import { TicketsPage } from "./pages/app/tickets/TicketsPage";
import SignIn from "./pages/auth/sign-in";
import { AuthGuard, GuestGuard } from "./components/route-guards/AuthGuards";
import { ProfileGuard } from "./components/route-guards/ProfileGuard";
import { Ajustes } from "./pages/app/ajustes";
import { PaginaLeituraTickets } from "./pages/app/tickets/leitura-tickets";
import AprovarTickets from "./pages/app/tickets/aprovar-tickets";
import VerificacaoManualPage from "./pages/app/tickets/verificacao-manual";
import NotFound from "./pages/app/404";
import { NotasPage } from "./pages/app/notas/NotasPage";
import { PedidosPage } from "./pages/app/pedidos/PedidosPage";

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
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/dashboard",
        element: (
          <ProfileGuard blockProfiles={[1]}>
            <Home />
          </ProfileGuard>
        ),
      },
      {
        path: "/tickets",
        element: (
          <ProfileGuard blockProfiles={[1]}>
            <TicketsPage />
          </ProfileGuard>
        ),
      },
      {
        path: "/notas",
        element: (
          <ProfileGuard allowedProfiles={[3]}>
            <NotasPage />
          </ProfileGuard>
        ),
      },
      {
        path: "/read-tickets",
        element: (
          <ProfileGuard blockProfiles={[1]}>
            <PaginaLeituraTickets />
          </ProfileGuard>
        ),
      },
      {
        path: "/manual-check",
        element: (
          <ProfileGuard blockProfiles={[1]}>
            <VerificacaoManualPage />
          </ProfileGuard>
        ),
      },
      {
        path: "/approve-tickets",
        element: (
          <ProfileGuard blockProfiles={[1]}>
            <AprovarTickets />
          </ProfileGuard>
        ),
      },
      {
        path: "/pedidos",
        element: <PedidosPage />,
      },
      {
        path: "/settings",
        element: <Ajustes />,
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
