import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      className="flex items-center gap-2"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Voltar</span>
    </Button>
  );
};

export default BackButton;
