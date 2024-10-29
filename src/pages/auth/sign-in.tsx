import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { showErrorToast, showSuccessToast } from '@/components/ui/sonner';

export const SignIn = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login(email, password);

    if (result?.success && result.user) { // Verifica se 'result.user' existe
      // Armazena o token no localStorage
      localStorage.setItem('token', result.token || '');
      // Exibe mensagem de sucesso
      showSuccessToast(`Bem-vindo, ${result.user.name}!`);
      // Redireciona para a página inicial
      navigate('/', { replace: true });
    } else {
      // Exibe mensagem de erro
      showErrorToast(result?.message || 'Falha na autenticação.');
    }
  };

  return (
    <div className="flex justify-center flex-col items-center min-h-screen">
      <Logo />
      <div className="grid gap-6 w-full max-w-md p-4">
        <form onSubmit={handleLogin} className="w-full">
          <div className="grid gap-4">
            <EmailInput value={email} onChange={setEmail} />
            <PasswordInput value={password} onChange={setPassword} />
            <Button type="submit" className="w-full bg-[#172554] text-white hover:bg-[#0f1e40]">
              Acessar painel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
