import { Navigate } from "react-router-dom";

// Função para verificar se o usuário está autenticado
const isAuthenticated = () => {
  const token = localStorage.getItem("encryptedToken");
  console.log("Verificando autenticação. Token presente:", !!token); // Log para depuração
  return token && token.trim().length > 0;
};

// Componente para proteger rotas que exigem autenticação
export const AuthGuard = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    console.log("Usuário não autenticado. Redirecionando para /auth/login.");
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

// Componente para proteger rotas acessíveis apenas para não autenticados
export const GuestGuard = ({ children }: { children: JSX.Element }) => {
  if (isAuthenticated()) {
    console.log("Usuário autenticado. Redirecionando para /.");
    return <Navigate to="/" replace />;
  }
  return children;
};
