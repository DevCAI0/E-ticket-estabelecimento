// import { useState } from 'react';
// import { loginUser } from '@/services/authService';
// import { User } from '@/types/user';
// import { showErrorToast, showSuccessToast } from '@/components/ui/sonner';

// export const useAuth = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);

//   const login = async (email: string, password: string) => {
//     const response = await loginUser(email, password);

//     if (response.success) {
//       // Verificar se user e token não são undefined antes de definir o estado
//       if (response.user && response.token) {
//         setUser(response.user);
//         setToken(response.token);

//         // Salvar no localStorage para persistência
//         localStorage.setItem('user', JSON.stringify(response.user));
//         localStorage.setItem('token', response.token);

//         showSuccessToast(`Bem-vindo, ${response.user.nome}!`);
//       }
//     } else {
//       showErrorToast(response.message || 'Erro ao realizar o login.');
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     showSuccessToast('Logout realizado com sucesso.');
//   };

//   return { user, token, login, logout };
// };
import { useState } from 'react';
import mockData from '@/data/mockData.json';

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Busca o usuário no mockData
    const foundUser = mockData.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      setUser({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        token: foundUser.token,
      });
      localStorage.setItem('token', foundUser.token);
      return { success: true, user: foundUser, token: foundUser.token }; // Retorna sucesso
    } else {
      return { success: false, message: 'Credenciais inválidas.' }; // Retorna falha
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, login, logout };
};
