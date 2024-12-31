// src/pages/tickets/leitura-ticket.tsx
import { LeitorQRCode } from "@/components/tickets/leitor-qrcode";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function PaginaLeituraTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const startPath = location.state?.startPath || "/";

  const handleBack = () => {
    navigate(startPath);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full items-center p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Leitura de Tickets</h1>
        </div>
      </div>
      <div className="container pb-4">
        <LeitorQRCode />
      </div>
    </div>
  );
}
