// src/pages/404.tsx
import { Button } from "@/components/ui/button";
import { MapPin, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* Ícone */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/5" />
          <MapPin className="relative h-16 w-16 text-primary" />
        </div>
      </div>

      {/* Mensagem */}
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold">404</h1>
        <h2 className="mb-2 text-xl font-semibold">Página não encontrada</h2>
        <p className="text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi removida.
        </p>
      </div>

      {/* Ações */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button className="w-full" onClick={() => navigate(-1)} size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/")}
          size="lg"
        >
          <Home className="mr-2 h-4 w-4" />
          Ir para Início
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
