import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '@/components/header/header';

// Função de verificação de autenticação
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  // Verifica se o token existe e não está vazio
  return token && token.trim().length > 0;
};

export const AppLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = () => {
      // Verifica se o usuário está autenticado
      if (!isAuthenticated()) {
        // Se não estiver autenticado, redireciona para a página de login
        navigate('/auth/login', { replace: true });
      }
    };

    // Executa a verificação de autenticação ao montar o componente
    checkAuthentication();

    // Adiciona um evento de verificação de token ao remover do localStorage
    const handleStorageChange = () => {
      if (!isAuthenticated()) {
        navigate('/auth/login', { replace: true });
      }
    };

    // Ouvinte para mudanças no localStorage, incluindo remoção do token
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden bg-gray-200">
      {/* Conteúdo principal */}
      <div className="flex-1 w-full p-4 overflow-auto mb-16">
        <Outlet />
      </div>

      {/* Barra de navegação inferior para Mobile */}
      <div className="fixed bottom-0 w-full">
        <Header />
      </div>
    </div>
  );
};

export default AppLayout;
