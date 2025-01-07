import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, storeEncryptedToken, clearEncryptedToken } from "@/lib/axios";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";
import { decryptData, encryptData } from "@/lib/crypto";
import { User, AuthCredentials, LoginResponse } from "@/types/user";
import { AxiosError } from "axios";

interface AuthError {
  error?: string;
  message?: string;
  status?: number;
}

interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (credentials: AuthCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const encryptedUser = localStorage.getItem("encryptedUser");
      const encryptedToken = localStorage.getItem("encryptedToken");

      if (encryptedUser && encryptedToken) {
        try {
          const decryptedUser = JSON.parse(decryptData(encryptedUser)) as User;
          const decryptedToken = decryptData(encryptedToken);

          if (decryptedUser && decryptedToken) {
            setUser(decryptedUser);
            setToken(decryptedToken);
            api.defaults.headers.common["Authorization"] =
              `Bearer ${decryptedToken}`;
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          localStorage.removeItem("encryptedUser");
          localStorage.removeItem("encryptedToken");
        }
      }
    };

    loadUserData();
  }, []);

  const signIn = async (credentials: AuthCredentials): Promise<AuthResult> => {
    try {
      const { data: loginData } = await api.post<LoginResponse>("/auth/login", {
        type: "tickets_usuarios",
        identifier: credentials.identifier,
        senha: credentials.senha,
      });

      const userData: User = {
        ...loginData.user,
        permissions: loginData.permissions,
      };

      storeEncryptedToken(loginData.token);
      localStorage.setItem(
        "encryptedUser",
        encryptData(JSON.stringify(userData)),
      );

      setUser(userData);
      setToken(loginData.token);

      api.defaults.headers.common["Authorization"] =
        `Bearer ${loginData.token}`;

      showSuccessToast(`Bem-vindo, ${userData.nome}!`);
      return { success: true, user: userData, token: loginData.token };
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      console.error("Erro login:", axiosError);

      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Login ou senha inválidos";

      showErrorToast(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await api.post("/auth/logout");
      }
      showSuccessToast("Logout realizado com sucesso");
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Erro ao realizar logout:", axiosError);
    } finally {
      setUser(null);
      setToken(null);
      clearEncryptedToken();
      localStorage.removeItem("encryptedUser");
      delete api.defaults.headers.common["Authorization"];
      navigate("/auth/login", { replace: true });
    }
  };

  return {
    user,
    token,
    signIn,
    logout,
  };
};

export default useAuth;
