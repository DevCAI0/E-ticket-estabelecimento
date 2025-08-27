// CameraView.tsx - Versão simplificada apenas para detecção no círculo

import {
  User as UserIcon,
  AlertTriangle,
  XCircle,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface PosicionamentoRosto {
  dentroDoOval: boolean;
  rostoX: number;
  rostoY: number;
  tamanhoRosto: number;
}

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  rostoDetectado: boolean;
  contadorRegressivo: number;
  fotosCapturadas: number;
  tempoEspera: number;
  quantidadeFotos: number;
  funcionarioIdentificado?: {
    nome: string;
    foto: string;
  } | null;
  solicitarSorriso?: boolean;
  sorrisoDetectado?: boolean;
  multiplasFacesDetectadas?: boolean;
  usuarioNaoIdentificado?: boolean;
  onTentarNovamente?: () => void;
  erroValidacao?: string | null;
  // Props simplificadas para círculo
  posicionamentoRosto?: PosicionamentoRosto | null;
  dentroDoOval?: boolean;
  tentativasRestantes?: number;
}

const CameraView = ({
  videoRef,
  rostoDetectado,
  contadorRegressivo,
  fotosCapturadas,
  tempoEspera,
  quantidadeFotos,
  funcionarioIdentificado,
  solicitarSorriso = false,
  sorrisoDetectado = false,
  multiplasFacesDetectadas = false,
  usuarioNaoIdentificado = false,
  onTentarNovamente,
  erroValidacao = null,
  posicionamentoRosto = null,
  dentroDoOval = false,
  tentativasRestantes = 2,
}: CameraViewProps) => {
  const [mostrarFuncionario, setMostrarFuncionario] = useState(false);
  const [piscarVermelho, setPiscarVermelho] = useState(false);
  const [animacaoEncerramento, setAnimacaoEncerramento] = useState(false);

  // Determinar cor do círculo baseado no posicionamento dentro do círculo
  const obterCorOval = () => {
    if (erroValidacao || multiplasFacesDetectadas || usuarioNaoIdentificado) {
      return "border-red-600 shadow-2xl shadow-red-600/70 animate-pulse";
    }

    if (posicionamentoRosto) {
      if (posicionamentoRosto.dentroDoOval) {
        return "border-green-400 shadow-lg shadow-green-400/50";
      } else {
        return "border-orange-500 shadow-lg shadow-orange-500/40 animate-pulse";
      }
    }

    if (rostoDetectado && funcionarioIdentificado) {
      return "border-green-400 shadow-lg shadow-green-400/30";
    } else if (rostoDetectado) {
      return "border-yellow-400 shadow-lg shadow-yellow-400/30";
    }

    return "border-white/50 border-dashed";
  };

  // Renderizar indicador de posicionamento no círculo
  const renderizarIndicadorOval = () => {
    if (!posicionamentoRosto) return null;

    const { dentroDoOval } = posicionamentoRosto;

    let cor = "#ef4444"; // vermelho
    let icone = <AlertTriangle className="w-4 h-4" />;
    let mensagem = "Posicione o rosto dentro do círculo";

    if (dentroDoOval) {
      cor = "#22c55e"; // verde
      icone = <CheckCircle className="w-4 h-4" />;
      mensagem = "✓ Posicionamento correto!";
    }

    return (
      <div className="absolute z-20 transform -translate-x-1/2 left-1/2 top-4">
        <div
          className="flex max-w-[280px] items-center gap-2 rounded-lg px-4 py-2 text-center text-sm font-medium transition-all duration-300"
          style={{
            backgroundColor: `${cor}e6`,
            color: "white",
            border: `2px solid ${cor}`,
          }}
        >
          {icone}
          <span>{mensagem}</span>
        </div>

        {/* Indicador simples */}
        <div className="flex justify-center mt-2">
          <div
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              dentroDoOval ? "animate-pulse bg-green-400" : "bg-red-400"
            }`}
            title={dentroDoOval ? "Dentro do círculo" : "Fora do círculo"}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (erroValidacao || multiplasFacesDetectadas || usuarioNaoIdentificado) {
      setPiscarVermelho(true);

      if (erroValidacao) {
        setAnimacaoEncerramento(true);
        const interval = setInterval(() => {
          setPiscarVermelho((prev) => !prev);
        }, 200);
        return () => clearInterval(interval);
      } else {
        const interval = setInterval(() => {
          setPiscarVermelho((prev) => !prev);
        }, 500);
        return () => clearInterval(interval);
      }
    } else {
      setPiscarVermelho(false);
      setAnimacaoEncerramento(false);
    }
  }, [erroValidacao, multiplasFacesDetectadas, usuarioNaoIdentificado]);

  useEffect(() => {
    if (funcionarioIdentificado) {
      setMostrarFuncionario(true);
    } else {
      setMostrarFuncionario(false);
    }
  }, [funcionarioIdentificado]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.target as HTMLImageElement;
    if (funcionarioIdentificado?.foto?.startsWith("data:image")) return;

    if (!target.src.includes("data:image")) {
      target.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIyMCIgeT0iMjAiPgo8cGF0aCBkPSJNMTIgMTJDMTQuMjA5MSAxMiAxNiAxMC4yMDkxIDE2IDhDMTYgNS43OTA5IDE0LjIwOTEgNCA5IDRDOS43OTA5IDQgOCA1Ljc5MDkgOCA4QzggMTAuMjA5MSA5Ljc5MDkgMTIgMTIgMTJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMiAxNEM4LjEzNDAxIDE0IDUgMTcuMTM0IDUgMjFIMTlDMTkgMTcuMTM0IDE1Ljg2NiAxNCAxMiAxNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=";
    }
  };

  const renderizarMensagem = () => {
    if (erroValidacao) {
      return (
        <Alert className="border-3 w-auto max-w-[90%] border-red-500 bg-red-800/95 text-white shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-red-200" />
                <div className="absolute w-3 h-3 bg-red-400 rounded-full -right-1 -top-1 animate-ping" />
              </div>
              <AlertTitle className="text-base font-bold text-center sm:text-lg">
                🚨 VERIFICAÇÃO CANCELADA
              </AlertTitle>
            </div>
            <AlertDescription className="max-w-[280px] text-center text-sm leading-relaxed text-red-100">
              {erroValidacao}
            </AlertDescription>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-700/80">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">
                  Saiu da área circular
                </span>
              </div>
              <p className="text-xs text-center text-red-200/80">
                Fechando automaticamente...
              </p>
            </div>
          </div>
        </Alert>
      );
    }

    if (usuarioNaoIdentificado) {
      return (
        <Alert className="w-auto max-w-[90%] animate-pulse border-none bg-red-600/80 text-white shadow-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <AlertTitle className="text-sm font-medium text-center sm:text-base">
                Usuário não identificado!
              </AlertTitle>
            </div>
            <AlertDescription className="text-xs text-center">
              O rosto detectado não pertence ao usuário logado
            </AlertDescription>
            {onTentarNovamente && (
              <Button
                onClick={onTentarNovamente}
                variant="outline"
                size="sm"
                className="mt-2 text-red-600 bg-white hover:bg-red-50"
              >
                Tentar Novamente
              </Button>
            )}
          </div>
        </Alert>
      );
    }

    if (multiplasFacesDetectadas) {
      return (
        <Alert className="w-auto max-w-[90%] animate-pulse border-none bg-red-600/80 text-white shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <AlertTitle className="text-sm font-medium text-center sm:text-base">
              Múltiplas faces detectadas!
            </AlertTitle>
          </div>
          <AlertDescription className="mt-1 text-xs text-center">
            Por favor, certifique-se de que apenas uma pessoa esteja visível
          </AlertDescription>
        </Alert>
      );
    }

    if (funcionarioIdentificado && solicitarSorriso) {
      return (
        <Alert className="w-auto max-w-[90%] border-none bg-black/60 text-white shadow-lg">
          <AlertTitle className="text-sm font-medium text-center sm:text-base">
            {sorrisoDetectado
              ? `Ótimo ${funcionarioIdentificado.nome}! Mantenha o sorriso`
              : `Por favor, sorria ${funcionarioIdentificado.nome}`}
          </AlertTitle>
          {contadorRegressivo > 0 && (
            <AlertDescription>
              <Progress
                value={((tempoEspera - contadorRegressivo) / tempoEspera) * 100}
                className="mt-2 w-[150px] sm:w-[200px]"
              />
            </AlertDescription>
          )}
        </Alert>
      );
    }

    if (funcionarioIdentificado && fotosCapturadas > 0) {
      return (
        <Alert className="w-auto max-w-[90%] border-none bg-green-600/80 text-white shadow-lg">
          <AlertTitle className="text-sm font-medium text-center sm:text-base">
            Capturando fotos... ({fotosCapturadas}/{quantidadeFotos})
          </AlertTitle>
          <AlertDescription>
            <Progress
              value={(fotosCapturadas / quantidadeFotos) * 100}
              className="mt-2 w-[150px] sm:w-[200px]"
            />
          </AlertDescription>
        </Alert>
      );
    }

    // Mensagem baseada no posicionamento no círculo
    if (posicionamentoRosto && funcionarioIdentificado) {
      if (posicionamentoRosto.dentroDoOval) {
        return (
          <Alert className="w-auto max-w-[90%] border-none bg-green-600/80 text-white shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <AlertTitle className="text-sm font-medium text-center sm:text-base">
                Perfeito! Continue assim
              </AlertTitle>
            </div>
            {contadorRegressivo > 0 && (
              <AlertDescription>
                <Progress
                  value={
                    ((tempoEspera - contadorRegressivo) / tempoEspera) * 100
                  }
                  className="mt-2 w-[150px] sm:w-[200px]"
                />
              </AlertDescription>
            )}
          </Alert>
        );
      } else {
        return (
          <Alert className="w-auto max-w-[90%] animate-pulse border-none bg-orange-600/80 text-white shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <AlertTitle className="text-sm font-medium text-center sm:text-base">
                Mantenha o rosto dentro do círculo
              </AlertTitle>
            </div>
          </Alert>
        );
      }
    }

    if (rostoDetectado) {
      return (
        <Alert className="w-auto max-w-[90%] border-none bg-black/60 text-white shadow-lg">
          <AlertTitle className="text-sm font-medium text-center sm:text-base">
            {contadorRegressivo > 0
              ? `Rosto detectado! Verificando em ${contadorRegressivo}...`
              : funcionarioIdentificado
                ? "Usuário verificado! Preparando captura..."
                : "Verificando usuário..."}
          </AlertTitle>
          <AlertDescription>
            <Progress
              value={
                contadorRegressivo > 0
                  ? ((tempoEspera - contadorRegressivo) / tempoEspera) * 100
                  : funcionarioIdentificado
                    ? (fotosCapturadas / quantidadeFotos) * 100
                    : 50
              }
              className="mt-2 w-[150px] sm:w-[200px]"
            />
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="w-auto max-w-[90%] border-none bg-black/60 text-white shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <UserIcon className="w-5 h-5 animate-pulse" />
          <AlertTitle className="text-sm font-medium text-center sm:text-base">
            Posicione seu rosto dentro do círculo
          </AlertTitle>
        </div>
      </Alert>
    );
  };

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-lg bg-black sm:h-[600px]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 object-cover w-full h-full"
      />

      {/* Overlay escuro fora do círculo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 150px 200px at center, 
              transparent 100%, 
              rgba(0, 0, 0, 0.75) 100%
            )
          `,
        }}
      />

      {/* Efeito de piscar vermelho para erros */}
      {piscarVermelho && (
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
            erroValidacao
              ? `bg-red-600/70 ${animacaoEncerramento ? "animate-pulse" : ""}`
              : multiplasFacesDetectadas || usuarioNaoIdentificado
                ? "bg-red-500/30"
                : "bg-red-400/20"
          }`}
          style={{ zIndex: 10 }}
        />
      )}

      {/* Animações de erro crítico */}
      {erroValidacao && animacaoEncerramento && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute border-4 border-red-400 rounded-lg inset-4 animate-ping" />
          <div className="absolute border-2 border-red-300 rounded inset-8 animate-pulse" />
        </div>
      )}

      {/* Círculo de detecção facial - COR DINÂMICA BASEADA NO POSICIONAMENTO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`rounded-full border-2 transition-all duration-300 ${obterCorOval()} `}
          style={{
            width: "300px",
            height: "400px",
            borderRadius: "50%",
          }}
        >
          {/* Indicador dentro do círculo se não estiver posicionado corretamente */}
          {posicionamentoRosto && !posicionamentoRosto.dentroDoOval && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-3 py-1 text-xs font-bold text-white rounded-full animate-bounce bg-orange-500/80">
                ↑ Entre na área ↑
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicadores de posicionamento no círculo */}
      {renderizarIndicadorOval()}

      {/* Contador regressivo */}
      {rostoDetectado &&
        contadorRegressivo > 0 &&
        !multiplasFacesDetectadas &&
        !usuarioNaoIdentificado &&
        !erroValidacao && (
          <div className="absolute px-3 py-1 text-sm font-bold text-white rounded-full left-4 top-4 bg-black/70">
            {contadorRegressivo}s
          </div>
        )}

      {/* Alertas de erro no topo */}
      {(erroValidacao ||
        multiplasFacesDetectadas ||
        usuarioNaoIdentificado) && (
        <div className="absolute flex justify-center left-4 right-4 top-4">
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-lg ${
              erroValidacao
                ? "border-3 border-red-500 bg-red-800 shadow-2xl"
                : "bg-red-600"
            }`}
          >
            {erroValidacao ? (
              <div className="relative">
                <Shield className="w-5 h-5" />
                <div className="absolute w-2 h-2 bg-red-400 rounded-full -right-1 -top-1 animate-ping" />
              </div>
            ) : usuarioNaoIdentificado ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span
              className={`text-sm font-medium ${
                erroValidacao ? "font-bold" : ""
              }`}
            >
              {erroValidacao
                ? "FORA DA ÁREA"
                : usuarioNaoIdentificado
                  ? "Usuário não autorizado"
                  : "Apenas uma pessoa por vez"}
            </span>
          </div>
        </div>
      )}

      {/* Card do funcionário identificado */}
      {mostrarFuncionario &&
        funcionarioIdentificado &&
        !multiplasFacesDetectadas &&
        !usuarioNaoIdentificado &&
        !erroValidacao && (
          <div className="absolute z-10 p-2 duration-500 bg-white border-2 border-green-400 rounded-lg shadow-lg bottom-4 right-4 animate-in slide-in-from-right-8">
            <div className="flex min-w-[80px] flex-col items-center gap-2">
              <div className="relative">
                {funcionarioIdentificado.foto &&
                funcionarioIdentificado.foto !== "" ? (
                  <img
                    src={funcionarioIdentificado.foto}
                    alt={funcionarioIdentificado.nome}
                    className="object-cover w-12 h-12 border-2 border-green-400 rounded-full"
                    onError={handleImageError}
                    style={{
                      display: "block",
                      backgroundColor: "#f3f4f6",
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border-2 border-green-400 rounded-full">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="max-w-[70px] truncate text-xs font-medium text-gray-900">
                  {funcionarioIdentificado.nome}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                    dentroDoOval ? "bg-green-400" : "bg-orange-400"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium ${
                    dentroDoOval ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {dentroDoOval ? "No Círculo" : "Fora do Círculo"}
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Mensagens na parte inferior */}
      <div className="absolute left-0 right-0 flex flex-col items-center gap-3 bottom-6 sm:bottom-8 sm:gap-4">
        {renderizarMensagem()}
      </div>

      {/* Indicador de tentativas restantes */}
      {funcionarioIdentificado && tentativasRestantes < 2 && (
        <div className="absolute right-4 top-4">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white rounded-lg bg-orange-600/90">
            <span>Tentativas restantes:</span>
            <div className="flex gap-1">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < tentativasRestantes ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicador de sorriso - APENAS SE ESTIVER DENTRO DO CÍRCULO */}
      {solicitarSorriso &&
        rostoDetectado &&
        !multiplasFacesDetectadas &&
        !usuarioNaoIdentificado &&
        !erroValidacao &&
        dentroDoOval && (
          <div
            className={`absolute ${
              tentativasRestantes < 2 ? "right-4 top-16" : "right-4 top-4"
            } max-w-[140px] rounded-lg px-3 py-2 text-center text-xs font-medium transition-all duration-300 ${
              sorrisoDetectado
                ? "bg-green-500/90 text-white"
                : "bg-yellow-500/90 text-black"
            }`}
          >
            {sorrisoDetectado
              ? "✅ Sorriso detectado!"
              : "😊 Sorria para continuar"}
          </div>
        )}

      {/* Contador de fotos capturadas */}
      {fotosCapturadas > 0 &&
        fotosCapturadas < quantidadeFotos &&
        !erroValidacao && (
          <div className="absolute px-4 py-2 text-sm font-medium text-white transform -translate-x-1/2 rounded-full left-1/2 top-4 bg-blue-500/90">
            📸 Capturando {fotosCapturadas}/{quantidadeFotos}
          </div>
        )}

      {/* Alerta especial se fora do círculo */}
      {posicionamentoRosto &&
        !posicionamentoRosto.dentroDoOval &&
        funcionarioIdentificado && (
          <div className="absolute bottom-4 left-4">
            <div className="px-3 py-2 text-xs font-medium text-white rounded-lg animate-pulse bg-orange-500/90">
              ⚠️ Mantenha-se no círculo
            </div>
          </div>
        )}

      {/* Tela de erro crítico sobreposta */}
      {erroValidacao && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="max-w-[90%] rounded-xl border-2 border-red-500 bg-red-900/90 p-8 text-center shadow-2xl">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-200 animate-pulse" />
            <h3 className="mb-2 text-xl font-bold text-white">FORA DA ÁREA</h3>
            <p className="text-sm text-red-200">
              Você saiu da área circular durante a verificação
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
              <span className="text-xs text-red-300">
                Fechando automaticamente...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// EXPORTAÇÃO PADRÃO
export default CameraView;
