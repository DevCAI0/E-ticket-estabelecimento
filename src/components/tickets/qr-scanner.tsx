import { useState, useCallback, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Image, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";

interface QrScannerProps {
  onScan: (qrCode: string) => void;
}
const qrConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1,
  showTorchButtonIfSupported: true,
  videoConstraints: {
    width: { min: 640, ideal: 1080, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  },
};

const QrScanner = ({ onScan }: QrScannerProps) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Adiciona estilos CSS necessários para exibir o vídeo corretamente
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      #qr-reader video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        border-radius: 0.5rem !important;
      }
      #qr-reader {
        width: 100% !important;
        border: none !important;
        padding: 0 !important;
      }
      #qr-reader__scan_region {
        min-height: unset !important;
      }
      #qr-reader__dashboard {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        });
      }
    };
  }, []);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      onScan(decodedText);
    },
    [onScan],
  );

  const startScanning = async () => {
    if (!scannerRef.current) {
      showErrorToast("Aguarde a inicialização do scanner...");
      return;
    }

    try {
      const config = {
        ...qrConfig,
        videoConstraints: {
          ...qrConfig.videoConstraints,
          facingMode: isFrontCamera ? "user" : { exact: "environment" },
        },
      };

      await scannerRef.current.start(
        { facingMode: isFrontCamera ? "user" : { exact: "environment" } },
        config,
        handleScanSuccess,
        () => {}, // Ignore errors durante o scanning
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Erro ao iniciar scanner:", err);
      // Se falhar com 'exact: environment', tenta sem exact
      if (!isFrontCamera) {
        try {
          const fallbackConfig = {
            ...qrConfig,
            videoConstraints: {
              ...qrConfig.videoConstraints,
              facingMode: "environment",
            },
          };
          await scannerRef.current?.start(
            { facingMode: "environment" },
            fallbackConfig,
            handleScanSuccess,
            () => {},
          );
          setIsScanning(true);
          return;
        } catch (fallbackErr) {
          console.error("Erro ao tentar fallback:", fallbackErr);
        }
      }
      showErrorToast("Erro ao acessar a câmera. Verifique as permissões.");
    }
  };

  const stopScanning = async () => {
    if (!scannerRef.current) return;

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
      setIsScanning(false);
    } catch (err) {
      console.error("Erro ao parar scanner:", err);
    }
  };

  const handleCameraSwitch = async (checked: boolean) => {
    // Se estiver escaneando, não permite a troca
    if (isScanning) {
      showErrorToast("Pare o scanner antes de trocar a câmera");
      return;
    }

    try {
      await stopScanning();
      setIsFrontCamera(checked);
    } catch (err) {
      console.error("Erro ao trocar câmera:", err);
      showErrorToast("Erro ao trocar de câmera. Tente novamente.");
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;

    try {
      showSuccessToast("Processando imagem...");
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScan(decodedText);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      if (
        errorMessage.includes(
          "No MultiFormat Readers were able to detect the code",
        )
      ) {
        showErrorToast(
          "Nenhum QR code encontrado na imagem. Tente outra imagem ou use a câmera.",
        );
      } else {
        showErrorToast("Erro ao processar imagem. Tente novamente.");
      }
    }
  };

  const resetScanner = async () => {
    await stopScanning();
  };

  const toggleScanner = async () => {
    try {
      if (isScanning) {
        await stopScanning();
      } else {
        await startScanning();
      }
    } catch (err) {
      console.error("Erro ao alternar scanner:", err);
      showErrorToast("Erro ao alternar o scanner. Tente novamente.");
    }
  };

  return (
    <div className="flex h-full flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {/* Botão Voltar/Parar */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={resetScanner}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Camera Switch */}
        <div className="flex items-center gap-2">
          <Label htmlFor="camera-switch" className="text-sm text-white">
            {isFrontCamera ? "Câmera Frontal" : "Câmera Traseira"}
          </Label>
          <Switch
            id="camera-switch"
            checked={isFrontCamera}
            onCheckedChange={handleCameraSwitch}
            disabled={isScanning} // Desabilita durante o scanning
          />
        </div>
      </div>

      {/* Scanner Area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative aspect-square w-full max-w-[280px]">
          {/* Corner Markers */}
          <div className="absolute left-0 top-0 z-10 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-white" />
          <div className="absolute right-0 top-0 z-10 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-white" />
          <div className="absolute bottom-0 left-0 z-10 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-white" />
          <div className="absolute bottom-0 right-0 z-10 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-white" />

          {/* QR Scanner */}
          <div
            id="qr-reader"
            className={`h-full w-full overflow-hidden rounded-lg bg-black ${
              isScanning ? "block" : "hidden"
            }`}
          />

          {/* Botão de iniciar */}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={toggleScanner}
                size="lg"
                className="h-20 w-20 rounded-full bg-white hover:bg-white/90"
              >
                <Camera className="h-8 w-8 text-black" />
              </Button>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-white/80">
          {isScanning
            ? "Posicione o QR Code dentro da área"
            : "Clique para iniciar o scanner"}
        </p>
      </div>

      {/* Bottom Action */}
      <div className="p-4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="file-input"
          onChange={handleFileInput}
        />
        <Button
          variant="ghost"
          className="flex w-full items-center justify-center gap-2 rounded-lg py-4 text-white hover:bg-white/10"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <Image className="h-5 w-5" />
          <span>Escolher da galeria</span>
        </Button>
      </div>
    </div>
  );
};

export default QrScanner;
