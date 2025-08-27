import { useCallback, useState, useEffect, useRef } from "react";
import { Camera, Loader2, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { showErrorToast, showSuccessToast } from "@/components/ui/sonner";
import { useReconhecimentoFacial } from "@/hooks/use-facial-recognition";
import { servicoReconhecimentoFacial } from "@/services/servico-reconhecimento-facial";
import { ResultadoVerificacao } from "@/types/reconhecimento-facial";
import { api, apiImage } from "@/lib/axios";
import * as faceapi from "@vladmandic/face-api";
import CameraView from "./components/CameraView";
import ResultView from "./components/ResultView";

interface PosicionamentoRosto {
  dentroDoOval: boolean;
  rostoX: number;
  rostoY: number;
  tamanhoRosto: number;
}

interface Props {
  aberto?: boolean;
  aoSucesso?: (resultado: ResultadoVerificacao) => void;
  aoFechar?: () => void;
  userId: string;
  userName?: string;
}

interface PropsEn {
  open?: boolean;
  onSuccess?: (resultado: ResultadoVerificacao) => void;
  onClose?: () => void;
  userId: string;
  userName?: string;
}

interface ImagemReferencia {
  label: string;
  descriptors: Float32Array[];
}

const QUANTIDADE_FOTOS = 3;
const TEMPO_ESPERA_SEGUNDOS = 3;
const TEMPO_SORRISO_SEGUNDOS = 2;
const MAX_TENTATIVAS_OVAL = 2;
const MAX_CONTADOR_FORA_OVAL = 8;

const CONFIGURACAO_OVAL = {
  largura: 300,
  altura: 400,
};

const DialogoReconhecimentoFacial = (props: Props & PropsEn) => {
  const { aberto, aoSucesso, aoFechar, userId, userName } = props;

  const isOpen = props.open !== undefined ? props.open : aberto || false;
  const handleSuccess = props.onSuccess || aoSucesso;
  const handleClose = props.onClose || aoFechar;

  const [digitalizando, setDigitalizando] = useState(false);
  const [cameraPronta, setCameraPronta] = useState(false);
  const [detalhesVerificacao, setDetalhesVerificacao] =
    useState<ResultadoVerificacao | null>(null);
  const [fotosCapturadas, setFotosCapturadas] = useState(0);
  const [verificando, setVerificando] = useState(false);
  const [progressoLocal, setProgressoLocal] = useState(0);
  const [fotosArmazenadas, setFotosArmazenadas] = useState<string[]>([]);
  const [rostoDetectado, setRostoDetectado] = useState(false);
  const [contadorRegressivo, setContadorRegressivo] = useState(
    TEMPO_ESPERA_SEGUNDOS,
  );
  const [podeFechar, setPodeFechar] = useState(true);
  const [multiplasFacesDetectadas, setMultiplasFacesDetectadas] =
    useState(false);
  const [imagemCapturadaPrincipal, setImagemCapturadaPrincipal] = useState<
    string | null
  >(null);
  const [usuarioNaoIdentificado, setUsuarioNaoIdentificado] = useState(false);
  const [imagensReferenciaAPI, setImagensReferenciaAPI] = useState<string[]>(
    [],
  );
  const [funcionarioIdentificado, setFuncionarioIdentificado] = useState<{
    nome: string;
    foto: string;
  } | null>(null);
  const [imagensReferenciaCache, setImagensReferenciaCache] = useState<
    ImagemReferencia[]
  >([]);
  const [cacheCarregado, setCacheCarregado] = useState(false);
  const [etapaSorriso, setEtapaSorriso] = useState(false);
  const [sorrisoDetectado, setSorrisoDetectado] = useState(false);
  const [contadorSorriso, setContadorSorriso] = useState(
    TEMPO_SORRISO_SEGUNDOS,
  );
  const [aguardandoSorriso, setAguardandoSorriso] = useState(false);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [capturandoFotos, setCapturandoFotos] = useState(false);
  const [sistemaOtimizado, setSistemaOtimizado] = useState(false);
  const [posicionamentoRosto, setPosicionamentoRosto] =
    useState<PosicionamentoRosto | null>(null);
  const [_contadorForaDoOval, setContadorForaDoOval] = useState(0);
  const [tentativasOval, setTentativasOval] = useState(0);
  const [podeContinuarProcesso, setPodeContinuarProcesso] = useState(false);

  const detectorInterval = useRef<NodeJS.Timeout | null>(null);
  const contadorInterval = useRef<NodeJS.Timeout | null>(null);
  const sorrisoInterval = useRef<NodeJS.Timeout | null>(null);
  const verificacaoPresencaInterval = useRef<NodeJS.Timeout | null>(null);
  const ovalInterval = useRef<NodeJS.Timeout | null>(null);

  const pararMonitoramentoOval = useCallback(() => {
    if (ovalInterval.current) {
      clearInterval(ovalInterval.current);
      ovalInterval.current = null;
    }
    setPosicionamentoRosto(null);
    setContadorForaDoOval(0);
    setPodeContinuarProcesso(false);
  }, []);

  const pararDeteccaoSorriso = useCallback(() => {
    if (sorrisoInterval.current) {
      clearInterval(sorrisoInterval.current);
      sorrisoInterval.current = null;
    }
    if (contadorInterval.current) {
      clearInterval(contadorInterval.current);
      contadorInterval.current = null;
    }
    setEtapaSorriso(false);
    setAguardandoSorriso(false);
    setSorrisoDetectado(false);
    setContadorSorriso(TEMPO_SORRISO_SEGUNDOS);
  }, []);

  const {
    etapa,
    definirEtapa,
    progresso,
    videoRef,
    capturarEVerificar,
    iniciarCamera,
    pararCamera,
  } = useReconhecimentoFacial({
    userId,
    aoSucesso: (resultado: ResultadoVerificacao) => {
      pararMonitoramentoOval();
      setDetalhesVerificacao(resultado);
      setVerificando(false);
      setProgressoLocal(100);
      const tempoProcessamento = (resultado.tempoProcessamento / 1000).toFixed(
        1,
      );
      showSuccessToast(`Verificação concluída em ${tempoProcessamento}s!`);
      setDigitalizando(false);
      setPodeFechar(true);
      pararDeteccaoSorriso();
      if (!sistemaOtimizado && userId) {
        setTimeout(() => {
          otimizarSistema();
        }, 1000);
      }
      handleSuccess?.(resultado);
    },
    aoErro: (error: Error) => {
      pararMonitoramentoOval();
      setVerificando(false);
      setProgressoLocal(0);
      showErrorToast(error.message);
      setDigitalizando(false);
      setPodeFechar(true);
      pararDeteccaoSorriso();
    },
  });

  const analisarPosicionamentoOval =
    useCallback(async (): Promise<PosicionamentoRosto | null> => {
      if (!videoRef.current || !videoRef.current.videoWidth) {
        return null;
      }

      try {
        if (!faceapi.nets.tinyFaceDetector.isLoaded) {
          await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        }

        const video = videoRef.current;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const centerX = videoWidth / 2;
        const centerY = videoHeight / 2;

        const opcoes = new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.4,
        });

        const deteccao = await faceapi.detectSingleFace(video, opcoes);

        if (!deteccao) {
          return null;
        }

        const box = deteccao.box;
        const rostoX = box.x + box.width / 2;
        const rostoY = box.y + box.height / 2;
        const tamanhoRosto = Math.max(box.width, box.height);

        const ovalA = CONFIGURACAO_OVAL.largura / 2;
        const ovalB = CONFIGURACAO_OVAL.altura / 2;

        const dx = (rostoX - centerX) / ovalA;
        const dy = (rostoY - centerY) / ovalB;
        const distanciaDoOval = dx * dx + dy * dy;
        const dentroDoOval = distanciaDoOval <= 1;

        return {
          dentroDoOval,
          rostoX,
          rostoY,
          tamanhoRosto,
        };
      } catch {
        return null;
      }
    }, [videoRef]);

  const finalizarComErro = useCallback(
    (mensagem: string) => {
      if (detectorInterval.current) {
        clearInterval(detectorInterval.current);
        detectorInterval.current = null;
      }
      if (contadorInterval.current) {
        clearInterval(contadorInterval.current);
        contadorInterval.current = null;
      }
      if (sorrisoInterval.current) {
        clearInterval(sorrisoInterval.current);
        sorrisoInterval.current = null;
      }
      if (verificacaoPresencaInterval.current) {
        clearInterval(verificacaoPresencaInterval.current);
        verificacaoPresencaInterval.current = null;
      }

      pararMonitoramentoOval();
      setDigitalizando(false);
      setEtapaSorriso(false);
      setAguardandoSorriso(false);
      setSorrisoDetectado(false);
      setErroValidacao(mensagem);
      setPodeFechar(true);
      setCapturandoFotos(false);
      setPodeContinuarProcesso(false);

      showErrorToast(mensagem);
      definirEtapa("FALHA");
      pararCamera();
    },
    [definirEtapa, pararCamera, pararMonitoramentoOval],
  );

  const iniciarMonitoramentoOvalRef = useRef<(() => void) | null>(null);

  const resetarTentativaOval = useCallback(() => {
    setContadorForaDoOval(0);
    setEtapaSorriso(false);
    setAguardandoSorriso(false);
    setSorrisoDetectado(false);
    setContadorSorriso(TEMPO_SORRISO_SEGUNDOS);
    setPodeContinuarProcesso(false);
    pararDeteccaoSorriso();

    setTimeout(() => {
      if (funcionarioIdentificado && iniciarMonitoramentoOvalRef.current) {
        iniciarMonitoramentoOvalRef.current();
      }
    }, 1000);
  }, [funcionarioIdentificado, pararDeteccaoSorriso]);

  const iniciarMonitoramentoOval = useCallback(() => {
    if (ovalInterval.current) {
      clearInterval(ovalInterval.current);
    }

    setContadorForaDoOval(0);
    setPodeContinuarProcesso(false);

    ovalInterval.current = setInterval(async () => {
      const posicionamento = await analisarPosicionamentoOval();
      setPosicionamentoRosto(posicionamento);

      if (posicionamento) {
        if (posicionamento.dentroDoOval) {
          setContadorForaDoOval(0);
          setPodeContinuarProcesso(true);
        } else {
          setPodeContinuarProcesso(false);
          pararDeteccaoSorriso();
          setEtapaSorriso(false);
          setSorrisoDetectado(false);
          setContadorForaDoOval((prev) => {
            const novoContador = prev + 1;

            if (novoContador >= MAX_CONTADOR_FORA_OVAL) {
              const novasTentativas = tentativasOval + 1;
              setTentativasOval(novasTentativas);

              if (novasTentativas >= MAX_TENTATIVAS_OVAL) {
                finalizarComErro(
                  `Excedido o limite de tentativas. Você saiu da área Circulo ${MAX_TENTATIVAS_OVAL} vezes. Processo cancelado.`,
                );
              } else {
                showErrorToast(
                  `Tentativa ${novasTentativas}/${MAX_TENTATIVAS_OVAL}: Você saiu da área Circulo. Reposicione-se e tente novamente.`,
                );
                resetarTentativaOval();
              }
            }

            return novoContador;
          });
        }
      } else {
        setPodeContinuarProcesso(false);
        pararDeteccaoSorriso();
        setEtapaSorriso(false);
        setSorrisoDetectado(false);
        setContadorForaDoOval((prev) => {
          const novoContador = prev + 1;

          if (novoContador >= MAX_CONTADOR_FORA_OVAL) {
            const novasTentativas = tentativasOval + 1;
            setTentativasOval(novasTentativas);

            if (novasTentativas >= MAX_TENTATIVAS_OVAL) {
              finalizarComErro(
                `Excedido o limite de tentativas. Rosto perdido ${MAX_TENTATIVAS_OVAL} vezes. Processo cancelado.`,
              );
            } else {
              showErrorToast(
                `Tentativa ${novasTentativas}/${MAX_TENTATIVAS_OVAL}: Rosto perdido. Reposicione-se e tente novamente.`,
              );
              resetarTentativaOval();
            }
          }

          return novoContador;
        });
      }
    }, 300);
  }, [
    analisarPosicionamentoOval,
    tentativasOval,
    finalizarComErro,
    resetarTentativaOval,
    pararDeteccaoSorriso,
  ]);

  useEffect(() => {
    iniciarMonitoramentoOvalRef.current = iniciarMonitoramentoOval;
  });

  const verificarSistemaOtimizado = useCallback(() => {
    if (!userId) return;

    const cacheKey = `facial_optimized_${userId}`;
    const cacheData = localStorage.getItem(cacheKey);

    if (cacheData) {
      try {
        const cache = JSON.parse(cacheData);
        const agora = Date.now();
        const tempoDecorrido = agora - cache.timestamp;
        const cacheValido = tempoDecorrido < 30 * 60 * 1000;

        if (cacheValido && cacheCarregado) {
          setSistemaOtimizado(true);
        } else {
          setSistemaOtimizado(false);
        }
      } catch {
        setSistemaOtimizado(false);
      }
    } else {
      setSistemaOtimizado(false);
    }
  }, [userId, cacheCarregado]);

  const otimizarSistema = useCallback(async () => {
    if (!userId) return;

    try {
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      }

      if (!faceapi.nets.faceLandmark68Net.isLoaded) {
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      }

      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      }

      try {
        if (!faceapi.nets.faceExpressionNet.isLoaded) {
          await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        }
      } catch {
        // Silent fail
      }

      if (!cacheCarregado) {
        const imagens =
          await servicoReconhecimentoFacial.carregarImagensDeReferenciaPorId(
            userId,
          );
        setImagensReferenciaCache(imagens);
        setCacheCarregado(true);
      }

      const cacheKey = `facial_optimized_${userId}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          descriptorsCount: imagensReferenciaCache.length || 0,
        }),
      );

      verificarSistemaOtimizado();
    } catch {
      // Silent fail
    }
  }, [
    userId,
    cacheCarregado,
    imagensReferenciaCache,
    verificarSistemaOtimizado,
  ]);

  const capturarFoto = useCallback(async () => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("willReadFrequently", "true");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    const foto = canvas.toDataURL("image/jpeg", 0.8);

    if (fotosArmazenadas.length === 0) {
      setImagemCapturadaPrincipal(foto);
    }

    setFotosArmazenadas((prev) => [...prev, foto]);
    return foto;
  }, [videoRef, fotosArmazenadas]);

  const converterImagemParaBase64 = useCallback(
    async (url: string): Promise<string | null> => {
      try {
        const response = await apiImage.get(url, {
          responseType: "blob",
          timeout: 10000,
        });

        const blob = response.data;

        if (!blob || blob.size === 0) {
          return null;
        }

        return new Promise((resolve) => {
          try {
            const reader = new FileReader();

            reader.onloadend = () => {
              const result = reader.result as string;
              if (result && result.length > 0) {
                resolve(result);
              } else {
                resolve(null);
              }
            };

            reader.onerror = () => {
              resolve(null);
            };

            reader.onabort = () => {
              resolve(null);
            };

            reader.readAsDataURL(blob);
          } catch {
            resolve(null);
          }
        });
      } catch {
        return null;
      }
    },
    [],
  );

  const verificarUsuarioAutorizado = useCallback(
    async (imagemCapturada: string): Promise<boolean> => {
      if (!userId) {
        return false;
      }

      try {
        const descritor =
          await servicoReconhecimentoFacial.processarImagemCapturada(
            imagemCapturada,
          );

        if (!descritor) {
          return false;
        }

        let imagensReferencia = imagensReferenciaCache;

        if (!imagensReferencia || imagensReferencia.length === 0) {
          imagensReferencia =
            await servicoReconhecimentoFacial.carregarImagensDeReferenciaPorId(
              userId,
            );
          setImagensReferenciaCache(imagensReferencia);
          setCacheCarregado(true);
        }

        if (imagensReferencia.length === 0) {
          return false;
        }

        const resultado = servicoReconhecimentoFacial.compararFace(
          descritor,
          imagensReferencia as Parameters<
            typeof servicoReconhecimentoFacial.compararFace
          >[1],
          0.6,
        );

        const similaridade = (1 - resultado.distance) * 100;

        if (resultado.label !== "unknown" && similaridade > 50) {
          const dadosFuncionario = {
            nome: userName || "Usuário",
            foto: "",
          };

          try {
            const { data } = await api.get(`/face/images/${userId}`);
            if (data?.images?.[0]?.url) {
              const primeiraImagemUrl = data.images[0].url;

              converterImagemParaBase64(primeiraImagemUrl).then((base64) => {
                if (base64) {
                  setFuncionarioIdentificado((prev) => ({
                    ...prev!,
                    foto: base64,
                  }));
                }
              });
            }
          } catch {
            // Silent fail
          }

          setFuncionarioIdentificado(dadosFuncionario);

          try {
            const { data } = await api.get(`/face/images/${userId}`);
            if (data?.images && Array.isArray(data.images)) {
              const imagensBase64 = await Promise.all(
                data.images.slice(0, 5).map(async (img: { url?: string }) => {
                  if (img.url) {
                    return await converterImagemParaBase64(img.url);
                  }
                  return null;
                }),
              );
              const imagensValidas = imagensBase64.filter(Boolean) as string[];
              setImagensReferenciaAPI(imagensValidas);
            }
          } catch {
            // Silent fail
          }

          setTimeout(() => {
            if (iniciarMonitoramentoOvalRef.current) {
              iniciarMonitoramentoOvalRef.current();
            }
          }, 500);

          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    [userId, userName, converterImagemParaBase64, imagensReferenciaCache],
  );

  const detectarRosto = useCallback(async () => {
    if (!videoRef.current || !videoRef.current.videoWidth) {
      return { temRosto: false, quantidadeFaces: 0 };
    }

    try {
      const modelosEssenciais = [
        { modelo: faceapi.nets.tinyFaceDetector, nome: "tinyFaceDetector" },
      ];

      const promessasCarregamento = modelosEssenciais
        .filter(({ modelo }) => !modelo.isLoaded)
        .map(({ modelo }) => modelo.loadFromUri("/models"));

      if (promessasCarregamento.length > 0) {
        try {
          await Promise.all(promessasCarregamento);
        } catch {
          return { temRosto: false, quantidadeFaces: 0 };
        }
      }

      const opcoesDeteccao = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.4,
      });

      const scale = 0.5;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.setAttribute("willReadFrequently", "true");
      tempCanvas.width = videoRef.current.videoWidth * scale;
      tempCanvas.height = videoRef.current.videoHeight * scale;

      const tempCtx = tempCanvas.getContext("2d", {
        willReadFrequently: true,
        alpha: false,
        desynchronized: true,
      });

      if (!tempCtx) return { temRosto: false, quantidadeFaces: 0 };

      tempCtx.drawImage(
        videoRef.current,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      );

      const deteccoes = await faceapi.detectAllFaces(
        tempCanvas,
        opcoesDeteccao,
      );

      const quantidadeFaces = deteccoes.length;
      const temRosto = quantidadeFaces === 1;

      return { temRosto, quantidadeFaces };
    } catch {
      return { temRosto: false, quantidadeFaces: 0 };
    }
  }, [videoRef]);

  const detectarSorriso = useCallback(async (): Promise<boolean> => {
    if (!videoRef.current || !videoRef.current.videoWidth) {
      return false;
    }

    try {
      if (!faceapi.nets.faceExpressionNet.isLoaded) {
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      }

      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      }

      const canvas = document.createElement("canvas");
      canvas.setAttribute("willReadFrequently", "true");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) return false;

      ctx.drawImage(videoRef.current, 0, 0);

      const deteccoes = await faceapi
        .detectAllFaces(
          canvas,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceExpressions();

      if (deteccoes.length === 1) {
        const expressoes = deteccoes[0].expressions;
        const nivelSorriso = expressoes.happy;
        return nivelSorriso > 0.6;
      }

      return false;
    } catch {
      return false;
    }
  }, [videoRef]);

  const iniciarContadorSorriso = useCallback(() => {
    if (contadorInterval.current) {
      clearInterval(contadorInterval.current);
    }

    setContadorSorriso(TEMPO_SORRISO_SEGUNDOS);

    contadorInterval.current = setInterval(() => {
      setContadorSorriso((prev) => {
        if (prev <= 1) {
          if (contadorInterval.current) {
            clearInterval(contadorInterval.current);
            contadorInterval.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const iniciarDeteccaoSorriso = useCallback(() => {
    if (!podeContinuarProcesso) {
      return;
    }

    setEtapaSorriso(true);
    setAguardandoSorriso(true);
    setSorrisoDetectado(false);
    setContadorSorriso(TEMPO_SORRISO_SEGUNDOS);

    if (sorrisoInterval.current) {
      clearInterval(sorrisoInterval.current);
    }

    let sorrisoConsistente = 0;
    const SORRISO_CONSISTENCIA_NECESSARIA = 2;

    const verificarSorriso = async () => {
      if (!podeContinuarProcesso) {
        if (sorrisoInterval.current) {
          clearInterval(sorrisoInterval.current);
          sorrisoInterval.current = null;
        }
        return;
      }

      const temSorriso = await detectarSorriso();

      if (temSorriso) {
        sorrisoConsistente++;

        if (sorrisoConsistente >= SORRISO_CONSISTENCIA_NECESSARIA) {
          setSorrisoDetectado(true);

          if (sorrisoInterval.current) {
            clearInterval(sorrisoInterval.current);
            sorrisoInterval.current = null;
          }

          iniciarContadorSorriso();
        }
      } else {
        sorrisoConsistente = 0;
        setSorrisoDetectado(false);
      }
    };

    sorrisoInterval.current = setInterval(verificarSorriso, 400);
  }, [detectarSorriso, iniciarContadorSorriso, podeContinuarProcesso]);

  const iniciarDeteccaoRosto = useCallback(() => {
    if (detectorInterval.current) {
      clearInterval(detectorInterval.current);
      detectorInterval.current = null;
    }

    let verificacaoEmAndamento = false;
    let ultimaDeteccao = 0;
    const INTERVALO_MINIMO = 300;

    const verificarRosto = async () => {
      const agora = Date.now();

      if (agora - ultimaDeteccao < INTERVALO_MINIMO) {
        return;
      }

      ultimaDeteccao = agora;

      if (verificacaoEmAndamento) {
        return;
      }

      const resultadoDeteccao = await detectarRosto();
      const { temRosto, quantidadeFaces } = resultadoDeteccao;

      setMultiplasFacesDetectadas(quantidadeFaces > 1);

      if (funcionarioIdentificado) {
        if (detectorInterval.current) {
          clearInterval(detectorInterval.current);
          detectorInterval.current = null;
        }
        return;
      }

      if (verificacaoEmAndamento) {
        return;
      }

      if (temRosto && quantidadeFaces === 1 && !usuarioNaoIdentificado) {
        if (!rostoDetectado) {
          verificacaoEmAndamento = true;

          try {
            const fotoVerificacao = await capturarFoto();
            if (fotoVerificacao) {
              const usuarioAutorizado =
                await verificarUsuarioAutorizado(fotoVerificacao);

              if (usuarioAutorizado) {
                setUsuarioNaoIdentificado(false);
                setRostoDetectado(true);

                if (detectorInterval.current) {
                  clearInterval(detectorInterval.current);
                  detectorInterval.current = null;
                }
              } else {
                setUsuarioNaoIdentificado(true);
                setRostoDetectado(false);
              }
            }
          } catch {
            setUsuarioNaoIdentificado(true);
            setRostoDetectado(false);
          }

          verificacaoEmAndamento = false;
        }
      } else {
        if (rostoDetectado && !funcionarioIdentificado) {
          setRostoDetectado(false);
          setContadorRegressivo(TEMPO_ESPERA_SEGUNDOS);

          if (quantidadeFaces === 0) {
            setUsuarioNaoIdentificado(false);
          }
        }
      }
    };

    verificarRosto();
    detectorInterval.current = setInterval(verificarRosto, INTERVALO_MINIMO);

    return () => {
      if (detectorInterval.current) {
        clearInterval(detectorInterval.current);
        detectorInterval.current = null;
      }
    };
  }, [
    detectarRosto,
    rostoDetectado,
    funcionarioIdentificado,
    usuarioNaoIdentificado,
    capturarFoto,
    verificarUsuarioAutorizado,
  ]);

  const iniciarDigitalizacao = useCallback(async () => {
    if (!userId) {
      showErrorToast("ID do usuário não fornecido");
      return;
    }

    try {
      setDigitalizando(true);
      setFotosArmazenadas([]);
      setFotosCapturadas(0);
      setProgressoLocal(0);
      setRostoDetectado(false);
      setContadorRegressivo(TEMPO_ESPERA_SEGUNDOS);
      setMultiplasFacesDetectadas(false);
      setImagemCapturadaPrincipal(null);
      setUsuarioNaoIdentificado(false);
      setImagensReferenciaAPI([]);
      setFuncionarioIdentificado(null);
      setErroValidacao(null);
      setCapturandoFotos(false);
      setPosicionamentoRosto(null);
      setContadorForaDoOval(0);
      setTentativasOval(0);
      setPodeContinuarProcesso(false);

      pararDeteccaoSorriso();

      if (!sistemaOtimizado || !faceapi.nets.tinyFaceDetector.isLoaded) {
        try {
          if (!faceapi.nets.tinyFaceDetector.isLoaded) {
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
          }
          if (!faceapi.nets.faceLandmark68Net.isLoaded) {
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
          }
          if (!faceapi.nets.faceRecognitionNet.isLoaded) {
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
          }
        } catch {
          throw new Error("Falha ao carregar modelos de IA");
        }
      }

      await iniciarCamera();

      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          setCameraPronta(true);
          setTimeout(() => {
            iniciarDeteccaoRosto();
          }, 300);
        };
      }
    } catch (error) {
      setDigitalizando(false);
      showErrorToast("Erro na inicialização: " + (error as Error).message);
    }
  }, [
    userId,
    iniciarCamera,
    videoRef,
    pararDeteccaoSorriso,
    sistemaOtimizado,
    iniciarDeteccaoRosto,
  ]);

  const tentarNovamente = useCallback(() => {
    setUsuarioNaoIdentificado(false);
    setFuncionarioIdentificado(null);
    setRostoDetectado(false);
    setContadorRegressivo(TEMPO_ESPERA_SEGUNDOS);
    setErroValidacao(null);
    setPosicionamentoRosto(null);
    setContadorForaDoOval(0);
    setTentativasOval(0);
    setPodeContinuarProcesso(false);

    setTimeout(() => {
      iniciarDeteccaoRosto();
    }, 300);
  }, [iniciarDeteccaoRosto]);

  const iniciarCapturaFinal = useCallback(async () => {
    if (!podeContinuarProcesso || !posicionamentoRosto?.dentroDoOval) {
      return;
    }

    setCapturandoFotos(true);

    if (detectorInterval.current) {
      clearInterval(detectorInterval.current);
      detectorInterval.current = null;
    }
    if (contadorInterval.current) {
      clearInterval(contadorInterval.current);
      contadorInterval.current = null;
    }
    if (sorrisoInterval.current) {
      clearInterval(sorrisoInterval.current);
      sorrisoInterval.current = null;
    }

    pararDeteccaoSorriso();

    try {
      const resultadoDeteccao = await detectarRosto();
      const { temRosto, quantidadeFaces } = resultadoDeteccao;

      if (!temRosto || quantidadeFaces !== 1) {
        finalizarComErro(
          "Rosto perdido durante a captura. Processo cancelado.",
        );
        return;
      }

      if (!podeContinuarProcesso || !posicionamentoRosto?.dentroDoOval) {
        finalizarComErro(
          "Saiu da área Circulo antes da captura. Processo cancelado.",
        );
        return;
      }

      const primeiraFoto = await capturarFoto();

      if (!primeiraFoto) {
        finalizarComErro("Erro ao capturar foto. Processo cancelado.");
        return;
      }

      setFotosCapturadas(1);

      for (let i = 2; i <= QUANTIDADE_FOTOS; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (!podeContinuarProcesso || !posicionamentoRosto?.dentroDoOval) {
          finalizarComErro(
            "Saiu da área Circulo durante a captura. Processo cancelado.",
          );
          return;
        }

        const verificacaoRosto = await detectarRosto();
        if (
          !verificacaoRosto.temRosto ||
          verificacaoRosto.quantidadeFaces !== 1
        ) {
          finalizarComErro(
            "Rosto perdido durante a captura. Processo cancelado.",
          );
          return;
        }

        const foto = await capturarFoto();

        if (!foto) {
          finalizarComErro("Erro ao capturar foto. Processo cancelado.");
          return;
        }

        setFotosCapturadas(i);
      }

      pararMonitoramentoOval();
      setVerificando(true);
      setPodeFechar(false);
      pararCamera();

      await capturarEVerificar(fotosArmazenadas, userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      finalizarComErro(`Erro durante a captura: ${errorMessage}`);
    } finally {
      setCapturandoFotos(false);
    }
  }, [
    detectarRosto,
    capturarFoto,
    fotosArmazenadas,
    pararCamera,
    capturarEVerificar,
    finalizarComErro,
    pararDeteccaoSorriso,
    pararMonitoramentoOval,
    podeContinuarProcesso,
    posicionamentoRosto,
    userId,
  ]);

  const tratarFechar = useCallback(() => {
    if (verificando && !podeFechar) {
      return;
    }

    if (detectorInterval.current) {
      clearInterval(detectorInterval.current);
      detectorInterval.current = null;
    }
    if (contadorInterval.current) {
      clearInterval(contadorInterval.current);
      contadorInterval.current = null;
    }
    if (verificacaoPresencaInterval.current) {
      clearInterval(verificacaoPresencaInterval.current);
      verificacaoPresencaInterval.current = null;
    }

    pararMonitoramentoOval();
    pararDeteccaoSorriso();

    pararCamera();
    setDigitalizando(false);
    setCameraPronta(false);
    setFotosArmazenadas([]);
    setFotosCapturadas(0);
    setVerificando(false);
    setDetalhesVerificacao(null);
    setProgressoLocal(0);
    setRostoDetectado(false);
    setContadorRegressivo(TEMPO_ESPERA_SEGUNDOS);
    setPodeFechar(true);
    setMultiplasFacesDetectadas(false);
    setImagemCapturadaPrincipal(null);
    setUsuarioNaoIdentificado(false);
    setImagensReferenciaAPI([]);
    setFuncionarioIdentificado(null);
    setErroValidacao(null);
    setCapturandoFotos(false);
    setPosicionamentoRosto(null);
    setContadorForaDoOval(0);
    setTentativasOval(0);
    setPodeContinuarProcesso(false);

    definirEtapa("INICIAL");
    handleClose?.();
  }, [
    pararCamera,
    definirEtapa,
    handleClose,
    verificando,
    podeFechar,
    pararDeteccaoSorriso,
    pararMonitoramentoOval,
  ]);

  useEffect(() => {
    verificarSistemaOtimizado();
  }, [verificarSistemaOtimizado]);

  useEffect(() => {
    if (progresso !== progressoLocal) {
      setProgressoLocal(progresso);
    }
  }, [progresso, progressoLocal]);

  useEffect(() => {
    if (
      digitalizando &&
      cameraPronta &&
      rostoDetectado &&
      fotosCapturadas < QUANTIDADE_FOTOS &&
      !multiplasFacesDetectadas &&
      !usuarioNaoIdentificado &&
      funcionarioIdentificado &&
      !capturandoFotos &&
      !verificando &&
      podeContinuarProcesso &&
      posicionamentoRosto?.dentroDoOval === true
    ) {
      if (etapaSorriso && sorrisoDetectado && contadorSorriso === 0) {
        if (podeContinuarProcesso && posicionamentoRosto?.dentroDoOval) {
          iniciarCapturaFinal();
        }
        return;
      }

      if (!etapaSorriso && !aguardandoSorriso && podeContinuarProcesso) {
        iniciarDeteccaoSorriso();
        return;
      }
    }

    if (!podeContinuarProcesso || !posicionamentoRosto?.dentroDoOval) {
      if (etapaSorriso || aguardandoSorriso) {
        pararDeteccaoSorriso();
        setEtapaSorriso(false);
        setAguardandoSorriso(false);
        setSorrisoDetectado(false);
      }
    }
  }, [
    digitalizando,
    cameraPronta,
    rostoDetectado,
    fotosCapturadas,
    multiplasFacesDetectadas,
    usuarioNaoIdentificado,
    funcionarioIdentificado,
    etapaSorriso,
    sorrisoDetectado,
    contadorSorriso,
    aguardandoSorriso,
    capturandoFotos,
    verificando,
    podeContinuarProcesso,
    posicionamentoRosto,
    iniciarDeteccaoSorriso,
    iniciarCapturaFinal,
    pararDeteccaoSorriso,
  ]);

  useEffect(() => {
    if (isOpen && userId && !cacheCarregado) {
      servicoReconhecimentoFacial
        .carregarImagensDeReferenciaPorId(userId)
        .then((imagens) => {
          setImagensReferenciaCache(imagens);
          setCacheCarregado(true);
        })
        .catch(() => {
          showErrorToast("Erro ao carregar cache de imagens");
        });
    }
  }, [isOpen, userId, cacheCarregado]);

  useEffect(() => {
    return () => {
      if (detectorInterval.current) {
        clearInterval(detectorInterval.current);
      }
      if (contadorInterval.current) {
        clearInterval(contadorInterval.current);
      }
      if (sorrisoInterval.current) {
        clearInterval(sorrisoInterval.current);
      }
      if (verificacaoPresencaInterval.current) {
        clearInterval(verificacaoPresencaInterval.current);
      }
      if (ovalInterval.current) {
        clearInterval(ovalInterval.current);
      }
    };
  }, []);

  const renderizarVistaInicial = () => (
    <div className="mx-auto flex min-h-[400px] w-full max-w-2xl flex-col items-center justify-center px-4 py-8 sm:min-h-[500px] sm:px-8 sm:py-12">
      <div className="relative mb-8 sm:mb-12">
        <div className="absolute rounded-full -inset-4 animate-pulse bg-primary/5" />
        <Camera className="relative w-16 h-16 text-primary sm:h-24 sm:w-24" />
      </div>

      <div className="max-w-md space-y-6 text-center sm:space-y-8">
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
            Verificação Facial
          </h3>
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Posicione seu rosto dentro do círculo em um ambiente bem iluminado
            </p>
            <p className="text-xs text-muted-foreground/80 sm:text-sm">
              Sistema detecta automaticamente se você está na área correta{" "}
              {userName && `(${userName})`}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <Button
            onClick={iniciarDigitalizacao}
            disabled={!userId}
            size="lg"
            className="h-12 w-full rounded-full text-base shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] sm:h-14 sm:w-auto sm:min-w-[240px]"
          >
            {sistemaOtimizado ? (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Iniciar Verificação Rápida
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                Iniciar Verificação no círculo
              </>
            )}
          </Button>

          {!userId && (
            <p className="text-sm text-destructive">
              ID do usuário é obrigatório
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderizarVistaCarregamento = () => (
    <div className="flex flex-col items-center justify-center gap-4 p-4 sm:gap-6 sm:p-8">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary sm:h-16 sm:w-16" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-primary sm:text-sm">
            {progressoLocal}%
          </span>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-base font-medium sm:text-lg">
          Processando Verificação
        </h3>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Etapa atual: {etapa}
        </p>

        {sistemaOtimizado && (
          <div className="flex items-center justify-center gap-1 text-xs text-green-600">
            <Zap className="w-3 h-3" />
            <span>Sistema otimizado</span>
          </div>
        )}

        <Progress value={progressoLocal} className="w-full sm:w-[400px]" />
      </div>
    </div>
  );

  const renderizarVistaDigitalizacao = () => (
    <CameraView
      videoRef={videoRef}
      rostoDetectado={rostoDetectado}
      contadorRegressivo={etapaSorriso ? contadorSorriso : contadorRegressivo}
      fotosCapturadas={fotosCapturadas}
      tempoEspera={
        etapaSorriso ? TEMPO_SORRISO_SEGUNDOS : TEMPO_ESPERA_SEGUNDOS
      }
      quantidadeFotos={QUANTIDADE_FOTOS}
      funcionarioIdentificado={funcionarioIdentificado}
      multiplasFacesDetectadas={multiplasFacesDetectadas}
      usuarioNaoIdentificado={usuarioNaoIdentificado || !!erroValidacao}
      solicitarSorriso={etapaSorriso}
      sorrisoDetectado={sorrisoDetectado}
      onTentarNovamente={tentarNovamente}
      erroValidacao={erroValidacao}
      posicionamentoRosto={posicionamentoRosto}
      dentroDoOval={posicionamentoRosto?.dentroDoOval || false}
      tentativasRestantes={MAX_TENTATIVAS_OVAL - tentativasOval}
    />
  );

  const renderizarVistaResultado = () => (
    <ResultView
      etapa={etapa}
      detalhesVerificacao={detalhesVerificacao}
      onFechar={tratarFechar}
      imagemCapturada={imagemCapturadaPrincipal || undefined}
      imagensReferencia={imagensReferenciaAPI}
      erroValidacao={erroValidacao}
    />
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(aberto) => {
        if (!aberto && podeFechar) tratarFechar();
      }}
    >
      <DialogContent
        className="max-h-[90vh] w-[95vw] overflow-y-auto p-0 sm:max-w-[700px]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex items-center justify-between p-4 pb-0 sm:p-6">
          <DialogTitle className="text-lg font-semibold sm:text-xl">
            {erroValidacao && "Verificação Cancelada - Limite de Tentativas"}
            {!erroValidacao &&
              !verificando &&
              etapa === "INICIAL" &&
              "Verificação Facial"}
            {!erroValidacao &&
              !verificando &&
              etapa === "COMPARANDO" &&
              (etapaSorriso
                ? "Sorria Dentro do Circulo"
                : "Mantenha-se no Circulo...")}
            {!erroValidacao && verificando && "Processando Verificação"}
            {!erroValidacao && etapa === "SUCESSO" && "Verificação Concluída"}
            {!erroValidacao && etapa === "FALHA" && "Verificação Falhou"}
            {!erroValidacao &&
              usuarioNaoIdentificado &&
              "Usuário Não Autorizado"}
          </DialogTitle>
        </div>

        <DialogDescription className="sr-only">
          Sistema de verificação facial com detecção automática se o usuário
          está dentro da área oval
        </DialogDescription>

        <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
          <div className="flex min-h-[300px] items-center justify-center sm:min-h-[400px]">
            {!digitalizando &&
              !verificando &&
              etapa !== "SUCESSO" &&
              etapa !== "FALHA" &&
              !erroValidacao &&
              renderizarVistaInicial()}
            {digitalizando &&
              !verificando &&
              etapa !== "SUCESSO" &&
              etapa !== "FALHA" &&
              renderizarVistaDigitalizacao()}
            {verificando && !erroValidacao && renderizarVistaCarregamento()}
            {(etapa === "SUCESSO" || etapa === "FALHA" || erroValidacao) &&
              renderizarVistaResultado()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogoReconhecimentoFacial;
