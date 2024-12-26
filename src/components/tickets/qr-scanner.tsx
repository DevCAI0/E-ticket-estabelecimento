import { useEffect, useCallback, useReducer } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode } from "lucide-react";

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

  const customizeInterface = useCallback(() => {
    const style = document.createElement("style");
    style.textContent = `
      #leitor {
        border: none !important;
        padding: 0 !important;
      }
      
      /* Remove elementos desnecessários */
      #leitor__dashboard_section_swaplink,
      #leitor__dashboard_section_fileselection,
      #leitor__header_message,
      #leitor__status_span,
      #leitor__camera_permission_button,
      img[alt="Info icon"],
      a[rel="noopener noreferrer"],
      #leitor select,
      #leitor__scan_region_label,
      #leitor__filescan_input,
      #html5-qrcode-anchor-scan-type-change {
        display: none !important;
      }
      
      #leitor__scan_region {
        padding: 0 !important;
        background: transparent !important;
        display: none; /* Hide initially */
      }
      
      #leitor__scan_region.scanning {
        display: block; /* Show when scanning */
      }
      
      #leitor__scan_region > img {
        display: none !important;
      }
      
      #leitor__scan_region video {
        max-height: 300px !important;
        object-fit: cover !important;
        border-radius: 8px !important;
        background: transparent !important;
        transform: scaleX(-1); /* Espelha a câmera frontal se necessário */
      }
      
      #leitor__camera_selection,
      #leitor__camera_permission {
        display: none !important;
      }
      
      #leitor__dashboard {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      #leitor__dashboard_section {
        margin: 0 !important;
        padding: 0 !important;
      }

      #leitor__dashboard_section_csr {
        text-align: center !important;
      }

      .scanner-button {
        background-color: hsl(var(--primary)) !important;
        color: hsl(var(--primary-foreground)) !important;
        border: none !important;
        border-radius: 0.375rem !important;
        padding: 0.75rem !important;
        margin-top: 1rem !important;
        cursor: pointer !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        width: 100% !important;
        max-width: 200px !important;
        transition: opacity 0.2s !important;
      }

      .scanner-button:hover {
        opacity: 0.9 !important;
      }

      /* Remove textos indesejados */
      #leitor__dashboard_section_csr span {
        display: none !important;
      }

      /* Adiciona uma guia de alinhamento */
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

  useEffect(() => {
    const config = {
      fps: 15,
      qrbox: { width: 200, height: 200 },
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
      focusMode: "continuous",
      videoConstraints: {
        facingMode: "environment",
        width: { min: 640, ideal: 720, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        focusMode: "continuous",
        focusDistance: { ideal: 0.2 },
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

  const handleScanSuccess = useCallback(
    (result: string) => {
      onScan(result);
      if (state.scanner) {
        state.scanner.clear();
        dispatch({ type: "STOP_SCANNING" });

        const scanRegion = document.querySelector("#leitor__scan_region");
        if (scanRegion) {
          scanRegion.classList.remove("scanning");
        }
      }
    },
    [onScan, state.scanner],
  );

  const handleScanFailure = useCallback((error: string) => {
    if (
      !error.includes("No MultiFormat Readers were able to detect the code")
    ) {
      console.warn(error);
    }
  }, []);

  const startScanning = useCallback(() => {
    if (state.scanner) {
      state.scanner.render(handleScanSuccess, handleScanFailure);
      dispatch({ type: "START_SCANNING" });

      const scanRegion = document.querySelector("#leitor__scan_region");
      if (scanRegion) {
        scanRegion.classList.add("scanning");
      }
    }
  }, [state.scanner, handleScanSuccess, handleScanFailure]);

  const stopScanning = useCallback(() => {
    if (state.scanner) {
      state.scanner.clear();
      dispatch({ type: "STOP_SCANNING" });

      const scanRegion = document.querySelector("#leitor__scan_region");
      if (scanRegion) {
        scanRegion.classList.remove("scanning");
      }
    }
  }, [state.scanner]);

  return (
    <div className="flex flex-col items-center gap-2">
      <QrCode className="mb-2 h-8 w-8 text-primary" />
      <h2 className="mb-4 text-center text-lg font-semibold text-foreground">
        {state.isScanning
          ? "Posicione o QR Code na guia"
          : "Clique para iniciar a leitura"}
      </h2>
      <div id="leitor" className="w-full" />
      <button
        onClick={state.isScanning ? stopScanning : startScanning}
        className="scanner-button"
      >
        {state.isScanning ? "Parar Leitura" : "Iniciar Leitura"}
      </button>
    </div>
  );
}