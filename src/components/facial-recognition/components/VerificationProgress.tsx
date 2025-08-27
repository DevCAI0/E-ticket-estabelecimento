import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserIcon } from "lucide-react";

interface VerificationProgressProps {
  rostoDetectado: boolean;
  contadorRegressivo: number;
  tempoEspera: number;
  fotosCapturadas: number;
  quantidadeFotos: number;
}

const VerificationProgress = ({
  rostoDetectado,
  contadorRegressivo,
  tempoEspera,
  fotosCapturadas,
  quantidadeFotos,
}: VerificationProgressProps) => {
  if (rostoDetectado) {
    return (
      <Alert className="w-auto max-w-[90%] bg-black/60 border-none text-white shadow-lg">
        <AlertTitle className="text-sm font-medium text-center sm:text-base">
          {contadorRegressivo > 0
            ? `Rosto detectado! Captura em ${contadorRegressivo}...`
            : `Mantenha o rosto visível - Capturando foto ${
                fotosCapturadas + 1
              } de ${quantidadeFotos}`}
        </AlertTitle>
        <AlertDescription>
          <Progress
            value={
              contadorRegressivo > 0
                ? ((tempoEspera - contadorRegressivo) / tempoEspera) * 100
                : (fotosCapturadas / quantidadeFotos) * 100
            }
            className="w-[150px] sm:w-[200px] mt-2"
          />
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="w-auto max-w-[90%] bg-black/60 border-none text-white shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <UserIcon className="w-5 h-5 animate-pulse" />
        <AlertTitle className="text-sm font-medium text-center sm:text-base">
          Posicione seu rosto na câmera
        </AlertTitle>
      </div>
    </Alert>
  );
};

export default VerificationProgress;
