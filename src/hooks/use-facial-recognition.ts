import { useState, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";
import { VerificationResult, VerificationStep } from "@/types/face-recognition";
import { faceRecognitionService } from "../services/face-recognition-service";

interface UseFacialRecognitionProps {
  onSuccess?: (result: VerificationResult) => void;
  onError?: (error: Error) => void;
  funcionarioId: number;
}

interface UseFacialRecognitionReturn {
  step: VerificationStep;
  setStep: (step: VerificationStep) => void;
  progress: number;
  setProgress: (progress: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  captureAndVerify: (photos: string[]) => Promise<void>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  isFrontCamera: boolean;
  handleCameraSwitch: (checked: boolean) => Promise<void>;
}

export const useFacialRecognition = ({
  onSuccess,
  onError,
  funcionarioId,
}: UseFacialRecognitionProps): UseFacialRecognitionReturn => {
  const [step, setStep] = useState<VerificationStep>("INITIAL");
  const [progress, setProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null); // Adicionar esta linha
  const streamRef = useRef<MediaStream | null>(null);

  // const checkCameraAvailability = async (
  //   facingMode: string,
  // ): Promise<boolean> => {
  //   try {
  //     // Primeiro tenta com exact
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: { facingMode: { exact: facingMode } },
  //       });
  //       stream.getTracks().forEach((track) => track.stop());
  //       return true;
  //     } catch {
  //       // Se falhar com exact, tenta sem exact
  //       const fallbackStream = await navigator.mediaDevices.getUserMedia({
  //         video: { facingMode },
  //       });
  //       fallbackStream.getTracks().forEach((track) => track.stop());
  //       return true;
  //     }
  //   } catch {
  //     return false;
  //   }
  // };
  const startCamera = useCallback(async () => {
    try {
      console.log(
        "📸 Iniciando câmera com modo:",
        isFrontCamera ? "frontal" : "traseira",
      );

      // Tenta obter a lista de câmeras disponíveis
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");

      // Se não houver câmeras, lança erro
      if (cameras.length === 0) {
        throw new Error("Nenhuma câmera encontrada no dispositivo");
      }

      // Se só tem uma câmera, usa ela independente da seleção
      if (cameras.length === 1) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        return;
      }

      // Se tem mais de uma câmera, tenta usar a selecionada
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        console.log("✅ Câmera iniciada com sucesso!");
      }
    } catch (err) {
      console.error("❌ Erro ao iniciar câmera:", err);
      throw new Error("Não foi possível acessar a câmera selecionada");
    }
  }, [isFrontCamera]);

  const handleCameraSwitch = async (checked: boolean) => {
    try {
      // Para a câmera atual
      await stopCamera();

      // Aguarda um momento para garantir que a câmera anterior foi fechada
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Atualiza o estado
      setIsFrontCamera(checked);

      // Aguarda mais um momento antes de iniciar a nova câmera
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Tenta iniciar a nova câmera
      await startCamera();
    } catch (error) {
      // Em caso de erro, tenta reverter para a câmera anterior
      setIsFrontCamera(!checked);
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        await startCamera();
      } catch {
        onError?.(
          new Error(
            "Erro ao acessar as câmeras. Por favor, recarregue a página.",
          ),
        );
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureAndVerify = useCallback(
    async (photos: string[]) => {
      if (!funcionarioId) {
        throw new Error("ID do funcionário não fornecido");
      }

      if (!isInitialized) {
        await faceRecognitionService.initialize();
        setIsInitialized(true);
      }

      const startTime = performance.now();
      let timeoutId: NodeJS.Timeout | undefined;

      try {
        setStep("COMPARING");
        setProgress(33);

        const verificationPromise = new Promise((resolve, reject) => {
          const processVerification = async () => {
            try {
              const bestPhoto = photos[0];
              const img = new Image();
              await new Promise((res) => {
                img.onload = res;
                img.src = bestPhoto;
              });

              const canvas = document.createElement("canvas");
              const maxSize = 320;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                height *= maxSize / width;
                width = maxSize;
              } else {
                width *= maxSize / height;
                height = maxSize;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);

              setProgress(50);

              const detectOptions = new faceapi.TinyFaceDetectorOptions({
                inputSize: 416, // Aumentar para melhor detecção
                scoreThreshold: 0.2, // Diminuir para mais sensibilidade
              });

              const detection = await faceapi
                .detectSingleFace(canvas, detectOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

              if (!detection) {
                throw new Error("Nenhum rosto detectado na imagem");
              }

              setProgress(75);

              const referenceImages =
                await faceRecognitionService.loadReferenceImagesById(
                  funcionarioId.toString(),
                );
              console.log("Imagens de referência:", referenceImages);
              if (referenceImages.length === 0) {
                throw new Error(
                  "Nenhuma imagem de referência encontrada para comparação",
                );
              }
              const faceMatcher = new faceapi.FaceMatcher(referenceImages, 0.6);

              const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
              const similarity = (1 - bestMatch.distance) * 100;

              setProgress(100);

              const result: VerificationResult = {
                isMatch: bestMatch.label !== "unknown",
                label: bestMatch.label,
                similarity,
                confidence: 50,
                processingTime: performance.now() - startTime,
                referenceImagesCount: referenceImages.length,
                timestamp: new Date().toISOString(),
                distance: bestMatch.distance,
              };

              resolve(result);
            } catch (error) {
              reject(error);
            }
          };

          processVerification();
        });

        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Tempo limite de verificação excedido (3s)"));
          }, 60000);
        });

        const result = (await Promise.race([
          verificationPromise,
          timeoutPromise,
        ])) as VerificationResult;

        console.log("\n🔍 RESULTADO DA VERIFICAÇÃO:");
        console.log(`- Similaridade: ${result.similarity.toFixed(2)}%`);
        console.log(`- Pessoa identificada: ${result.label}`);
        console.log(
          `- Tempo de processamento: ${result.processingTime.toFixed(0)}ms`,
        );
        console.log(`- Número de referências: ${result.referenceImagesCount}`);

        if (result.isMatch && result.similarity > result.confidence) {
          setStep("SUCCESS");
          onSuccess?.(result);
        } else {
          throw new Error(
            `Verificação falhou:\n` +
              `- Similaridade: ${result.similarity.toFixed(2)}%\n` +
              `- Necessário: ${result.confidence}%`,
          );
        }
      } catch (error) {
        console.error("❌ Erro na verificação:", error);
        setStep("FAILED");
        onError?.(error as Error);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    },
    [isInitialized, onSuccess, onError, funcionarioId],
  );

  return {
    step,
    setStep,
    progress,
    setProgress,
    videoRef,
    captureAndVerify,
    startCamera,
    stopCamera,
    isFrontCamera,
    handleCameraSwitch,
  };
};
