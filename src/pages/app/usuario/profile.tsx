"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

// Dados fictícios do usuário (para simulação)
const initialUserData = {
  nome: "Caio Pereira",
  email: "caio@foodpass.com",
}

export function Profile() {
  const [userData,] = useState(initialUserData)

  // Lógica para manipular logout
  const handleLogout = () => {
    alert("Logout realizado com sucesso!")
    // Adicione aqui a lógica de logout real, como redirecionamento ou limpeza de tokens
  }

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
            className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">E-mail</label>
          <Input
            type="email"
            value={userData.email}
            readOnly
            className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500"
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
  )
}

export default Profile
