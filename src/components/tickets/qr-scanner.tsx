import { useEffect, useCallback, useReducer } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { QrCode, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QrScannerProps {
  onScan: (result: string) => void;
}

type ScannerState = {
  isScanning: boolean;
  hasCameraPermission: boolean;
  scanner: Html5QrcodeScanner | null;
  error: string | null;
};

type ScannerAction =
  | { type: "INIT_SCANNER"; scanner: Html5QrcodeScanner }
  | { type: "START_SCANNING" }
  | { type: "STOP_SCANNING" }
  | { type: "SET_CAMERA_PERMISSION"; hasPermission: boolean }
  | { type: "SET_ERROR"; error: string };

function scannerReducer(
  state: ScannerState,
  action: ScannerAction,
): ScannerState {
  switch (action.type) {
    case "INIT_SCANNER":
      return { ...state, scanner: action.scanner };
    case "START_SCANNING":
      return { ...state, isScanning: true, error: null };
    case "STOP_SCANNING":
      return { ...state, isScanning: false };
    case "SET_CAMERA_PERMISSION":
      return { ...state, hasCameraPermission: action.hasPermission };
    case "SET_ERROR":
      return { ...state, error: action.error, isScanning: false };
    default:
      return state;
  }
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [state, dispatch] = useReducer(scannerReducer, {
    isScanning: false,
    hasCameraPermission: false,
    scanner: null,
    error: null,
  });

  const startScanning = useCallback(() => {
    if (state.scanner && state.hasCameraPermission) {
      state.scanner.render(
        (result: string) => {
          onScan(result);
          if (state.scanner) {
            state.scanner.clear();
            dispatch({ type: "STOP_SCANNING" });
          }
        },
        (error: string) => {
          if (
            !error.includes(
              "No MultiFormat Readers were able to detect the code",
            )
          ) {
            console.warn(error);
          }
        },
      );
      dispatch({ type: "START_SCANNING" });
    }
  }, [state.scanner, state.hasCameraPermission, onScan]);

  const stopScanning = useCallback(() => {
    if (state.scanner) {
      state.scanner.clear();
      dispatch({ type: "STOP_SCANNING" });
    }
  }, [state.scanner]);

  const requestCameraPermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { min: 320, ideal: 720, max: 1280 },
          height: { min: 240, ideal: 540, max: 960 },
        },
      });
      dispatch({ type: "SET_CAMERA_PERMISSION", hasPermission: true });
      startScanning();
    } catch {
      try {
        await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        dispatch({ type: "SET_CAMERA_PERMISSION", hasPermission: true });
        startScanning();
      } catch {
        dispatch({
          type: "SET_ERROR",
          error: "Não foi possível acessar a câmera. Verifique as permissões.",
        });
      }
    }
  }, [startScanning]);

  const customizeInterface = useCallback(() => {
    const style = document.createElement("style");
    style.textContent = `
      #leitor {
        border: none !important;
        padding: 0 !important;
        width: 100% !important;
      }
      
      #leitor__scan_region {
        padding: 0 !important;
        background: transparent !important;
        min-height: 300px !important;
        max-height: 70vh !important;
        display: block !important; /* Alterado para block */
        position: relative !important;
        margin: 1.5rem 0 !important;
      }
      
      #leitor__scan_region video {
        width: 100% !important;
        height: 300px !important; /* Altura fixa */
        object-fit: cover !important;
        border-radius: 12px !important;
        background: hsl(var(--muted)) !important;
      }
      
      /* Remove elementos desnecessários */
      #leitor__dashboard_section_swaplink,
      #leitor__dashboard_section_fileselection,
      #leitor__header_message,
      #leitor__status_span,
      #leitor__camera_permission_button,
      #leitor select,
      #leitor__scan_region_label,
      #leitor__filescan_input,
      #html5-qrcode-anchor-scan-type-change,
      #leitor__dashboard_section_csr span {
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
  
      #leitor__scan_region::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 200px;
        border: 2px solid hsl(var(--primary));
        border-radius: 12px;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 200, height: 200 },
      aspectRatio: 1.333333, // Relação 4:3
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      videoConstraints: {
        facingMode: "environment", // Removido exact para maior compatibilidade
        width: { min: 320, ideal: 720, max: 1280 },
        height: { min: 240, ideal: 540, max: 960 },
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
    <Card className="border-none bg-transparent shadow-none">
      <CardContent className="space-y-6 p-0">
        <div className="flex flex-col items-center gap-4">
          <QrCode className="h-12 w-12 text-primary" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Leitor QR Code
            </h2>
            <p className="text-sm text-muted-foreground">
              {state.isScanning
                ? "Posicione o QR Code na guia"
                : "Permita o acesso à câmera para iniciar"}
            </p>
          </div>
        </div>

        <div id="leitor" className="w-full">
          {!state.hasCameraPermission && (
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                {state.error || "Permita o acesso à câmera para continuar"}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-center">
          {!state.hasCameraPermission ? (
            <Button
              variant="default"
              size="lg"
              onClick={requestCameraPermission}
              className="min-w-[200px]"
            >
              <Camera className="mr-2 h-4 w-4" />
              Permitir Câmera
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              onClick={state.isScanning ? stopScanning : startScanning}
              className="min-w-[200px]"
            >
              {state.isScanning ? "Parar Leitura" : "Iniciar Leitura"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
