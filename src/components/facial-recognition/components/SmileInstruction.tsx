import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Smile } from "lucide-react";

interface SmileInstructionProps {
  sorrisoDetectado: boolean;
  funcionarioNome: string;
  contadorRegressivo: number;
  tempoEspera: number;
  porcentagemSorriso?: number;
}

const SmileInstruction = ({
  sorrisoDetectado,
  funcionarioNome,
  contadorRegressivo,
  tempoEspera,
  porcentagemSorriso = 0,
}: SmileInstructionProps) => {
  return (
    <Alert className="w-auto max-w-[90%] bg-black/60 border-none text-white shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Smile
          className={`w-5 h-5 transition-colors duration-300 ${
            sorrisoDetectado
              ? "text-green-400 animate-pulse"
              : "text-yellow-400"
          }`}
        />
        <AlertTitle className="text-sm font-medium text-center sm:text-base">
          Olá, {funcionarioNome}!
        </AlertTitle>
      </div>

      <AlertDescription className="space-y-2">
        <div className="text-center">
          <p className="text-xs sm:text-sm">
            {sorrisoDetectado
              ? `Sorriso detectado! Captura em ${contadorRegressivo}s`
              : `Mantenha o sorriso: ${porcentagemSorriso.toFixed(0)}%`}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-300 mt-1">
            Continue sorrindo até a verificação completar!
          </p>
        </div>

        <Progress
          value={
            sorrisoDetectado
              ? ((tempoEspera - contadorRegressivo) / tempoEspera) * 100
              : porcentagemSorriso
          }
          className="w-[200px] sm:w-[250px] mt-2"
        />
      </AlertDescription>
    </Alert>
  );
};

export default SmileInstruction;
