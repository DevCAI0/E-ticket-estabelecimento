import { CheckCircle, XCircle, Loader } from 'lucide-react';
import useFacialRecognition from '../hooks/useFacialRecognition';
import { toast } from 'sonner';

interface FacialRecognitionProps {
  onClose: (isApproved: boolean) => void;
}

const FacialRecognition = ({ onClose }: FacialRecognitionProps) => {
  const { videoRef, isVerified, progress } = useFacialRecognition(onClose);

  // Exibir toast ao concluir a verificação
  if (isVerified === 'approved') {
    toast.success('Verificação aprovada!');
  } else if (isVerified === 'denied') {
    toast.error('Verificação negada!');
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover absolute top-0 left-0"
      />

      <div className="relative w-full max-w-sm z-10">
        {isVerified === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <Loader className="w-16 h-16 text-white animate-spin mb-4" />
            <h2 className="text-lg md:text-2xl text-white">Verificando rosto...</h2>
          </div>
        )}

        {isVerified === 'approved' && (
          <div className="flex flex-col items-center text-center mt-4">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-green-500">Verificação Aprovada!</h2>
          </div>
        )}

        {isVerified === 'denied' && (
          <div className="flex flex-col items-center text-center mt-4">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-500">Verificação Negada!</h2>
          </div>
        )}
      </div>

      {isVerified === 'loading' && (
        <div className="fixed bottom-4 left-4 right-4 px-4">
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacialRecognition;
