import axios from 'axios';
import { User } from '@/types/user';

const API_URL = 'https://api.seuprojeto.com/auth'; // URL do backend de autenticação

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    if (response.data.success) {
      const user: User = response.data.user;
      const token: string = response.data.token;

      return { success: true, user, token };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao se conectar ao servidor.',
    };
  }
};
