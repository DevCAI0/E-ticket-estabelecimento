import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Edit3,
  RefreshCw,
  Image,
} from "lucide-react";
import { PedidoSimplificado } from "@/types/pedidos";
import { PedidosAPI } from "@/api/pedidos";
import { showSuccessToast, showErrorToast } from "@/components/ui/sonner";

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoSimplificado | null;
  onPedidoEntregue?: () => void;
}

export function QRScannerDialog({
  open,
  onOpenChange,
  pedido,
  onPedidoEntregue,
}: QRScannerDialogProps) {
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const qrConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1,
    videoConstraints: {
      width: { min: 640, ideal: 1080, max: 1920 },
      height: { min: 480, ideal: 1080, max: 1080 },
      facingMode: "environment",
    },
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      #qr-reader-scanner video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        border-radius: 0.5rem !important;
      }
      #qr-reader-scanner {
        width: 100% !important;
        border: none !important;
        padding: 0 !important;
      }
      #qr-reader-scanner__scan_region {
        min-height: unset !important;
      }
      #qr-reader-scanner__dashboard {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!open && isMounted) {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {
          // Ignore errors during cleanup
        });
      }
      scannerRef.current = null;
      setScannerActive(false);
      setManualCode("");
      setShowManualInput(false);
      setScannerError(null);
      setLoading(false);
    }
  }, [open, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, []);

  const processQRCode = useCallback(
    async (qrCodeData: string) => {
      if (!pedido || !isMounted) return;

      try {
        setLoading(true);
        setScannerError(null);

        const response = await PedidosAPI.escanearQRCodeEEntregar(
          pedido.id,
          qrCodeData,
        );

        if (!isMounted) return;

        if (response.success) {
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
            setScannerActive(false);
          }
          showSuccessToast(response.message || "Pedido entregue com sucesso!");
          onPedidoEntregue?.();
          onOpenChange(false);
        } else {
          const errorMsg = response.message || "QR Code inválido";
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
            setScannerActive(false);
          }
          setScannerError(errorMsg);
          showErrorToast(errorMsg);
        }
      } catch (err) {
        if (!isMounted) return;

        const errorMsg =
          err instanceof Error ? err.message : "Erro ao processar QR Code";
        if (scannerRef.current?.isScanning) {
          try {
            await scannerRef.current.stop();
            setScannerActive(false);
          } catch {
            showErrorToast("Erro ao parar scanner");
          }
        }
        setScannerError(errorMsg);
        showErrorToast(errorMsg);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    },
    [pedido, onPedidoEntregue, onOpenChange, isMounted],
  );

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      await processQRCode(decodedText);
    },
    [processQRCode],
  );

  const startCamera = async () => {
    if (!isMounted) return;

    try {
      setScannerError(null);

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!isMounted) return;

      const scannerElement = document.getElementById("qr-reader-scanner");
      if (!scannerElement) {
        setScannerError(
          "Elemento DOM não encontrado. Aguarde e tente novamente.",
        );
        return;
      }

      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current = null;
      }

      try {
        scannerRef.current = new Html5Qrcode("qr-reader-scanner");
      } catch (error) {
        setScannerError(
          `Erro ao inicializar scanner: ${error instanceof Error ? error.message : "Desconhecido"}`,
        );
        return;
      }

      if (!isMounted) return;

      setScannerActive(true);

      try {
        await scannerRef.current.start(
          { facingMode: "environment" },
          qrConfig,
          handleScanSuccess,
          () => {},
        );
      } catch (primaryError) {
        try {
          const fallbackConfig = {
            ...qrConfig,
            videoConstraints: {
              ...qrConfig.videoConstraints,
              facingMode: "user",
            },
          };

          await scannerRef.current?.start(
            { facingMode: "user" },
            fallbackConfig,
            handleScanSuccess,
            () => {},
          );
          if (isMounted) {
            setScannerActive(true);
          }
        } catch {
          if (isMounted) {
            const errorMsg =
              primaryError instanceof Error
                ? primaryError.message
                : "Erro desconhecido";
            if (
              errorMsg.includes("Permission denied") ||
              errorMsg.includes("NotAllowedError")
            ) {
              setScannerError(
                "Permissão de câmera negada. Permita o acesso à câmera nas configurações do navegador.",
              );
            } else if (
              errorMsg.includes("NotFoundError") ||
              errorMsg.includes("DevicesNotFoundError")
            ) {
              setScannerError("Nenhuma câmera encontrada no dispositivo.");
            } else if (
              errorMsg.includes("NotReadableError") ||
              errorMsg.includes("TrackStartError")
            ) {
              setScannerError("Câmera está sendo usada por outro aplicativo.");
            } else {
              setScannerError(`Erro ao acessar câmera: ${errorMsg}`);
            }
            setScannerActive(false);
          }
        }
      }
    } catch (generalError) {
      if (isMounted) {
        setScannerError(
          `Erro geral: ${generalError instanceof Error ? generalError.message : "Desconhecido"}`,
        );
        setScannerActive(false);
      }
    }
  };

  const stopCamera = async () => {
    if (!scannerRef.current) return;

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      if (isMounted) {
        setScannerActive(false);
      }
    } catch {
      if (isMounted) {
        setScannerActive(false);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isMounted) return;

    try {
      setLoading(true);
      setScannerError(null);

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!isMounted) return;

      const scannerElement = document.getElementById("qr-reader-scanner");
      if (!scannerElement) {
        setScannerError("Elemento DOM não encontrado para processar imagem.");
        setLoading(false);
        return;
      }

      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current = null;
      }

      try {
        scannerRef.current = new Html5Qrcode("qr-reader-scanner");
      } catch (error) {
        setScannerError(
          `Erro ao inicializar scanner para imagem: ${error instanceof Error ? error.message : "Desconhecido"}`,
        );
        setLoading(false);
        return;
      }

      if (!isMounted) return;

      const decodedText = await scannerRef.current.scanFile(file, true);
      await processQRCode(decodedText);
    } catch (error) {
      if (!isMounted) return;

      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      if (
        errorMessage.includes(
          "No MultiFormat Readers were able to detect the code",
        )
      ) {
        setScannerError("Nenhum QR Code encontrado na imagem selecionada.");
        showErrorToast(
          "Nenhum QR code encontrado na imagem. Tente outra imagem ou use a câmera.",
        );
      } else if (errorMessage.includes("Invalid image format")) {
        setScannerError("Formato de imagem inválido. Use JPG, PNG ou similar.");
        showErrorToast("Formato de imagem inválido. Tente com JPG ou PNG.");
      } else {
        setScannerError(`Erro ao processar imagem: ${errorMessage}`);
        showErrorToast("Erro ao processar imagem. Tente novamente.");
      }
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      showErrorToast("Digite o código do QR ou cole os dados");
      return;
    }
    await processQRCode(manualCode.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  const handleClose = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    if (isMounted) {
      setScannerActive(false);
    }
    onOpenChange(false);
  };

  if (!pedido) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent className="mx-auto max-h-[90vh] w-[95vw] max-w-sm overflow-hidden bg-card text-card-foreground">
        <DialogHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-center">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Escanear QR Code
            </DialogTitle>
          </div>

          <DialogDescription asChild>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">
                    #{pedido.codigo_pedido}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">
                    {pedido.restaurante?.nome || pedido.estabelecimento?.nome}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pedido.total_itens} ticket(s) • {pedido.status_texto}
                  </div>
                </div>
                <Badge className="ml-2 shrink-0 bg-orange-500 text-white hover:bg-orange-600">
                  {pedido.status_texto}
                </Badge>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[55vh] flex-col space-y-2 overflow-y-auto">
          {!showManualInput ? (
            <div className="space-y-3">
              <div className="relative">
                <div className="mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border border-border bg-muted">
                  {scannerActive ? (
                    <div className="relative h-full w-full">
                      <div id="qr-reader-scanner" className="h-full w-full" />

                      <div className="absolute left-4 top-4 z-10 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-orange-500" />
                      <div className="absolute right-4 top-4 z-10 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-orange-500" />
                      <div className="absolute bottom-4 left-4 z-10 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-orange-500" />
                      <div className="absolute bottom-4 right-4 z-10 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-orange-500" />

                      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transform">
                        <p className="rounded bg-black/70 px-3 py-1 text-xs text-white">
                          Posicione o QR Code na área marcada
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <div
                        id="qr-reader-scanner"
                        className="pointer-events-none absolute inset-0 opacity-0"
                      />

                      <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
                      {scannerError ? (
                        <div className="space-y-3">
                          <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-red-400">
                              Erro:
                            </p>
                            <p className="break-words text-xs leading-relaxed text-red-300">
                              {scannerError}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={startCamera}
                              disabled={loading}
                              size="sm"
                              className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Tentando...
                                </>
                              ) : (
                                "Tentar Novamente"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleClose}
                              disabled={loading}
                              size="sm"
                              className="flex-1 text-muted-foreground"
                            >
                              Sair
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-foreground">
                            Clique para ativar a câmera
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Posicione o QR Code do cliente na câmera
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {!scannerActive ? (
                  <>
                    <Button
                      onClick={startCamera}
                      disabled={loading}
                      className="flex items-center justify-center bg-orange-500 p-4 text-white hover:bg-orange-600"
                    >
                      <Camera className="h-6 w-6" />
                    </Button>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="file-input-scanner"
                      onChange={handleFileInput}
                      disabled={loading}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("file-input-scanner")?.click()
                      }
                      disabled={loading}
                      className="flex items-center justify-center p-4 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Image className="h-6 w-6" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowManualInput(true)}
                      disabled={loading}
                      className="flex items-center justify-center p-4 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                    >
                      <Edit3 className="h-6 w-6" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                    disabled={loading}
                    className="col-span-3 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Parar Câmera
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-2">
                <Label
                  htmlFor="manual-code"
                  className="text-sm font-medium text-foreground"
                >
                  Cole ou digite o código do QR:
                </Label>
                <Input
                  id="manual-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Cole ou digite os dados do QR Code..."
                  disabled={loading}
                  className="border-input bg-input font-mono text-sm text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Aceita tanto o código do pedido quanto os dados completos do
                  QR Code
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowManualInput(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={loading || !manualCode.trim()}
                  className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Validar
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground"
                  size="sm"
                >
                  Sair
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-orange-600 bg-orange-500/10 p-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
                <div className="text-sm">
                  <p className="font-medium text-orange-400">
                    Processando entrega...
                  </p>
                  <p className="text-xs text-orange-300">
                    Validando QR Code e marcando como entregue
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
