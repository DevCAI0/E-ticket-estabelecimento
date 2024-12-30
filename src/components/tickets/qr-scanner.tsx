import { useEffect, useCallback, useReducer } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode } from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (result: string) => void;
}

type ScannerState = {
  isScanning: boolean;
  scanner: Html5QrcodeScanner | null;
};

type ScannerAction =
  | { type: "INIT_SCANNER"; scanner: Html5QrcodeScanner }
  | { type: "START_SCANNING" }
  | { type: "STOP_SCANNING" };

function scannerReducer(
  state: ScannerState,
  action: ScannerAction,
): ScannerState {
  switch (action.type) {
    case "INIT_SCANNER":
      return {
        ...state,
        scanner: action.scanner,
      };
    case "START_SCANNING":
      return {
        ...state,
        isScanning: true,
      };
    case "STOP_SCANNING":
      return {
        ...state,
        isScanning: false,
      };
    default:
      return state;
  }
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [state, dispatch] = useReducer(scannerReducer, {
    isScanning: false,
    scanner: null,
  });

  const handleStop = useCallback(() => {
    if (state.scanner) {
      state.scanner.clear();
      dispatch({ type: "STOP_SCANNING" });

      const scanRegion = document.querySelector("#leitor__scan_region");
      if (scanRegion) {
        scanRegion.classList.remove("scanning");
      }
      showSuccessToast("Escaneamento parado.");
    }
  }, [state.scanner]);

  const handleScanSuccess = useCallback(
    (text: string) => {
      try {
        onScan(text);
        handleStop();
        showSuccessToast("QR Code lido com sucesso!");
      } catch (error) {
        console.error("Erro ao processar QR Code:", error);
        showErrorToast("Erro ao processar QR Code.");
      }
    },
    [onScan, handleStop],
  );

  const handleScanFailure = useCallback((error: string) => {
    if (
      !error.includes("No MultiFormat Readers were able to detect the code")
    ) {
      console.warn(error);
    }
  }, []);

  const handleStart = useCallback(() => {
    if (state.scanner) {
      state.scanner.render(handleScanSuccess, handleScanFailure);
      dispatch({ type: "START_SCANNING" });

      const scanRegion = document.querySelector("#leitor__scan_region");
      if (scanRegion) {
        scanRegion.classList.add("scanning");
      }
      showSuccessToast("Iniciando escaneamento...");
    }
  }, [state.scanner, handleScanSuccess, handleScanFailure]);

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
      #html5-qrcode-anchor-scan-type-change,
      #html5-qrcode-button-camera-stop,
      #html5-qrcode-button-camera-start,
      #html5-qrcode-private-filescan-input,
      #html5-qrcode-button-file-selection,
      #leitor select,
      #leitor__scan_region_label,
      #leitor__filescan_input,
      svg[role="button"],
      img[alt="Info icon"],
      img[alt="Camera based scan"],
      div[style*="Request Camera Permissions"],
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

    // Remover elementos indesejados dinamicamente
    const elementsToRemove = [
      "#html5-qrcode-button-file-selection",
      "#html5-qrcode-private-filescan-input",
      "div[style*='Request Camera Permissions']",
      "img[alt='Info icon']",
      "img[alt='Camera based scan']",
    ];

    elementsToRemove.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.remove();
      }
    });

    // Alterar texto do botão de permissão
    const updateCameraPermissionButtonText = () => {
      const cameraPermissionButton = document.querySelector(
        "#html5-qrcode-button-camera-permission",
      );
      if (cameraPermissionButton) {
        cameraPermissionButton.textContent = "Solicitar Permissão da Câmera";
      }
    };

    // Usar um MutationObserver para observar mudanças no DOM e alterar o texto
    const observer = new MutationObserver(() => {
      updateCameraPermissionButtonText();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Garantir que o texto seja alterado ao inicializar
    updateCameraPermissionButtonText();

    // Desconectar o observer ao desmontar
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const config = {
      fps: 15,
      qrbox: { width: 200, height: 200 },
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
      focusMode: "continuous" as const,
      showTorchButtonIfSupported: false,
      hideMainScannerOnSuccess: true,
      videoConstraints: {
        facingMode: "environment",
        width: { min: 640, ideal: 720, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
      },
    };

    const newScanner = new Html5QrcodeScanner("leitor", config, false);
    dispatch({ type: "INIT_SCANNER", scanner: newScanner });
    customizeInterface();

    return () => {
      if (newScanner) {
        newScanner.clear();
      }
    };
  }, [customizeInterface]);

  return (
    <div className="flex flex-col items-center gap-2">
      <QrCode className="mb-2 h-8 w-8 text-primary" />
      <h2 className="mb-4 text-center text-lg font-semibold text-foreground">
        {state.isScanning
          ? "Posicione o QR Code na guia"
          : "Clique para iniciar a leitura"}
      </h2>
      <div id="leitor" className="w-full" />
      <Button
        onClick={state.isScanning ? handleStop : handleStart}
        variant={state.isScanning ? "destructive" : "default"}
        className="mt-4 w-full max-w-[200px]"
      >
        {state.isScanning ? "Parar" : "Iniciar Escaneamento"}
      </Button>
    </div>
  );
}
