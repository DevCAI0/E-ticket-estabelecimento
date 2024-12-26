import React, { useState, useCallback, useEffect } from "react";
import QrReader from "react-qr-scanner";
import { QrCode } from "lucide-react";

interface QrScannerProps {
  onScan: (result: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);

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
      } catch (error) {
        console.error("Error getting cameras:", error);
      }
    };

    getCameras();
  }, []);

  const handleError = useCallback((err: any) => {
    console.error(err);
  }, []);

  const handleScan = useCallback(
    (data: any) => {
      if (data?.text) {
        onScan(data.text);
      }
    },
    [onScan],
  );

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(event.target.value);
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <QrCode className="mb-2 h-8 w-8 text-primary" />
      <h2 className="mb-4 text-center text-lg font-semibold text-foreground">
        {isScanning
          ? "Posicione o QR Code na guia"
          : "Clique para iniciar a leitura"}
      </h2>
      <select
        className="mb-4 w-full max-w-[200px] rounded-md border border-input bg-background px-3 py-2"
        value={selectedCamera}
        onChange={handleCameraChange}
      >
        {cameras.map((camera) => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label || `Câmera ${cameras.indexOf(camera) + 1}`}
          </option>
        ))}
      </select>
      {isScanning && (
        <div className="relative aspect-square w-full max-w-[300px]">
          <QrReader
            key={selectedCamera}
            delay={300}
            onError={handleError}
            onScan={handleScan}
          />
          <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-primary" />
        </div>
      )}
      <button
        onClick={toggleScanning}
        className="mt-4 w-full max-w-[200px] rounded-md bg-primary py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        {isScanning ? "Parar Leitura" : "Iniciar Leitura"}
      </button>
    </div>
  );
}
