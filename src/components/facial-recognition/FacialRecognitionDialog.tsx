import { useCallback, useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Camera,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useFacialRecognition } from "@/hooks/use-facial-recognition";
import { VerificationResult } from "@/types/face-recognition";
import { cn } from "@/lib/utils";
// import { Label } from "../ui/label";

interface Props {
  open: boolean;
  onSuccess?: (result: VerificationResult) => void;
  onClose?: () => void;
  funcionarioId: number;
}

interface VerificationLog {
  type: "info" | "error" | "success" | "warning";
  message: string;
  timestamp: string;
  details?: string;
}

const PHOTO_COUNT = 3;

const VerificationLog = ({ logs }: { logs: VerificationLog[] }) => (
  <div className="mt-4 h-[150px] w-full overflow-y-auto rounded border bg-gray-50 p-2 text-left sm:h-[200px] sm:w-[400px] sm:p-4">
    {logs.map((log, i) => (
      <div
        key={i}
        className="mb-2 flex items-start gap-1 text-xs sm:gap-2 sm:text-sm"
      >
        <span className="whitespace-nowrap font-mono text-[10px] text-gray-400 sm:text-xs">
          {log.timestamp}
        </span>
        <div
          className={cn(
            "flex-1",
            log.type === "error" && "text-red-600",
            log.type === "success" && "text-green-600",
            log.type === "warning" && "text-yellow-600",
            log.type === "info" && "text-gray-600",
          )}
        >
          <div className="flex items-center gap-1">
            {log.type === "error" && (
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {log.type === "success" && (
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {log.type === "warning" && (
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="line-clamp-2">{log.message}</span>
          </div>
          {log.details && (
            <pre className="mt-1 whitespace-pre-wrap text-[10px] text-gray-500 sm:text-xs">
              {log.details}
            </pre>
          )}
        </div>
      </div>
    ))}
  </div>
);

const FacialRecognitionDialog = ({
  open,
  onSuccess,
  onClose,
  funcionarioId,
}: Props) => {
  // Estados
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [verificationDetails, setVerificationDetails] =
    useState<VerificationResult | null>(null);
  const [photosTaken, setPhotosTaken] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>(
    [],
  );
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Função para adicionar logs
  const addLog = useCallback(
    (type: VerificationLog["type"], message: string, details?: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setVerificationLogs((prev) => [
        ...prev,
        { type, message, timestamp, details },
      ]);
    },
    [],
  );

  // Callback de sucesso
  const handleSuccess = useCallback(
    (result: VerificationResult) => {
      setVerificationDetails(result);
      setIsVerifying(false);
      setLocalProgress(100);
      addLog(
        "success",
        "Verificação concluída com sucesso",
        JSON.stringify(
          {
            similarity: result.similarity.toFixed(2),
            label: result.label,
            confidence: result.confidence,
            processingTime: result.processingTime.toFixed(0),
          },
          null,
          2,
        ),
      );
      toast({
        title: "Verificação Concluída",
        description: (
          <div className="mt-2 flex flex-col gap-1.5">
            <p className="font-medium text-green-600">Identidade confirmada!</p>
            <div className="mt-1 text-sm text-gray-500">
              <p>Similaridade: {result.similarity.toFixed(2)}%</p>
              <p>Identificação: {result.label}</p>
              <p>Confiança mínima: {result.confidence}%</p>
              <p>Tempo: {result.processingTime.toFixed(0)}ms</p>
            </div>
          </div>
        ),
      });
      setIsScanning(false);
      onSuccess?.(result);
    },
    [onSuccess, addLog],
  );

  // Callback de erro
  const handleError = useCallback(
    (error: Error) => {
      setIsVerifying(false);
      setLocalProgress(0);
      addLog("error", "Erro na verificação", error.message);
      toast({
        title: "Erro na Verificação",
        description: error.message,
        variant: "destructive",
      });
      setIsScanning(false);
    },
    [addLog],
  );

  // Hook de reconhecimento facial
  const {
    step,
    setStep,
    progress,
    videoRef,
    captureAndVerify,
    startCamera,
    stopCamera,
    // isFrontCamera,
    // handleCameraSwitch,
  } = useFacialRecognition({
    onSuccess: handleSuccess,
    onError: handleError,
    funcionarioId,
  });

  // Função para capturar foto
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("willReadFrequently", "true");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    const photo = canvas.toDataURL("image/jpeg", 0.8);

    setCapturedPhotos((prev) => [...prev, photo]);
    return photo;
  }, [videoRef]);

  // Função para iniciar scanning
  const startScanning = useCallback(async () => {
    try {
      setIsScanning(true);
      setCapturedPhotos([]);
      setPhotosTaken(0);
      setLocalProgress(0);
      addLog("info", "Iniciando câmera...");
      await startCamera();

      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          addLog("success", "Câmera iniciada com sucesso");
          setIsCameraReady(true);
        };
      }
    } catch (error) {
      addLog(
        "error",
        "Erro ao iniciar câmera",
        error instanceof Error ? error.message : String(error),
      );
      setIsScanning(false);
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [startCamera, handleError, videoRef, addLog]);

  // Função para fechar
  const handleClose = useCallback(() => {
    stopCamera();
    setIsScanning(false);
    setIsCameraReady(false);
    setCapturedPhotos([]);
    setPhotosTaken(0);
    setIsVerifying(false);
    setVerificationDetails(null);
    setLocalProgress(0);
    setVerificationLogs([]);
    setStep("INITIAL");
    onClose?.();
  }, [stopCamera, setStep, onClose]);

  // Efeito para monitorar progresso
  useEffect(() => {
    if (progress !== localProgress) {
      setLocalProgress(progress);
      addLog("info", `Progresso da verificação: ${progress}%`);
    }
  }, [progress, localProgress, addLog]);

  // Efeito para monitorar etapas
  useEffect(() => {
    if (step) {
      addLog("info", `Etapa atual: ${step}`);
    }
  }, [step, addLog]);

  // Efeito para captura de fotos
  useEffect(() => {
    let captureTimer: NodeJS.Timeout;

    if (isScanning && isCameraReady && photosTaken < PHOTO_COUNT) {
      const startCapture = async () => {
        addLog("info", `Capturando foto ${photosTaken + 1} de ${PHOTO_COUNT}`);
        const photo = await capturePhoto();
        if (photo) {
          setPhotosTaken((prev) => prev + 1);

          if (photosTaken + 1 === PHOTO_COUNT) {
            setIsVerifying(true);
            addLog("info", "Iniciando verificação...");
            stopCamera();
            await captureAndVerify(capturedPhotos);
          }
        }
      };

      captureTimer = setTimeout(startCapture, 1000);
    }

    return () => {
      if (captureTimer) clearTimeout(captureTimer);
    };
  }, [
    isScanning,
    isCameraReady,
    photosTaken,
    capturePhoto,
    stopCamera,
    captureAndVerify,
    addLog,
    capturedPhotos,
  ]);

  // Views
  const renderInitialView = () => (
    <div className="mx-auto flex min-h-[400px] w-full max-w-2xl flex-col items-center justify-center px-4 py-8 sm:min-h-[500px] sm:px-8 sm:py-12">
      <div className="relative mb-8 sm:mb-12">
        <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/5" />
        <Camera className="relative h-16 w-16 text-primary sm:h-24 sm:w-24" />
      </div>

      <div className="max-w-md space-y-6 text-center sm:space-y-8">
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
            Verificação Facial
          </h3>
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Posicione seu rosto em um ambiente bem iluminado para melhor
              precisão
            </p>
            <p className="text-xs text-muted-foreground/80 sm:text-sm">
              Certifique-se que seu rosto esteja visível e centralizado na
              câmera
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/60" />
              <span>Boa iluminação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/60" />
              <span>Rosto centralizado</span>
            </div>
          </div>

          <Button
            onClick={startScanning}
            size="lg"
            className="h-12 w-full rounded-full text-base shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] sm:h-14 sm:w-auto sm:min-w-[240px]"
          >
            Iniciar Verificação
          </Button>

          <p className="text-center text-[10px] text-muted-foreground/70 sm:text-xs">
            Ao prosseguir, você concorda com o uso da sua câmera para fins de
            verificação
          </p>
        </div>
      </div>
    </div>
  );
  const renderLoadingView = () => (
    <div className="flex flex-col items-center justify-center gap-4 p-4 sm:gap-6 sm:p-8">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary sm:h-16 sm:w-16" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-primary sm:text-sm">
            {localProgress}%
          </span>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-base font-medium sm:text-lg">
          Processando Verificação
        </h3>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Etapa atual: {step}
        </p>
        <Progress value={localProgress} className="w-full sm:w-[400px]" />
      </div>
    </div>
  );

  const renderScanningView = () => (
    <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-black sm:h-[400px]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 sm:bottom-8 sm:gap-4">
        <Alert className="w-auto max-w-[90%] border-none bg-black/60 text-white shadow-lg">
          <AlertTitle className="text-center text-sm font-medium sm:text-base">
            Capturando foto {photosTaken + 1} de {PHOTO_COUNT}
          </AlertTitle>
          <AlertDescription>
            <Progress
              value={(photosTaken / PHOTO_COUNT) * 100}
              className="mt-2 w-[150px] sm:w-[200px]"
            />
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  const renderResultView = () => (
    <Card
      className={cn(
        "border-none shadow-lg",
        step === "SUCCESS" ? "bg-green-50" : "bg-red-50",
      )}
    >
      <CardContent className="flex flex-col items-center p-4 sm:p-8">
        {step === "SUCCESS" ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 sm:h-16 sm:w-16" />
            <h3 className="mt-4 text-base font-medium sm:text-lg">
              Verificação Concluída
            </h3>
            {verificationDetails && (
              <div className="mt-4 space-y-1.5 text-xs text-gray-600 sm:text-sm">
                <p className="text-center font-medium">
                  Detalhes da Verificação:
                </p>
                <p>
                  Similaridade: {verificationDetails.similarity.toFixed(2)}%
                </p>
                <p>Identificação: {verificationDetails.label}</p>
                <p>Confiança mínima: {verificationDetails.confidence}%</p>
                <p>Tempo: {verificationDetails.processingTime.toFixed(0)}ms</p>
              </div>
            )}
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-red-600 sm:h-16 sm:w-16" />
            <h3 className="mt-4 text-base font-medium sm:text-lg">
              Verificação Falhou
            </h3>
            <p className="mt-2 text-center text-xs text-muted-foreground sm:text-sm">
              Não foi possível confirmar sua identidade.
            </p>
          </>
        )}
        <Button
          className="mt-6 w-full sm:min-w-[200px]"
          variant={step === "SUCCESS" ? "outline" : "default"}
          onClick={handleClose}
        >
          Fechar
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto p-0 sm:max-w-[700px]">
        <div className="flex items-center justify-between p-4 pb-0 sm:p-6">
          <DialogTitle className="text-lg font-semibold sm:text-xl">
            {/* ... títulos ... */}
          </DialogTitle>

          <div className="flex items-center gap-4">
            {/* Switch de câmera
            <div className="flex items-center gap-2">
              <Label
                htmlFor="camera-switch"
                className="text-sm text-muted-foreground"
              >
                {isFrontCamera ? "Câmera Frontal" : "Câmera Traseira"}
              </Label>
              <Switch
                id="camera-switch"
                checked={isFrontCamera}
                onCheckedChange={handleCameraSwitch}
                disabled={isScanning || isVerifying}
              />
            </div> */}

            {/* Switch de logs */}
            <div className="flex items-center">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Logs
              </span>
              <Switch
                checked={showLogs}
                onCheckedChange={setShowLogs}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
          <div className="flex min-h-[300px] items-center justify-center sm:min-h-[400px]">
            {!isScanning &&
              !isVerifying &&
              step !== "SUCCESS" &&
              step !== "FAILED" &&
              renderInitialView()}
            {isScanning &&
              !isVerifying &&
              step !== "SUCCESS" &&
              step !== "FAILED" &&
              renderScanningView()}
            {isVerifying && renderLoadingView()}
            {(step === "SUCCESS" || step === "FAILED") && renderResultView()}
          </div>

          {showLogs && verificationLogs.length > 0 && (
            <div className="border-t pt-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-medium sm:text-sm">
                  Log de Verificação
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setVerificationLogs([])}
                >
                  Limpar Logs
                </Button>
              </div>
              <VerificationLog logs={verificationLogs} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacialRecognitionDialog;
