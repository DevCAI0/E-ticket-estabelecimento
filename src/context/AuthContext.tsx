// src/contexts/auth-context.tsx
import { createContext } from "react";
import { AuthContextData } from "../types/auth";

const signOut = () => {
  // Limpa os dados de autenticação
  localStorage.removeItem("auth.token");
  localStorage.removeItem("auth.user");
  // Limpa os tickets pendentes
  localStorage.removeItem("pendingTickets");
};

export const AuthContext = createContext<AuthContextData>({
  isAuthenticated: false,
  user: null,
  signIn: async () => {},
  signOut: () => signOut(),
  isLoading: false,
} as AuthContextData);
