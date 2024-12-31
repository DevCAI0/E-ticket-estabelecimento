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
      const currentMode = isFrontCamera ? "frontal" : "traseira";
      console.log(`📸 Iniciando câmera ${currentMode}...`);

      // Primeiro, para a câmera atual se estiver rodando
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }

      // Tenta iniciar com a câmera desejada
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isFrontCamera ? "user" : "environment",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          console.log(`✅ Câmera ${currentMode} iniciada com sucesso!`);
        }
      } catch (initialError) {
        // Se falhar e estiver tentando usar a câmera traseira, tenta a frontal
        if (!isFrontCamera) {
          throw initialError; // Propaga o erro para câmera traseira
        }

        // Para câmera frontal, tenta um fallback mais simples
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          streamRef.current = fallbackStream;
          console.log("✅ Câmera iniciada com configuração básica");
        }
      }
    } catch (err) {
      console.error("❌ Erro ao iniciar câmera:", err);
      onError?.(
        new Error(
          `Não foi possível acessar a câmera ${isFrontCamera ? "frontal" : "traseira"}`,
        ),
      );
    }
  }, [isFrontCamera, onError]);

  const handleCameraSwitch = async (checked: boolean) => {
    try {
      // Não faz nada se tentar mudar para o mesmo modo
      if (checked === isFrontCamera) return;

      console.log(
        `🔄 Alternando para câmera ${checked ? "frontal" : "traseira"}...`,
      );

      // Para a câmera atual
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }

      // Atualiza o estado
      setIsFrontCamera(checked);

      // Aguarda para garantir que a câmera anterior foi fechada
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Inicia a nova câmera
      await startCamera().catch((error) => {
        console.error("Erro ao trocar câmera, revertendo...", error);
        setIsFrontCamera(!checked); // Reverte o estado
        startCamera(); // Tenta reiniciar com a câmera anterior
        throw error;
      });
    } catch (error) {
      onError?.(
        new Error(
          `Não foi possível alternar para a câmera ${checked ? "frontal" : "traseira"}`,
        ),
      );
    }
  };

  const stopCamera = useCallback(() => {
    console.log("🛑 Parando câmera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
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
