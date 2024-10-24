import { CheckCircle, XCircle, Loader } from 'lucide-react';
import useFacialRecognition from '../hooks/useFacialRecognition';

interface FacialRecognitionProps {
  onClose: () => void;
  useBackCamera?: boolean; // Prop para escolher câmera traseira ou frontal
}

const FacialRecognition = ({ onClose, useBackCamera = false }: FacialRecognitionProps) => {
  // Ajusta a configuração de câmera com base na prop `useBackCamera`
  const { videoRef, isVerified } = useFacialRecognition(onClose, useBackCamera);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      {isVerified === 'loading' ? (
        <div className="flex flex-col items-center text-center">
          <Loader className="w-16 h-16 md:w-20 md:h-20 text-white animate-spin mb-4" />
          <h2 className="text-lg md:text-2xl text-white">Verificando rosto...</h2>
        </div>
      ) : isVerified === 'approved' ? (
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-green-500 mb-4 animate-bounce" />
          <h2 className="text-xl md:text-3xl font-bold text-green-500 mb-2">Verificação Aprovada!</h2>
          <p className="text-base md:text-lg text-white">Solicitação enviada</p>
        </div>
      ) : isVerified === 'denied' ? (
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 md:w-20 md:h-20 text-red-500 mb-4 animate-bounce" />
          <h2 className="text-xl md:text-3xl font-bold text-red-500 mb-2">Verificação Negada!</h2>
          <p className="text-base md:text-lg text-white">Por favor, tente novamente.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 md:w-20 md:h-20 text-yellow-500 mb-4" />
          <h2 className="text-xl md:text-3xl font-bold text-yellow-500 mb-2">Nenhuma imagem cadastrada!</h2>
          <p className="text-base md:text-lg text-white">Por favor, registre fotos antes de tentar novamente.</p>
        </div>
      )}

      {isVerified === 'loading' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover absolute top-0 left-0"
        />
      )}
    </div>
  );
};

export default FacialRecognition;
