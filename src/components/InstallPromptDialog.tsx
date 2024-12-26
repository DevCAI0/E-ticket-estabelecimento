import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Wifi, Zap } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Navigator {
    standalone?: boolean;
  }
}

export function InstallPromptDialog() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const checkInstallationStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true ||
                          document.referrer.includes('android-app://');

      if (!isStandalone && deferredPrompt) {
        setShowDialog(true);
      }
    };

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      checkInstallationStatus();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    const interval = setInterval(checkInstallationStatus, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearInterval(interval);
    };
  }, [deferredPrompt]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("✅ Usuário aceitou instalar o PWA");
      } else {
        console.log("❌ Usuário recusou instalar o PWA");
      }
    } catch (error) {
      console.error("Erro ao tentar instalar o PWA:", error);
    } finally {
      setDeferredPrompt(null);
      setShowDialog(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="w-[95vw] max-w-[400px] rounded-xl p-0 overflow-hidden">
        {/* Banner superior */}
        <div className="relative h-24 sm:h-32 bg-gradient-to-r from-primary/90 to-primary flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20" />
          <Phone className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
        </div>

        <div className="p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl sm:text-2xl text-center">
              Instale nosso App
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-center pt-2">
              Tenha uma experiência completa instalando nosso aplicativo na sua tela inicial
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>Acesso rápido e prático</div>
            </div>
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div>Funciona mesmo offline</div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowDialog(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Agora não
            </Button>
            <Button
              variant="default"
              onClick={handleInstallApp}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Instalar Aplicativo
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}