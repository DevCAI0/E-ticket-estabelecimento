import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { loadLabeledImages, compareFaces } from '@/lib/cam-utils';

const useFacialRecognition = (onClose: (isApproved: boolean) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVerified, setIsVerified] = useState<'approved' | 'denied' | 'loading' | null>('loading');
  const [progress, setProgress] = useState<number>(0); // Estado para progressão

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let detectionTimer: NodeJS.Timeout;
    
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        console.log('Modelos carregados com sucesso.');
      } catch (error) {
        console.error('Erro ao carregar os modelos:', error);
        onClose(false);
      }
    };

    const startCamera = async () => {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        startProgress(); // Iniciar o progresso
        runFaceDetection(); // Iniciar detecção de rosto
      } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        onClose(false);
      }
    };

    const startProgress = () => {
      let currentProgress = 0;
      progressTimer = setInterval(() => {
        if (currentProgress < 100) {
          currentProgress += 5;
          setProgress(currentProgress);
        }
      }, 300); // Atualiza a cada 300ms
    };

    const runFaceDetection = async () => {
      const labeledDescriptors = await loadLabeledImages();
      if (labeledDescriptors.length === 0) {
        setIsVerified(null);
        onClose(false);
        return;
      }
    
      let detectionInProgress = false; // Variável para evitar detecções simultâneas
    
      detectionTimer = setInterval(async () => {
        if (!videoRef.current || detectionInProgress) return;
    
        detectionInProgress = true; // Marcar que a detecção está em andamento
    
        const video = videoRef.current;
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
    
        if (detections.length > 0) {
          const match = compareFaces(labeledDescriptors, detections[0].descriptor);
    
          setProgress(100); // Atualiza o progresso para 100%
          setIsVerified(match ? 'approved' : 'denied');
          clearInterval(detectionTimer); // Parar a detecção após encontrar um rosto
          stopCamera();
          onClose(match); // Chamar o callback de resultado
    
          // Evitar exibições duplicadas
          detectionInProgress = false;
        } else {
          detectionInProgress = false;
        }
      }, 1000); // Rodar a cada 1 segundo
    };
    

    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      clearInterval(progressTimer);
      clearInterval(detectionTimer);
    };

    startCamera();

    return () => {
      clearInterval(progressTimer);
      clearInterval(detectionTimer);
      stopCamera();
    };
  }, [onClose]);

  return { videoRef, isVerified, progress };
};

export default useFacialRecognition;
