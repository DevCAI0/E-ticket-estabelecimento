import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  User, 
  RefreshCw, 
  Camera, 
  Database
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";
import { useState } from "react";


export const Ajustes = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const formatCPF = (cpf: string) => {
    const cpfClean = cpf.replace(/\D/g, '');
    return cpfClean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleUpdateApp = async () => {
    try {
      setIsUpdating(true);
      
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        showSuccessToast('Aplicativo atualizado com sucesso!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Service Worker não suportado');
      }
    } catch (error) {
      showErrorToast('Erro ao atualizar aplicativo');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setIsClearing(true);
      
      // Limpar caches
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }

      // Limpar localStorage (exceto dados de autenticação)
      const authToken = localStorage.getItem('encryptedToken');
      const authUser = localStorage.getItem('encryptedUser');
      localStorage.clear();
      if (authToken) localStorage.setItem('encryptedToken', authToken);
      if (authUser) localStorage.setItem('encryptedUser', authUser);

      showSuccessToast('Cache limpo com sucesso!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      showErrorToast('Erro ao limpar cache');
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      showSuccessToast('Permissão da câmera concedida');
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast(
          error.name === 'NotAllowedError' 
            ? 'Permissão da câmera negada' 
            : 'Erro ao acessar câmera'
        );
      }
      console.error('Erro câmera:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Ajustes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seção do Perfil */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user?.nome}</h2>
                <p className="text-sm text-muted-foreground">
                  CPF: {user?.cpf ? formatCPF(user.cpf) : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  Matrícula: {user?.matricula}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sistema e Atualizações */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Sistema</h3>
            
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto py-3 px-3"
                onClick={handleUpdateApp}
                disabled={isUpdating}
              >
                <RefreshCw className={`mr-2 h-4 w-4 shrink-0 text-muted-foreground ${isUpdating ? 'animate-spin' : ''}`} />
                <div className="text-left">
                  <div className="font-medium text-sm">Verificar Atualizações</div>
                  <div className="text-xs text-muted-foreground">
                    Buscar por novas versões do aplicativo
                  </div>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto py-3 px-3"
                onClick={handleClearCache}
                disabled={isClearing}
              >
                <Database className={`mr-2 h-4 w-4 shrink-0 text-muted-foreground ${isClearing ? 'animate-pulse' : ''}`} />
                <div className="text-left">
                  <div className="font-medium text-sm">Limpar Cache</div>
                  <div className="text-xs text-muted-foreground">
                    Limpar dados temporários do aplicativo
                  </div>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto py-3 px-3"
                onClick={requestCameraPermission}
              >
                <Camera className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium text-sm">Permissões da Câmera</div>
                  <div className="text-xs text-muted-foreground">
                    Verificar e solicitar acesso à câmera
                  </div>
                </div>
              </Button>
            </div>
          </div>

          <Separator />
          {/* Botão de Logout */}
          <Button 
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/10"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ajustes;