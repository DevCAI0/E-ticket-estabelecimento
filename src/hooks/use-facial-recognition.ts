import { useState, useRef, useCallback, useEffect } from "react";
import {
  ResultadoVerificacao,
  EtapaVerificacao,
} from "../types/reconhecimento-facial";
import { servicoReconhecimentoFacial } from "../services/servico-reconhecimento-facial";

interface PropsReconhecimentoFacial {
  aoSucesso?: (resultado: ResultadoVerificacao) => void;
  aoErro?: (erro: Error) => void;
  userId?: string;
}

interface RetornoReconhecimentoFacial {
  etapa: EtapaVerificacao;
  definirEtapa: (etapa: EtapaVerificacao) => void;
  progresso: number;
  definirProgresso: (progresso: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  capturarEVerificar: (fotos: string[], userId: string) => Promise<void>;
  iniciarCamera: () => Promise<void>;
  pararCamera: () => void;
  sistemaOtimizado: boolean;
  tempoEstimado: string;
  otimizarSistema: (userId: string) => Promise<void>;
  statusCache: {
    temCache: boolean;
    valido: boolean;
    descriptorsCount: number;
    imagesCount: number;
    tempoRestante: number;
  };
}

export const useReconhecimentoFacial = ({
  aoSucesso,
  aoErro,
  userId,
}: PropsReconhecimentoFacial = {}): RetornoReconhecimentoFacial => {
  const [etapa, definirEtapa] = useState<EtapaVerificacao>("INICIAL");
  const [progresso, definirProgresso] = useState(0);
  const [sistemaOtimizado, setSistemaOtimizado] = useState(false);
  const [tempoEstimado, setTempoEstimado] = useState("5-8s");
  const [statusCache, setStatusCache] = useState({
    temCache: false,
    valido: false,
    descriptorsCount: 0,
    imagesCount: 0,
    tempoRestante: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const verificarStatusSistema = useCallback((targetUserId: string) => {
    if (!targetUserId) return;

    const preCarregado =
      servicoReconhecimentoFacial.funcionarioPreCarregado(targetUserId);
    const tempo =
      servicoReconhecimentoFacial.estimarTempoVerificacao(targetUserId);
    const statusSistema = servicoReconhecimentoFacial.obterStatusSistema();

    setSistemaOtimizado(preCarregado && statusSistema.modelosCarregados);
    setTempoEstimado(tempo);

    setStatusCache({
      temCache: preCarregado,
      valido: preCarregado,
      descriptorsCount: statusSistema.usuariosEmCache > 0 ? 1 : 0,
      imagesCount: 0,
      tempoRestante: statusSistema.tempoRestanteCache[targetUserId] || 0,
    });
  }, []);

  useEffect(() => {
    if (userId) {
      verificarStatusSistema(userId);
    }
  }, [userId, verificarStatusSistema]);

  const otimizarSistema = useCallback(
    async (targetUserId: string) => {
      if (!targetUserId) return;

      try {
        const sucesso =
          await servicoReconhecimentoFacial.preCarregarDadosFuncionario(
            targetUserId,
          );
        if (sucesso) {
          verificarStatusSistema(targetUserId);
        }
      } catch {
        // Silent fail
      }
    },
    [verificarStatusSistema],
  );

  const iniciarCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (erro) {
      aoErro?.(erro as Error);
    }
  }, [aoErro]);

  const pararCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturarEVerificar = useCallback(
    async (fotos: string[], targetUserId: string) => {
      if (!targetUserId) {
        throw new Error("ID do usuário é obrigatório");
      }

      const tempoInicio = performance.now();
      let idTimeout: NodeJS.Timeout | undefined;

      try {
        definirEtapa("COMPARANDO");
        definirProgresso(20);

        const timeoutDuration = sistemaOtimizado ? 30000 : 60000;

        const promessaVerificacao = new Promise<ResultadoVerificacao>(
          (resolve, reject) => {
            (async () => {
              try {
                const melhorFoto = fotos[0];

                definirProgresso(40);

                const descritor =
                  await servicoReconhecimentoFacial.processarImagemCapturada(
                    melhorFoto,
                  );

                if (!descritor) {
                  throw new Error("Nenhum rosto detectado na imagem");
                }

                definirProgresso(65);

                const imagensReferencia =
                  await servicoReconhecimentoFacial.carregarImagensDeReferenciaPorId(
                    targetUserId,
                  );

                if (imagensReferencia.length === 0) {
                  throw new Error(
                    "Nenhuma imagem de referência encontrada para comparação",
                  );
                }

                definirProgresso(85);

                const melhorCorrespondencia =
                  servicoReconhecimentoFacial.compararFace(
                    descritor,
                    imagensReferencia,
                    0.6,
                  );

                const similaridade = (1 - melhorCorrespondencia.distance) * 100;

                definirProgresso(100);

                const resultado: ResultadoVerificacao = {
                  corresponde: melhorCorrespondencia.label !== "unknown",
                  rotulo: melhorCorrespondencia.label,
                  similaridade,
                  confianca: 50,
                  tempoProcessamento: performance.now() - tempoInicio,
                  quantidadeImagensReferencia: imagensReferencia.length,
                  timestamp: new Date().toISOString(),
                  distancia: melhorCorrespondencia.distance,
                };

                resolve(resultado);
              } catch (erro) {
                reject(erro);
              }
            })();
          },
        );

        const promessaTimeout = new Promise((_, reject) => {
          idTimeout = setTimeout(() => {
            reject(
              new Error(
                `Tempo limite de verificação excedido (${timeoutDuration / 1000}s)`,
              ),
            );
          }, timeoutDuration);
        });

        const resultado = (await Promise.race([
          promessaVerificacao,
          promessaTimeout,
        ])) as ResultadoVerificacao;

        if (
          resultado.corresponde &&
          resultado.similaridade > resultado.confianca
        ) {
          definirEtapa("SUCESSO");

          if (!sistemaOtimizado && targetUserId) {
            servicoReconhecimentoFacial
              .preCarregarDadosFuncionario(targetUserId)
              .then(() => {
                verificarStatusSistema(targetUserId);
              })
              .catch(() => {
                // Silent fail
              });
          }

          aoSucesso?.(resultado);
        } else {
          throw new Error(
            `Verificação falhou: Similaridade: ${resultado.similaridade.toFixed(2)}%, Necessário: ${resultado.confianca}%`,
          );
        }
      } catch (erro) {
        definirEtapa("FALHA");
        aoErro?.(erro as Error);
      } finally {
        if (idTimeout) {
          clearTimeout(idTimeout);
        }
      }
    },
    [aoSucesso, aoErro, sistemaOtimizado, verificarStatusSistema],
  );

  return {
    etapa,
    definirEtapa,
    progresso,
    definirProgresso,
    videoRef,
    capturarEVerificar,
    iniciarCamera,
    pararCamera,
    sistemaOtimizado,
    tempoEstimado,
    otimizarSistema,
    statusCache,
  };
};
