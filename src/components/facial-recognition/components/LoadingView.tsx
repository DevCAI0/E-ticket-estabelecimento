import Loading from "@/components/Loading";
import { Progress } from "@/components/ui/progress";

interface LoadingViewProps {
  progresso: number;
  etapa: string;
}

const LoadingView = ({ progresso, etapa }: LoadingViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 sm:gap-6 sm:p-8">
      <Loading
        variant="spinner"
        size="lg"
        progress={progresso}
        color="primary"
      />

      <div className="space-y-2 text-center">
        <h3 className="text-base font-medium sm:text-lg">
          Processando Verificação
        </h3>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Etapa atual: {etapa}
        </p>
        <Progress
          value={progresso}
          className="w-full sm:w-[400px]"
          style={{ transition: "width 0.2s ease" }}
        />
        <p className="text-xs text-muted-foreground">
          {Math.round(progresso)}% concluído
        </p>
      </div>
    </div>
  );
};

export default LoadingView;
