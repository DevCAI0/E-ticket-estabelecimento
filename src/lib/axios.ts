import axios from "axios";
import { encryptData, decryptData } from "./crypto";

// Cliente para chamadas de API
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

// Cliente para arquivos estáticos/imagens
export const apiImage = axios.create({
  baseURL: import.meta.env.VITE_STORAGE_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "image/*",
    "ngrok-skip-browser-warning": "true",
  },
  responseType: "blob",
});

// Função para armazenar o token
export const storeEncryptedToken = (token: string) => {
  const encryptedToken = encryptData(token);
  localStorage.setItem("encryptedToken", encryptedToken);
};

// Função para limpar o token
export const clearEncryptedToken = () => {
  localStorage.removeItem("encryptedToken");
};

// Função para configurar interceptors
const setupInterceptors = (axiosInstance: typeof api | typeof apiImage) => {
  // Interceptor para adicionar o token em todas as requisições
  axiosInstance.interceptors.request.use(
    (config) => {
      const encryptedToken = localStorage.getItem("encryptedToken");

      if (encryptedToken) {
        const token = decryptData(encryptedToken);
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // // Interceptor para tratar respostas e erros
  // axiosInstance.interceptors.response.use(
  //   (response) => response,
  //   (error) => {
  //     // Trata erro 401 (não autorizado)
  //     if (error.response?.status === 401) {
  //       localStorage.removeItem("encryptedToken");
  //       localStorage.removeItem("encryptedUser");
  //       window.location.href = "/auth/login";
  //     }

  //     // // Trata erro 403 (sem permissão)
  //     // if (error.response?.status === 403) {
  //     //   window.location.href = '/access-denied';
  //     // }

  //     return Promise.reject(error);
  //   },
  // );
};

// Configura os interceptors para ambas as instâncias
setupInterceptors(api);
setupInterceptors(apiImage);
