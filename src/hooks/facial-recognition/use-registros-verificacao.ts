// src/hooks/facial-recognition/use-registros-verificacao.ts
import { RegistroVerificacao } from "@/types/reconhecimento-facial";
import { useState, useCallback } from "react";

interface UseRegistrosVerificacao {
  registros: RegistroVerificacao[];
  adicionarRegistro: (
    tipo: RegistroVerificacao["tipo"],
    mensagem: string,
    detalhes?: string,
  ) => void;
  limparRegistros: () => void;
  obterRegistroPorId: (id: string) => RegistroVerificacao | undefined;
}

export function useRegistrosVerificacao(): UseRegistrosVerificacao {
  const [registros, setRegistros] = useState<RegistroVerificacao[]>([]);

  const adicionarRegistro = useCallback(
    (
      tipo: RegistroVerificacao["tipo"],
      mensagem: string,
      detalhes?: string,
    ) => {
      const timestamp = new Date().toLocaleTimeString();
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const novoRegistro: RegistroVerificacao = {
        id,
        tipo,
        mensagem,
        timestamp,
        detalhes,
      };

      setRegistros((prev) => [...prev, novoRegistro]);
    },
    [],
  );

  const limparRegistros = useCallback(() => {
    setRegistros([]);
  }, []);

  const obterRegistroPorId = useCallback(
    (id: string) => {
      return registros.find((registro) => registro.id === id);
    },
    [registros],
  );

  return {
    registros,
    adicionarRegistro,
    limparRegistros,
    obterRegistroPorId,
  };
}
