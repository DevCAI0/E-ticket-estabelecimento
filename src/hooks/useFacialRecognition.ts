import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { loadLabeledImages, compareFaces } from '@/lib/cam-utils';

const useFacialRecognition = (
  onClose: (isApproved: boolean) => void,
  facingMode: 'user' | 'environment' = 'user' // Define o modo de câmera
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVerified, setIsVerified] = useState<'approved' | 'denied' | 'loading' | null>('loading');

  useEffect(() => {
    let timer: NodeJS.Timeout;

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
        alert('Erro ao carregar os modelos de reconhecimento facial.');
        onClose(false);
      }
    };

    const startCamera = async () => {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode }, // Usa o modo de câmera especificado
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        await runFaceDetection();
      } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        alert('Não foi possível acessar a câmera.');
        onClose(false);
      }
    };

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
      }, 30000);

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
  }, [onClose, facingMode]);

  return { videoRef, isVerified };
};

export default useFacialRecognition;
