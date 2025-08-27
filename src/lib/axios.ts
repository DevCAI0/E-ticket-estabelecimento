import axios from "axios";
import { encryptData, decryptData } from "./crypto";
import { showErrorToast } from "@/components/ui/sonner";
import { User } from "@/types/user";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

export const apiImage = axios.create({
  baseURL: import.meta.env.VITE_STORAGE_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "image/*",
    "ngrok-skip-browser-warning": "true",
  },
  responseType: "blob",
});

export const storeEncryptedToken = (token: string) => {
  const encryptedToken = encryptData(token);
  localStorage.setItem("encryptedToken", encryptedToken);
};

export const clearEncryptedToken = () => {
  localStorage.removeItem("encryptedToken");
  localStorage.removeItem("encryptedUser");
};

export const storeUserData = (userData: User) => {
  try {
    const encryptedUser = encryptData(userData);
    localStorage.setItem("encryptedUser", encryptedUser);
  } catch (_error) {
    showErrorToast("Erro ao salvar dados do usuário");
  }
};

export const getUserData = (): User | null => {
  try {
    const encryptedUser = localStorage.getItem("encryptedUser");
    if (encryptedUser) {
      const userData = decryptData(encryptedUser);
      return userData;
    }
    return null;
  } catch (_error) {
    showErrorToast("Erro ao obter dados do usuário");
    return null;
  }
};

const getEmpresaId = (): string | null => {
  try {
    const userData = getUserData();
    if (userData?.id_empresa) {
      return userData.id_empresa.toString();
    }
    return null;
  } catch (_error) {
    showErrorToast("Erro ao obter empresa do usuário");
    return null;
  }
};

const setupInterceptors = (axiosInstance: typeof api | typeof apiImage) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const encryptedToken = localStorage.getItem("encryptedToken");
      if (encryptedToken) {
        const token = decryptData(encryptedToken);
        config.headers.Authorization = `Bearer ${token}`;
      }

      const empresaId = getEmpresaId();
      if (empresaId) {
        config.headers["X-Current-Company"] = empresaId;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearEncryptedToken();
        window.location.href = "/auth/login";
      }

      return Promise.reject(error);
    },
  );
};

setupInterceptors(api);
setupInterceptors(apiImage);
