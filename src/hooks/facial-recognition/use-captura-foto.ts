// hooks/use-captura-foto.ts
import { useCallback, useState } from "react";

const NUMERO_FOTOS = 3;

export function useCapturaDeFotos() {
  const [fotosTiradas, setFotosTiradas] = useState(0);
  const [fotosCapturedas, setFotosCapturedas] = useState<string[]>([]);

  const resetarFotos = useCallback(() => {
    setFotosTiradas(0);
    setFotosCapturedas([]);
  }, []);

  const capturarFoto = useCallback(
    async (videoRef: React.RefObject<HTMLVideoElement>) => {
      if (!videoRef.current) return null;

      const canvas = document.createElement("canvas");
      canvas.setAttribute("willReadFrequently", "true");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;

      ctx.drawImage(videoRef.current, 0, 0);
      const foto = canvas.toDataURL("image/jpeg", 0.8);

      setFotosCapturedas((prev) => [...prev, foto]);
      setFotosTiradas((prev) => prev + 1);
      return foto;
    },
    [],
  );

  return {
    fotosTiradas,
    fotosCapturedas,
    capturarFoto,
    resetarFotos,
    NUMERO_FOTOS,
  };
}
