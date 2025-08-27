import { useEffect, useRef, useState, useCallback } from "react";
import {
  EstadosVerificacao,
  ResultadoVerificacao,
} from "@/types/reconhecimento-facial";
import { faceRecognitionService } from "@/services/face-recognition-service";
import { showErrorToast } from "@/components/ui/sonner";
import * as faceapi from "@vladmandic/face-api";
interface VerificationResult {
  similarity: number;
  label: string;
  confidence: number;
  processingTime: number;
  isMatch: boolean;
  distance?: number;
}

interface OpcoesChamadaRetorno {
  aoSucesso: (resultado: ResultadoVerificacao) => void;
  aoErro: (erro: Error) => void;
  funcionarioId: number;
}

interface RetornoUseReconhecimentoFacial {
  etapa: string;
  setEtapa: (etapa: string) => void;
  progresso: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  capturarEVerificar: (fotos: string[]) => Promise<void>;
  iniciarCamera: () => Promise<void>;
  pararCamera: () => void;
}

export function useReconhecimentoFacial({
  aoSucesso,
  aoErro,
  funcionarioId,
}: OpcoesChamadaRetorno): RetornoUseReconhecimentoFacial {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rostoDetectado, setRostoDetectado] = useState(false);
  const [etapa, setEtapa] = useState<string>(EstadosVerificacao.INICIAL);
  const [progresso, setProgresso] = useState(0);

  const intervalDeteccao = useRef<NodeJS.Timeout>();
  const timeoutVerificacao = useRef<NodeJS.Timeout>();

  const pararCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (intervalDeteccao.current) clearInterval(intervalDeteccao.current);
    if (timeoutVerificacao.current) clearTimeout(timeoutVerificacao.current);

    setRostoDetectado(false);
  }, []);

  const inicializarServico = useCallback(async () => {
    try {
      await faceRecognitionService.initialize();
      return true;
    } catch (_erro) {
      showErrorToast("Erro ao inicializar serviço de reconhecimento facial");
      return false;
    }
  }, []);

  const iniciarDeteccaoPosicao = useCallback(async () => {
    setEtapa(EstadosVerificacao.POSICIONANDO);

    intervalDeteccao.current = setInterval(async () => {
      if (!videoRef.current) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const imageData = canvas.toDataURL("image/jpeg", 0.7);

          const img = await faceapi.bufferToImage(
            await (await fetch(imageData)).blob(),
          );

          const deteccoes = await faceapi.detectAllFaces(
            img,
            new faceapi.TinyFaceDetectorOptions(),
          );

          const existeRostoDetectado = deteccoes.length === 1;
          setRostoDetectado(existeRostoDetectado);

          if (
            existeRostoDetectado &&
            etapa === EstadosVerificacao.POSICIONANDO
          ) {
            setEtapa(EstadosVerificacao.PRONTO);
          } else if (
            !existeRostoDetectado &&
            etapa === EstadosVerificacao.PRONTO
          ) {
            setEtapa(EstadosVerificacao.POSICIONANDO);
          }
        }
      } catch (_erro) {
        showErrorToast("Erro na detecção facial");
      }
    }, 300);
  }, [etapa]);

  const iniciarCamera = useCallback(async () => {
    try {
      const servicoInicializado = await inicializarServico();
      if (!servicoInicializado) {
        setEtapa(EstadosVerificacao.NEGADO);
        aoErro(
          new Error(
            "Não foi possível inicializar o serviço de reconhecimento facial",
          ),
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 15, max: 30 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await iniciarDeteccaoPosicao();
      }
    } catch (erro) {
      showErrorToast("Erro ao inicializar câmera");
      setEtapa(EstadosVerificacao.NEGADO);
      aoErro(erro instanceof Error ? erro : new Error(String(erro)));
    }
  }, [inicializarServico, iniciarDeteccaoPosicao, aoErro]);

  const capturarFoto = useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    const foto = canvas.toDataURL("image/jpeg", 0.8);

    return foto;
  }, [videoRef]);

  const capturarEVerificar = useCallback(
    async (fotos: string[]) => {
      if (!rostoDetectado) return;

      setEtapa(EstadosVerificacao.ESCANEANDO);
      if (intervalDeteccao.current) clearInterval(intervalDeteccao.current);

      try {
        let progressoAtual = 0;
        const intervaloProgresso = setInterval(() => {
          if (progressoAtual < 90) {
            progressoAtual += 10;
            setProgresso(progressoAtual);
          }
        }, 500);

        const fotosParaVerificar =
          fotos.length > 0
            ? fotos
            : ([capturarFoto()].filter(Boolean) as string[]);

        if (fotosParaVerificar.length === 0) {
          clearInterval(intervaloProgresso);
          setEtapa(EstadosVerificacao.NEGADO);
          pararCamera();
          aoErro(
            new Error("Não foi possível capturar imagens para verificação"),
          );
          return;
        }

        const resultado = (await faceRecognitionService.verifyMultipleFaces(
          fotosParaVerificar,
          funcionarioId.toString(),
        )) as VerificationResult;

        clearInterval(intervaloProgresso);
        setProgresso(100);

        const resultadoVerificacao: ResultadoVerificacao = {
          similaridade: resultado.similarity,
          rotulo: resultado.label,
          confianca: resultado.confidence,
          tempoProcessamento: resultado.processingTime,
          corresponde: resultado.isMatch,
          quantidadeImagensReferencia: fotosParaVerificar.length,
          timestamp: new Date().toISOString(),
          distancia: resultado.distance || 1 - resultado.similarity,
          imagemVerificacao: fotosParaVerificar[0],
          imagemCapturada: capturarFoto() || undefined,
        };

        const verificacaoSucesso = resultado.isMatch;
        setEtapa(
          verificacaoSucesso
            ? EstadosVerificacao.SUCESSO
            : EstadosVerificacao.FALHA,
        );

        if (verificacaoSucesso) {
          aoSucesso(resultadoVerificacao);
        } else {
          aoErro(
            new Error("Verificação facial falhou, similaridade insuficiente"),
          );
        }

        pararCamera();
      } catch (erro) {
        showErrorToast("Erro na verificação facial");
        setEtapa(EstadosVerificacao.NEGADO);
        pararCamera();
        aoErro(erro instanceof Error ? erro : new Error(String(erro)));
      }
    },
    [
      rostoDetectado,
      pararCamera,
      capturarFoto,
      funcionarioId,
      aoSucesso,
      aoErro,
    ],
  );

  useEffect(() => {
    return () => pararCamera();
  }, [pararCamera]);

  return {
    etapa,
    setEtapa,
    progresso,
    videoRef,
    capturarEVerificar,
    iniciarCamera,
    pararCamera,
  };
}
