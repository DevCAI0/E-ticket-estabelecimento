// src/pages/app/home.tsx - Interface minimalista sem cards
import { useProfilePermissions } from "@/hooks/useProfilePermissions";
import EstablishmentDashboard from "./establishment-dashboard";

export default function Home() {
  const { isEstablishment, user } = useProfilePermissions();

  // Interface super limpa para estabelecimento
  if (isEstablishment()) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="mb-3 text-3xl font-semibold text-foreground">
            Bem-vindo de volta!
          </h1>
          <p className="mb-2 text-lg text-muted-foreground">
            {user?.nome_estabelecimento}
          </p>
          <p className="text-muted-foreground">
            Use a navegação abaixo para acessar os pedidos ou configurações.
          </p>
        </div>
      </div>
    );
  }

  // Para outros perfis, mostrar o dashboard completo
  return (
    <div className="mt-6">
      <div className="bg-card">
        <EstablishmentDashboard />
      </div>
    </div>
  );
}
