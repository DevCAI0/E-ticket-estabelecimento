//

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QrScannerProps {
  onScan: (qrCode: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string>("");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(`Erro ao listar câmeras: ${errorMessage}`);
      }
    };

    getCameras();
  }, []);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const startCamera = async () => {
      if (!selectedCamera) return;

      try {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }

        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera,
            facingMode: "environment",
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;

          // Setup QR code scanning here
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          const scanQRCode = () => {
            if (videoRef.current && context) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              context.drawImage(
                videoRef.current,
                0,
                0,
                canvas.width,
                canvas.height,
              );

              // Here you would use a QR code library to scan the canvas
              // Example with a hypothetical QR library:
              // const qrCode = QRScanner.scan(canvas);
              // if (qrCode) onScan(qrCode);
            }
            requestAnimationFrame(scanQRCode);
          };

          videoRef.current.onloadedmetadata = () => {
            scanQRCode();
          };
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
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
  }, [selectedCamera, onScan]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <span>Aponte a câmera para o QR Code</span>
        </div>

        <Select value={selectedCamera} onValueChange={setSelectedCamera}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione a câmera" />
          </SelectTrigger>
          <SelectContent>
            {cameras.map((camera) => (
              <SelectItem key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Câmera ${camera.deviceId.slice(0, 5)}...`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
