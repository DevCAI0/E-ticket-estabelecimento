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
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
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
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const checkInstallationStatus = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");

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
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      clearInterval(interval);
    };
  }, [deferredPrompt]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        showSuccessToast("App instalado com sucesso!");
      }
    } catch (_error) {
      showErrorToast("Erro ao instalar o aplicativo");
    } finally {
      setDeferredPrompt(null);
      setShowDialog(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="w-[95vw] max-w-[400px] overflow-hidden rounded-xl p-0">
        <div className="relative flex items-center justify-center h-24 bg-gradient-to-r from-primary/90 to-primary sm:h-32">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20" />
          <Phone className="w-12 h-12 text-white sm:h-16 sm:w-16" />
        </div>

        <div className="p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl text-center sm:text-2xl">
              Instale nosso App
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-center sm:text-base">
              Tenha uma experiência completa instalando nosso aplicativo na sua
              tela inicial
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>Acesso rápido e prático</div>
            </div>
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10">
                <Wifi className="w-5 h-5 text-primary" />
              </div>
              <div>Funciona mesmo offline</div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 pt-4 border-t sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => setShowDialog(false)}
              className="order-2 w-full sm:order-1 sm:w-auto"
            >
              Agora não
            </Button>
            <Button
              variant="default"
              onClick={handleInstallApp}
              className="order-1 w-full sm:order-2 sm:w-auto"
            >
              Instalar Aplicativo
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
