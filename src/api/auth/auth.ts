// src/api/auth/auth.ts - Atualização para usar tipos unificados
import {
  api,
  storeEncryptedToken,
  storeUserData,
  clearEncryptedToken,
} from "@/lib/axios";
import { AxiosError } from "axios";
import { User, AuthCredentials } from "@/types/user";
import { AuthError, AuthResponse, AuthResult } from "@/types/auth";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";

// ✅ Re-exportar AuthResult para compatibilidade
export type { AuthResult } from "@/types/auth";

export async function login(credentials: AuthCredentials): Promise<AuthResult> {
  try {
    const { data: response } = await api.post<AuthResponse>(
      "/auth/login/ticket",
      {
        login: credentials.identifier,
        senha: credentials.senha,
      },
    );

    if (!response.success) {
      throw new Error(response.message || "Login falhou");
    }

    const userData: User = {
      ...response.data!.usuario,
      permissions: response.data!.usuario?.permissions || {},
    };

    const authToken = response.data!.token;

    storeEncryptedToken(authToken);
    storeUserData(userData); // ✅ Agora funcionará corretamente

    showSuccessToast("Login realizado com sucesso!");

    return {
      success: true,
      user: userData,
      token: authToken,
    };
  } catch (error) {
    const axiosError = error as AxiosError<AuthError>;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      (error instanceof Error ? error.message : "Login ou senha inválidos");

    showErrorToast(errorMessage);

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function logout(token?: string | null): Promise<boolean> {
  try {
    if (token) {
      await api.post("/auth/logout");
    }

    clearEncryptedToken();
    showSuccessToast("Logout realizado com sucesso!");

    return true;
  } catch (_error) {
    // Mesmo se der erro na API, limpa o token local
    clearEncryptedToken();
    showSuccessToast("Logout realizado com sucesso!");

    return true;
  }
}

export async function obterUsuarioAtual(): Promise<User | null> {
  try {
    const { data } = await api.get("/usuario/atual");

    if (data && data.success && data.usuario) {
      const userData: User = {
        ...data.usuario,
        permissions: data.usuario?.permissions || {},
      };

      storeUserData(userData);
      return userData;
    }

    return null;
  } catch (error) {
    showErrorToast("Erro ao obter dados do usuário");
    throw error;
  }
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  return !!user.permissions[permission];
}

/**
 * Verifica se o token está próximo do vencimento
 */
export function isTokenExpiringSoon(
  user: User | null,
  minutesThreshold: number = 30,
): boolean {
  if (!user || !user.token_expira_em) {
    return false;
  }

  const expirationTime = new Date(user.token_expira_em).getTime();
  const currentTime = new Date().getTime();
  const timeDifference = expirationTime - currentTime;
  const minutesUntilExpiration = timeDifference / (1000 * 60);

  return (
    minutesUntilExpiration <= minutesThreshold && minutesUntilExpiration > 0
  );
}

/**
 * Verifica se o usuário é administrador
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;

  // Verifica por ID do perfil (assumindo que 1 é admin)
  if (user.id_perfil === 1) return true;

  // Verifica por descrição do perfil
  if (user.perfil_descricao?.toLowerCase().includes("admin")) return true;

  // Verifica por permissões específicas de admin
  return (
    hasPermission(user, "admin_all") ||
    hasPermission(user, "v_funcionario") ||
    hasPermission(user, "c_funcionario")
  );
}

/**
 * Obtém o nome do estabelecimento/restaurante do usuário
 */
export function getUserLocation(user: User | null): string {
  if (!user) return "";

  if (user.nome_estabelecimento) {
    return user.nome_estabelecimento;
  }

  if (user.nome_restaurante) {
    return user.nome_restaurante;
  }

  return "Não definido";
}

/**
 * Formata as informações do usuário para exibição
 */
export function formatUserInfo(user: User | null): {
  nome: string;
  perfil: string;
  local: string;
  email: string;
} {
  if (!user) {
    return {
      nome: "",
      perfil: "",
      local: "",
      email: "",
    };
  }

  return {
    nome: user.nome || "Não informado",
    perfil: user.perfil_descricao || "Não definido",
    local: getUserLocation(user),
    email: user.email || "Não informado",
  };
}
