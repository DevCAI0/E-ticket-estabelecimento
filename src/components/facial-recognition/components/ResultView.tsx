import {
  CheckCircle,
  XCircle,
  User,
  Shield,
  Clock,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ResultadoVerificacao } from "@/types/reconhecimento-facial";

interface ResultViewProps {
  etapa: string;
  detalhesVerificacao: ResultadoVerificacao | null;
  onFechar: () => void;
  imagemCapturada?: string;
  imagensReferencia?: string[];
  erroValidacao?: string | null;
}

const ResultView = ({
  etapa,
  detalhesVerificacao,
  onFechar,
  imagemCapturada,
  imagensReferencia = [],
  erroValidacao,
}: ResultViewProps) => {
  const isSuccess = etapa === "SUCESSO";
  const hasError = !!erroValidacao || etapa === "FALHA";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card
        className={cn(
          "border-none shadow-2xl transition-all duration-300",
          isSuccess
            ? "bg-gradient-to-br from-green-50 to-emerald-50"
            : "bg-gradient-to-br from-red-50 to-pink-50",
        )}
      >
        <CardContent className="p-6 sm:p-10">
          <div className="text-center">
            <div className="relative inline-flex">
              <div
                className={cn(
                  "absolute inset-0 rounded-full opacity-30 blur-xl",
                  isSuccess ? "bg-green-500" : "bg-red-500",
                )}
              />
              <div
                className={cn(
                  "relative rounded-full p-4",
                  isSuccess ? "bg-green-100" : "bg-red-100",
                )}
              >
                {isSuccess ? (
                  <CheckCircle className="h-16 w-16 text-green-600 sm:h-20 sm:w-20" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-600 sm:h-20 sm:w-20" />
                )}
              </div>
            </div>

            <h2
              className={cn(
                "mt-6 text-2xl font-bold sm:text-3xl",
                isSuccess ? "text-green-800" : "text-red-800",
              )}
            >
              {isSuccess ? "Verificação Bem-Sucedida!" : "Verificação Falhou"}
            </h2>

            <p
              className={cn(
                "mt-2 text-sm sm:text-base",
                isSuccess ? "text-green-600" : "text-red-600",
              )}
            >
              {isSuccess
                ? "Sua identidade foi confirmada com sucesso"
                : "Não foi possível confirmar sua identidade"}
            </p>
          </div>

          {hasError && erroValidacao && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div className="min-w-0 flex-1">
                  <h4 className="mb-2 text-sm font-semibold text-red-800">
                    Detalhes do Erro:
                  </h4>
                  <div className="whitespace-pre-wrap break-words rounded border bg-red-100 p-3 font-mono text-xs text-red-700">
                    {erroValidacao}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(imagemCapturada || imagensReferencia.length > 0) && (
            <div className="mt-8">
              <div className="mb-6 flex items-center justify-center gap-2">
                <Camera className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Imagens Utilizadas na Verificação
                </h3>
              </div>

              <div className="flex flex-col items-center gap-6">
                {imagemCapturada && (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="mb-2 text-xs font-medium text-gray-500">
                        Foto Capturada Agora
                      </p>
                      <div className="group relative">
                        <div
                          className={cn(
                            "absolute -inset-1 rounded-xl opacity-75 blur-sm transition-opacity group-hover:opacity-100",
                            isSuccess
                              ? "bg-gradient-to-r from-green-400 to-emerald-400"
                              : "bg-gradient-to-r from-red-400 to-pink-400",
                          )}
                        />
                        <div className="relative rounded-xl bg-white p-1">
                          <img
                            src={imagemCapturada}
                            alt="Foto capturada"
                            className="h-32 w-32 rounded-lg object-cover sm:h-40 sm:w-40"
                          />
                        </div>
                        <div
                          className={cn(
                            "absolute -bottom-2 -right-2 rounded-full p-1.5",
                            isSuccess ? "bg-green-500" : "bg-red-500",
                          )}
                        >
                          {isSuccess ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <XCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {imagensReferencia.length > 0 && (
                  <div className="w-full">
                    <p className="mb-4 text-center text-xs font-medium text-gray-500">
                      Fotos de Referência do Sistema
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {imagensReferencia.slice(0, 4).map((imagem, index) => (
                        <div key={index} className="group relative">
                          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 opacity-50 blur-sm transition-opacity group-hover:opacity-75" />
                          <div className="relative rounded-lg bg-white p-0.5">
                            <img
                              src={imagem}
                              alt={`Referência ${index + 1}`}
                              className="h-20 w-20 rounded-md object-cover sm:h-24 sm:w-24"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-1">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {imagensReferencia.length > 4 && (
                      <p className="mt-3 text-center text-xs text-gray-500">
                        +{imagensReferencia.length - 4} fotos adicionais
                        utilizadas
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {detalhesVerificacao && isSuccess && (
            <div className="mt-8 rounded-xl bg-white/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Verificado como:</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {detalhesVerificacao.rotulo}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Tempo:</span>
                </div>
                <span className="font-medium text-gray-700">
                  {(detalhesVerificacao.tempoProcessamento / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button
              className={cn(
                "min-w-[200px] font-semibold shadow-lg transition-all hover:shadow-xl",
                isSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700",
              )}
              onClick={onFechar}
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultView;
