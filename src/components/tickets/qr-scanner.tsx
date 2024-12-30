import { useState, useCallback } from "react";
import { QrCode } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (result: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  const customizeInterface = useCallback(() => {
    const style = document.createElement("style");
    style.textContent = `
     #leitor {
       border: none !important;
       padding: 0 !important;
     }
     
     #leitor__dashboard_section_swaplink,
     #leitor__dashboard_section_fileselection,
     #leitor__header_message,
     #leitor__status_span,
     #leitor__camera_permission_button,
     #html5-qrcode-anchor-scan-type-change,
     #html5-qrcode-button-camera-stop,
     #html5-qrcode-button-camera-start,
     #leitor select,
     #leitor__scan_region_label,
     #leitor__filescan_input,
     img[alt="Info icon"],
     img[alt="Camera status"],
     img[src*=".png"],
     img[src*=".jpg"],
     img[src*=".jpeg"],
     img[src*=".gif"],
     a[rel="noopener noreferrer"] {
       display: none !important;
       visibility: hidden !important;
       opacity: 0 !important;
       width: 0 !important;
       height: 0 !important;
       position: absolute !important;
       pointer-events: none !important;
     }
     
     #leitor__scan_region {
       padding: 0 !important;
       background: transparent !important;
       display: none;
     }
     
     #leitor__scan_region.scanning {
       display: block;
     }
     
     #leitor__scan_region video {
       max-height: 300px !important;
       width: 100% !important;
       max-width: 300px !important;
       object-fit: cover !important;
       border-radius: 8px !important;
       background: transparent !important;
     }
     
     #leitor__dashboard {
       margin: 0 !important;
       padding: 0 !important;
     }
     
     #leitor__dashboard_section {
       margin: 0 !important;
       padding: 0 !important;
     }

     #leitor__scan_region::after {
       content: '';
       position: absolute;
       top: 50%;
       left: 50%;
       transform: translate(-50%, -50%);
       width: 200px;
       height: 200px;
       border: 2px solid hsl(var(--primary));
       border-radius: 8px;
       pointer-events: none;
     }
   `;
    document.head.appendChild(style);
  }, []);

  const handleError = (error: string) => {
    if (
      !error.includes("No MultiFormat Readers were able to detect the code")
    ) {
      console.error(error);
      showErrorToast("Erro ao processar QR Code.");
    }
  };

  const handleScan = useCallback(
    (text: string) => {
      try {
        onScan(text);
        setIsScanning(false);
        if (scanner) {
          scanner.clear();
          const scanRegion = document.querySelector("#leitor__scan_region");
          if (scanRegion) scanRegion.classList.remove("scanning");
        }
        showSuccessToast("QR Code lido com sucesso!");
      } catch (error) {
        console.error("Erro ao processar QR Code:", error);
        showErrorToast("Erro ao processar QR Code.");
      }
    },
    [onScan, scanner],
  );

  const handleToggle = useCallback(() => {
    if (!scanner) {
      const config = {
        fps: 15,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        focusMode: "continuous" as const,
        showTorchButtonIfSupported: false,
        videoConstraints: {
          facingMode: "environment",
          width: { min: 640, ideal: 720, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        },
      };

      const newScanner = new Html5QrcodeScanner("leitor", config, false);
      setScanner(newScanner);
      customizeInterface();
    }

    if (!isScanning) {
      scanner?.render(handleScan, handleError);
      const scanRegion = document.querySelector("#leitor__scan_region");
      if (scanRegion) scanRegion.classList.add("scanning");
    } else {
      scanner?.clear();
      const scanRegion = document.querySelector("#leitor__scan_region");
      if (scanRegion) scanRegion.classList.remove("scanning");
    }

    setIsScanning(!isScanning);
  }, [isScanning, scanner, handleScan, customizeInterface]);

  return (
    <div className="flex flex-col items-center gap-2">
      <QrCode className="mb-2 h-8 w-8 text-primary" />
      <h2 className="mb-4 text-center text-lg font-semibold text-foreground">
        {isScanning
          ? "Posicione o QR Code na guia"
          : "Clique para iniciar a leitura"}
      </h2>
      <div id="leitor" className="w-full" />
      <Button
        onClick={handleToggle}
        variant={isScanning ? "destructive" : "default"}
        className="mt-4 w-full max-w-[200px]"
      >
        {isScanning ? "Parar" : "Iniciar Escaneamento"}
      </Button>
    </div>
  );
}
