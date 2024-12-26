import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QrScannerProps {
  onScan: (qrCode: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setError(`Erro ao acessar a câmera: ${errorMessage}`);
      }
    };

    startCamera();

    return () => {
      if (mediaStream) {
        mediaStream
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Camera className="h-5 w-5" />
        <span>Aponte a câmera para o QR Code</span>
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default QrScanner;
