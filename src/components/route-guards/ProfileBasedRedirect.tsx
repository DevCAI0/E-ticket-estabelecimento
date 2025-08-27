// src/components/route-guards/ProfileBasedRedirect.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import Home from "@/pages/app/dashboard/dashboard";

export function ProfileBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Se é usuário de estabelecimento (id_perfil = 1), vai para pedidos
  if (user.id_perfil === 1) {
    return <Navigate to="/pedidos" replace />;
  }

  // Outros usuários vão para home/dashboard
  return <Home />;
}
