
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";

// Dados fictícios do usuário (para simulação)
const initialUserData = {
  nome: "Caio Pereira",
  email: "caio@foodpass.com",
};

export function Profile() {
  const [userData] = useState(initialUserData);
  const navigate = useNavigate();

  // Lógica para manipular logout
  const handleLogout = () => {
    try {
      // Remove o token do localStorage
      localStorage.removeItem("token");
      
      // Mostra um toast de sucesso
      showSuccessToast("Logout realizado com sucesso!");
      
      // Redireciona para a página de login
      navigate("/auth/login", { replace: true });
    } catch (error) {
      // Exibe um toast de erro
      showErrorToast("Erro ao realizar o logout.");
    }
  };

  return (
    <Card className="max-w-sm mx-auto p-4">
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
        <CardDescription>Gerencie as suas informações pessoais</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Nome</label>
          <Input
            type="text"
            value={userData.nome}
            readOnly
            className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">E-mail</label>
          <Input
            type="email"
            value={userData.email}
            readOnly
            className="w-full border border-gray-300 rounded-md p-2 bg-white focus:border-blue-500"
          />
        </div>
        <Button
          variant="destructive"
          className="w-full mt-4 flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}

export default Profile;
