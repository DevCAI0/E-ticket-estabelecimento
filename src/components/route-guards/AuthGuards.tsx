import { ReactNode, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

interface GuardProps {
  children: ReactNode;
}

/**
 * AuthGuard: Protege rotas que requerem autenticação
 * Redireciona para a página de login se não autenticado
 */
export const AuthGuard = ({ children }: GuardProps) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificação de autenticação apenas no primeiro carregamento
    if (!loading && !isAuthenticated()) {
      navigate("/auth/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Durante o carregamento, exibe um spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se estiver autenticado, renderiza o conteúdo
  return isAuthenticated() ? <>{children}</> : null;
};

/**
 * GuestGuard: Protege rotas que só devem ser acessadas por visitantes
 * Redireciona para a página inicial se já estiver autenticado
 */
export const GuestGuard = ({ children }: GuardProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Durante o carregamento, exibe um spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado, renderiza o conteúdo
  // Caso contrário, redireciona para a página inicial
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
};
