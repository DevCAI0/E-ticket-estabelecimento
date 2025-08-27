import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  api,
  storeEncryptedToken,
  clearEncryptedToken,
  storeUserData,
} from "@/lib/axios";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";
import { decryptData } from "@/lib/crypto";
import { User, AuthCredentials } from "@/types/user";
// ✅ Importar AuthResult de @/types/auth ao invés de @/api/auth/auth
import { AuthResult } from "@/types/auth";
import { login, logout as apiLogout, obterUsuarioAtual } from "@/api/auth/auth";
import { servicoReconhecimentoFacial } from "@/services/servico-reconhecimento-facial";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = useCallback(() => {
    try {
      const encryptedToken = localStorage.getItem("encryptedToken");
      if (!encryptedToken) return false;

      const decryptedToken = decryptData(encryptedToken);
      return Boolean(
        decryptedToken &&
          typeof decryptedToken === "string" &&
          decryptedToken.trim().length > 0,
      );
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiLogout(token);
    } catch {
      // Silent fail
    } finally {
      setUser(null);
      setToken(null);
      clearEncryptedToken();
      delete api.defaults.headers.common["Authorization"];

      showSuccessToast("Logout realizado com sucesso");
      navigate("/auth/login", { replace: true });
    }
  }, [token, navigate]);

  const loadStoredUserData = useCallback(async () => {
    setLoading(true);

    try {
      if (!isAuthenticated()) {
        setLoading(false);
        return false;
      }

      const encryptedUser = localStorage.getItem("encryptedUser");
      const encryptedToken = localStorage.getItem("encryptedToken");

      if (!encryptedUser || !encryptedToken) {
        setLoading(false);
        return false;
      }

      const decryptedToken = decryptData(encryptedToken);
      const decryptedUser = decryptData(encryptedUser) as User;

      if (!decryptedToken || !decryptedUser) {
        setLoading(false);
        return false;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${decryptedToken}`;

      setUser(decryptedUser);
      setToken(decryptedToken);

      try {
        const usuarioAtual = await obterUsuarioAtual();

        if (usuarioAtual) {
          const updatedUser: User = {
            ...decryptedUser,
            ...usuarioAtual,
          };

          setUser(updatedUser);

          // ✅ Corrigir conversão de tipos - usar null ao invés de undefined
          const userForStorage: User = {
            ...updatedUser,
            id_estabelecimento: updatedUser.id_estabelecimento ?? null,
            id_restaurante: updatedUser.id_restaurante ?? null,
            id_perfil: updatedUser.id_perfil,
            id_empresa: updatedUser.id_empresa,
          };
          storeUserData(userForStorage);
        }
      } catch {
        // Silent fail
      }

      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadStoredUserData();
  }, [loadStoredUserData]);

  const signIn = async (credentials: AuthCredentials): Promise<AuthResult> => {
    setLoading(true);

    try {
      const result = await login(credentials);

      if (result.success && result.user && result.token) {
        storeEncryptedToken(result.token);

        // ✅ Corrigir conversão de tipos - usar null ao invés de undefined
        const userForStorage: User = {
          ...result.user,
          id_estabelecimento: result.user.id_estabelecimento ?? null,
          id_restaurante: result.user.id_restaurante ?? null,
          id_perfil: result.user.id_perfil,
          id_empresa: result.user.id_empresa,
        };
        storeUserData(userForStorage);

        setUser(result.user);
        setToken(result.token);

        api.defaults.headers.common["Authorization"] = `Bearer ${result.token}`;

        servicoReconhecimentoFacial.inicializar().catch(() => {
          // Silent fail
        });

        showSuccessToast(`Bem-vindo, ${result.user.nome}!`);
      } else {
        showErrorToast(result.message || "Erro durante o login");
      }

      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error instanceof Error ? error.message : "Erro durante o login";
      showErrorToast(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  return {
    user,
    token,
    loading,
    signIn,
    logout,
    isAuthenticated,
  };
};

export default useAuth;
