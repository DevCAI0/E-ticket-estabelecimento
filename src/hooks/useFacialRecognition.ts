import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { VerificationState, VerificationStates } from "@/types/verification";
import { SelectionState } from "@/types/releases";
import { compareFaces, loadLabeledImages } from "@/utils/utils";
import { useReleases } from "@/hooks/useReleases";

interface VerificationStatus {
  isMatch: boolean;
  similarity: number;
  label?: string;
  processingTime?: number;
}

interface UseFacialRecognitionReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  verificationState: VerificationState;
  faceDetected: boolean;
  verificationStatus: VerificationStatus;
  startVerification: () => void;
  stopCamera: () => void;
  initializeCamera: () => Promise<void>;
}

export function useFacialRecognition(
  selection: SelectionState,
  onVerificationComplete?: (isApproved: boolean) => void,
): UseFacialRecognitionReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationState, setVerificationState] = useState<VerificationState>(
    VerificationStates.PREPARING,
  );
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>({
      isMatch: false,
      similarity: 0,
    });
  const { solicitarTicket } = useReleases();

  const detectionInterval = useRef<NodeJS.Timeout>();
  const verificationTimeout = useRef<NodeJS.Timeout>();

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (detectionInterval.current) clearInterval(detectionInterval.current);
    if (verificationTimeout.current) clearTimeout(verificationTimeout.current);
    setFaceDetected(false);
    setVerificationState(VerificationStates.PREPARING);
  };

  const loadModels = async () => {
    const MODEL_URL = "/models";
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      return true;
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
      return false;
    }
  };

  const startPositionDetection = async () => {
    setVerificationState(VerificationStates.POSITIONING);

    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current) return;

      try {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions(),
        );

        const isFaceDetected = detections.length === 1;
        setFaceDetected(isFaceDetected);

        if (
          isFaceDetected &&
          verificationState === VerificationStates.POSITIONING
        ) {
          setVerificationState(VerificationStates.READY);
        } else if (
          !isFaceDetected &&
          verificationState === VerificationStates.READY
        ) {
          setVerificationState(VerificationStates.POSITIONING);
        }
      } catch (error) {
        console.error("Erro na detecção:", error);
      }
    }, 200);
  };

  const initializeCamera = async () => {
    try {
      const modelsLoaded = await loadModels();
      if (!modelsLoaded) {
        setVerificationState(VerificationStates.DENIED);
        onVerificationComplete?.(false);
        return;
      }

      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await startPositionDetection();
        }
      } catch {
        // Fallback para qualquer câmera se a traseira falhar
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await startPositionDetection();
        }
      }
    } catch (error) {
      console.error("Erro ao inicializar câmera:", error);
      setVerificationState(VerificationStates.DENIED);
      onVerificationComplete?.(false);
    }
  };

  const startVerification = async () => {
    if (!faceDetected) return;

    setVerificationState(VerificationStates.SCANNING);
    if (detectionInterval.current) clearInterval(detectionInterval.current);

    try {
      const labeledDescriptors = await loadLabeledImages();
      if (!labeledDescriptors.length) {
        setVerificationState(VerificationStates.NOT_REGISTERED);
        stopCamera();
        onVerificationComplete?.(false);
        return;
      }

      verificationTimeout.current = setTimeout(() => {
        setVerificationState(VerificationStates.DENIED);
        stopCamera();
        onVerificationComplete?.(false);
      }, 30000);

      const verify = async () => {
        if (!videoRef.current) return;

        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions(),
          )
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length > 0 && detections[0].descriptor) {
          const result = await compareFaces(
            labeledDescriptors,
            detections[0].descriptor,
            solicitarTicket,
            selection,
          );

          setVerificationStatus({
            isMatch: result.isMatch,
            similarity: result.similarity,
            label: result.label,
            processingTime: result.processingTime,
          });

          const isApproved = result.isMatch;
          setVerificationState(
            isApproved
              ? VerificationStates.APPROVED
              : VerificationStates.DENIED,
          );

          stopCamera();
          onVerificationComplete?.(isApproved);
        } else {
          requestAnimationFrame(verify);
        }
      };

      verify();
    } catch (error) {
      console.error("Erro na verificação:", error);
      setVerificationState(VerificationStates.DENIED);
      stopCamera();
      onVerificationComplete?.(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return {
    videoRef,
    verificationState,
    faceDetected,
    verificationStatus,
    startVerification,
    stopCamera,
    initializeCamera,
  };
}
