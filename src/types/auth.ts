// src/types/auth.ts
export interface User {
  id: number;
  nome: string;
  login: string;
  email: string | null;
  id_estabelecimento: number;
  id_restaurante: number | null;
  id_perfil: number;
  id_empresa: number;
  alterou_senha: number;
  status: number;
  id_cadastro: number;
  data_cadastro: string;
  id_alteracao: number;
  data_alteracao: string;
  permissions: Permissions;
  perfil_descricao: string;
}

export interface Permissions {
  v_ticket?: string;
  c_ticket?: string;
  v_estabelecimento?: string;
  v_restaurante_ticket?: string;
  aceitar_pedido?: string;
  [key: string]: string | undefined;
}

export interface AuthCredentials {
  identifier: string;
  senha: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  permissions: Permissions;
  token: string;
}

export interface AuthError {
  error?: string;
  message?: string;
  status?: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}
export interface SignInCredentials {
  cpf: string;
  matricula: string;
}
export interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
}
