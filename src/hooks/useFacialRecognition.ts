import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { loadLabeledImages, compareFaces } from '@/lib/cam-utils';

const useFacialRecognition = (onClose: (isApproved: boolean) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVerified, setIsVerified] = useState<'approved' | 'denied' | 'loading' | null>('loading');

  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Carregar os modelos de detecção facial
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

    // Iniciar a câmera traseira
    const startCamera = async () => {
      try {
        await loadModels();

        // Configuração de vídeo para a câmera traseira
        const videoConstraints: MediaStreamConstraints = {
          video: { facingMode: 'environment' }, // Força o uso da câmera traseira
        };

        const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        await runFaceDetection();
      } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        onClose(false);
      }
    };

    // Rodar a detecção de face
    const runFaceDetection = async () => {
      const labeledDescriptors = await loadLabeledImages();
      if (labeledDescriptors.length === 0) {
        setIsVerified(null);
        onClose(false);
        return;
      }

      timer = setTimeout(() => {
        setIsVerified('denied');
        stopCamera();
        onClose(false);
      }, 30000); // 30 segundos de timeout

      const detectFace = async () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length > 0 && detections[0].descriptor) {
          const match = compareFaces(labeledDescriptors, detections[0].descriptor);
          const isApproved = match ? 'approved' : 'denied';
          setIsVerified(isApproved);
          clearTimeout(timer);
          stopCamera();
          setTimeout(() => onClose(isApproved === 'approved'), 1000);
        } else {
          requestAnimationFrame(detectFace);
        }
      };

      detectFace();
    };

    // Parar a câmera
    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };

    startCamera();

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [onClose]);

  return { videoRef, isVerified };
};

export default useFacialRecognition;
