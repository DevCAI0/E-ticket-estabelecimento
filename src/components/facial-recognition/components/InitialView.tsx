import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InitialViewProps {
  onIniciar: () => void;
}

const InitialView = ({ onIniciar }: InitialViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] w-full max-w-2xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <div className="relative mb-8 sm:mb-12">
        <div className="absolute rounded-full -inset-4 bg-primary/5 animate-pulse" />
        <Camera className="relative w-16 h-16 sm:w-24 sm:h-24 text-primary" />
      </div>

      <div className="max-w-md space-y-6 text-center sm:space-y-8">
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-xl font-semibold sm:text-2xl text-foreground">
            Verificação Facial
          </h3>
          <div className="space-y-2">
            <p className="text-sm leading-relaxed sm:text-base text-muted-foreground">
              Posicione seu rosto em um ambiente bem iluminado para melhor
              precisão
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/80">
              Certifique-se que seu rosto esteja visível e centralizado na
              câmera
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              <span>Boa iluminação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              <span>Rosto centralizado</span>
            </div>
          </div>

          <Button
            onClick={onIniciar}
            size="lg"
            className="w-full sm:w-auto sm:min-w-[240px] h-12 sm:h-14 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Iniciar Verificação
          </Button>

          <p className="text-[10px] sm:text-xs text-muted-foreground/70 text-center">
            Ao prosseguir, você concorda com o uso da sua câmera para fins de
            verificação
          </p>
        </div>
      </div>
    </div>
  );
};

export default InitialView;
