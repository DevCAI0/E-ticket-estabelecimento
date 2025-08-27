import { api } from "@/lib/axios";
import { encryptData, decryptData } from "@/lib/crypto";
import * as faceapi from "@vladmandic/face-api";
interface DadosImagem {
  url: string;
  caminho: string;
}

interface CacheUsuario {
  timestamp: number;
  descriptors: faceapi.LabeledFaceDescriptors[];
  imagensBase64: string[];
  userId: string;
  dataExpiracao: number;
}

// ✅ Interface para dados de indicadores do cache
interface DadosIndicadoresCache {
  timestamp: number;
  expiracao: number;
  descriptorsCount: number;
  imagesCount: number;
}

class ServicoReconhecimentoFacial {
  private modelosCarregados = false;
  private cacheUsuarios: Map<string, CacheUsuario> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000;
  private carregandoModelos = false;
  private modelosInicializandoPromise: Promise<void> | null = null;

  constructor() {
    this.inicializarModelosAutomaticamente();
    setInterval(
      () => {
        this.limparCacheExpirado();
      },
      5 * 60 * 1000,
    );
  }

  private async inicializarModelosAutomaticamente(): Promise<void> {
    if (this.modelosInicializandoPromise) {
      return this.modelosInicializandoPromise;
    }

    this.modelosInicializandoPromise = this.inicializar();

    try {
      await this.modelosInicializandoPromise;
    } catch {
      // Silent fail
    }
  }

  async inicializar(): Promise<void> {
    if (this.modelosCarregados) return;
    if (this.carregandoModelos) {
      while (this.carregandoModelos) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.carregandoModelos = true;

    try {
      const CAMINHO_MODELOS = "/models";

      await Promise.all(
        [
          !faceapi.nets.tinyFaceDetector.isLoaded &&
            faceapi.nets.tinyFaceDetector.loadFromUri(CAMINHO_MODELOS),
          !faceapi.nets.faceLandmark68Net.isLoaded &&
            faceapi.nets.faceLandmark68Net.loadFromUri(CAMINHO_MODELOS),
          !faceapi.nets.faceRecognitionNet.isLoaded &&
            faceapi.nets.faceRecognitionNet.loadFromUri(CAMINHO_MODELOS),
        ].filter(Boolean),
      );

      try {
        if (!faceapi.nets.faceExpressionNet.isLoaded) {
          await faceapi.nets.faceExpressionNet.loadFromUri(CAMINHO_MODELOS);
        }
      } catch {
        // Silent fail for optional model
      }

      this.modelosCarregados = true;
    } catch (erro: unknown) {
      this.modelosCarregados = false;
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      throw new Error(`Falha ao carregar modelos: ${mensagemErro}`);
    } finally {
      this.carregandoModelos = false;
    }
  }

  private salvarCacheSeguro(
    userId: string,
    dadosIndicadores: DadosIndicadoresCache,
  ) {
    try {
      const dadosCriptografados = encryptData(dadosIndicadores);
      localStorage.setItem(`facial_preloaded_${userId}`, dadosCriptografados);
    } catch {
      // Silent fail
    }
  }

  private carregarCacheSeguro(userId: string): DadosIndicadoresCache | null {
    try {
      const dadosCriptografados = localStorage.getItem(
        `facial_preloaded_${userId}`,
      );
      if (dadosCriptografados) {
        return decryptData(dadosCriptografados) as DadosIndicadoresCache;
      }
    } catch {
      try {
        localStorage.removeItem(`facial_preloaded_${userId}`);
      } catch {
        // Silent fail
      }
    }
    return null;
  }

  async preCarregarDadosFuncionario(userId: string): Promise<boolean> {
    try {
      if (this.temCacheValido(userId)) {
        return true;
      }

      await this.aguardarModelos();
      const cache = await this.processarImagensUsuario(userId);

      if (cache && cache.descriptors.length > 0) {
        this.cacheUsuarios.set(userId, cache);

        const dadosIndicadores: DadosIndicadoresCache = {
          timestamp: Date.now(),
          expiracao: cache.dataExpiracao,
          descriptorsCount: cache.descriptors.length,
          imagesCount: cache.imagensBase64.length,
        };

        this.salvarCacheSeguro(userId, dadosIndicadores);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async aguardarModelos(timeout: number = 30000): Promise<void> {
    const inicio = Date.now();

    while (
      !this.verificarModelosCarregados() &&
      Date.now() - inicio < timeout
    ) {
      if (this.modelosInicializandoPromise) {
        await this.modelosInicializandoPromise;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (!this.verificarModelosCarregados()) {
      throw new Error("Timeout: Modelos não foram carregados a tempo");
    }
  }

  private verificarModelosCarregados(): boolean {
    return (
      faceapi.nets.tinyFaceDetector.isLoaded &&
      faceapi.nets.faceLandmark68Net.isLoaded &&
      faceapi.nets.faceRecognitionNet.isLoaded
    );
  }

  private temCacheValido(userId: string): boolean {
    const cache = this.cacheUsuarios.get(userId);
    if (!cache) return false;

    const agora = Date.now();
    const valido = agora < cache.dataExpiracao && cache.descriptors.length > 0;

    if (!valido) {
      this.cacheUsuarios.delete(userId);
      this.removerCacheSeguro(userId);
    }

    return valido;
  }

  private removerCacheSeguro(userId: string) {
    try {
      localStorage.removeItem(`facial_preloaded_${userId}`);
    } catch {
      // Silent fail
    }
  }

  private limparCacheExpirado(): void {
    const agora = Date.now();

    for (const [userId, cache] of this.cacheUsuarios.entries()) {
      if (agora >= cache.dataExpiracao) {
        this.cacheUsuarios.delete(userId);
        this.removerCacheSeguro(userId);
      }
    }
  }

  private async processarImagensUsuario(
    userId: string,
  ): Promise<CacheUsuario | null> {
    try {
      const { data } = await api.get<{ images: DadosImagem[] }>(
        `/face/images/${userId}`,
        { timeout: 15000 },
      );

      if (!data.images || data.images.length === 0) {
        return null;
      }

      const descriptors: faceapi.LabeledFaceDescriptors[] = [];
      const imagensBase64: string[] = [];
      const agora = Date.now();

      const imagensParaProcessar = data.images.slice(0, 5);

      for (const img of imagensParaProcessar) {
        try {
          const resultado = await this.processarImagemIndividual(img, userId);

          if (resultado.descriptor) {
            descriptors.push(resultado.descriptor);
          }
          if (resultado.base64) {
            imagensBase64.push(resultado.base64);
          }

          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch {
          continue;
        }
      }

      if (descriptors.length === 0) {
        return null;
      }

      return {
        timestamp: agora,
        dataExpiracao: agora + this.CACHE_DURATION,
        descriptors,
        imagensBase64,
        userId,
      };
    } catch {
      return null;
    }
  }

  private async processarImagemIndividual(
    imagem: DadosImagem,
    userId: string,
  ): Promise<{
    descriptor: faceapi.LabeledFaceDescriptors | null;
    base64: string | null;
  }> {
    try {
      const respostaImagem = await api.get(imagem.url, {
        responseType: "blob",
        timeout: 10000,
      });

      const blobImagem = respostaImagem.data;

      if (!blobImagem || blobImagem.size === 0) {
        return { descriptor: null, base64: null };
      }

      const base64 = await this.blobParaBase64(blobImagem);
      const img = await faceapi.bufferToImage(blobImagem);

      if (!img || img.width === 0 || img.height === 0) {
        return { descriptor: null, base64 };
      }

      const tempCanvas = document.createElement("canvas");
      tempCanvas.setAttribute("willReadFrequently", "true");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
      if (!tempCtx) {
        return { descriptor: null, base64 };
      }

      tempCtx.drawImage(img, 0, 0, img.width, img.height);

      const opcoes = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.4,
      });

      const deteccao = await faceapi
        .detectSingleFace(tempCanvas, opcoes)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (
        !deteccao ||
        !deteccao.descriptor ||
        deteccao.descriptor.length === 0
      ) {
        return { descriptor: null, base64 };
      }

      const descriptor = new faceapi.LabeledFaceDescriptors(userId, [
        deteccao.descriptor,
      ]);

      return { descriptor, base64 };
    } catch {
      return { descriptor: null, base64: null };
    }
  }

  private blobParaBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (result && result.length > 0) {
            resolve(result);
          } else {
            reject(new Error("Base64 vazio ou inválido"));
          }
        };
        reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
        reader.readAsDataURL(blob);
      } catch (error) {
        reject(error);
      }
    });
  }

  funcionarioPreCarregado(userId: string): boolean {
    const temCache = this.temCacheValido(userId);

    if (temCache) {
      return true;
    }

    const cache = this.carregarCacheSeguro(userId);
    if (cache && cache.expiracao) {
      return Date.now() < cache.expiracao;
    }

    return false;
  }

  async carregarImagensDeReferenciaPorId(
    id: string,
  ): Promise<faceapi.LabeledFaceDescriptors[]> {
    try {
      if (this.temCacheValido(id)) {
        return this.cacheUsuarios.get(id)!.descriptors;
      }

      await this.aguardarModelos();

      const { data } = await api.get<{ images: DadosImagem[] }>(
        `/face/images/${id}`,
        { timeout: 15000 },
      );

      if (!data.images || data.images.length === 0) {
        return [];
      }

      const descritoresRotulados: faceapi.LabeledFaceDescriptors[] = [];

      for (const imagem of data.images) {
        try {
          const descritor = await this.processarImagem(imagem, id);
          if (descritor) {
            descritoresRotulados.push(descritor);
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch {
          continue;
        }
      }

      return descritoresRotulados;
    } catch (erro: unknown) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      throw new Error(
        `Falha ao carregar imagens de referência: ${mensagemErro}`,
      );
    }
  }

  private async processarImagem(
    imagem: DadosImagem,
    id: string,
  ): Promise<faceapi.LabeledFaceDescriptors | null> {
    try {
      const respostaImagem = await api.get(imagem.url, {
        responseType: "blob",
        timeout: 10000,
      });

      const blobImagem = respostaImagem.data;

      if (!blobImagem || blobImagem.size === 0) {
        return null;
      }

      const img = await faceapi.bufferToImage(blobImagem);

      if (!img || img.width === 0 || img.height === 0) {
        return null;
      }

      const tempCanvas = document.createElement("canvas");
      tempCanvas.setAttribute("willReadFrequently", "true");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
      if (!tempCtx) {
        return null;
      }

      tempCtx.drawImage(img, 0, 0, img.width, img.height);

      const opcoes = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.3,
      });

      const deteccao = await faceapi
        .detectSingleFace(tempCanvas, opcoes)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (
        !deteccao ||
        !deteccao.descriptor ||
        deteccao.descriptor.length === 0
      ) {
        return null;
      }

      return new faceapi.LabeledFaceDescriptors(id, [deteccao.descriptor]);
    } catch {
      return null;
    }
  }

  compararFace(
    descritor: Float32Array,
    imagensReferencia: faceapi.LabeledFaceDescriptors[],
    limiar: number = 0.6,
  ) {
    if (!descritor || descritor.length === 0) {
      throw new Error("Descritor facial inválido");
    }

    if (!imagensReferencia || imagensReferencia.length === 0) {
      throw new Error("Imagens de referência inválidas");
    }

    const descritoresValidos = imagensReferencia.filter(
      (img) => img.descriptors && img.descriptors.length > 0,
    );

    if (descritoresValidos.length === 0) {
      throw new Error("Nenhum descritor de referência válido encontrado");
    }

    try {
      const comparadorFacial = new faceapi.FaceMatcher(
        descritoresValidos,
        limiar,
      );
      return comparadorFacial.findBestMatch(descritor);
    } catch {
      throw new Error("Falha na comparação facial");
    }
  }

  async processarImagemCapturada(
    imagemBase64: string,
  ): Promise<Float32Array | null> {
    try {
      if (!imagemBase64 || !imagemBase64.startsWith("data:image")) {
        throw new Error("Imagem base64 inválida");
      }

      await this.aguardarModelos();

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Falha ao carregar imagem"));
        img.src = imagemBase64;
      });

      if (img.width === 0 || img.height === 0) {
        throw new Error("Imagem com dimensões inválidas");
      }

      const canvas = document.createElement("canvas");
      canvas.setAttribute("willReadFrequently", "true");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        throw new Error("Contexto do canvas não disponível");
      }

      ctx.drawImage(img, 0, 0);

      const opcoes = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      });

      const deteccao = await faceapi
        .detectSingleFace(canvas, opcoes)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!deteccao || !deteccao.descriptor) {
        return null;
      }

      return deteccao.descriptor;
    } catch {
      return null;
    }
  }

  obterImagensBase64Cache(userId: string): string[] {
    const cache = this.cacheUsuarios.get(userId);
    return cache?.imagensBase64 || [];
  }

  obterStatusSistema(): {
    modelosCarregados: boolean;
    usuariosEmCache: number;
    tempoRestanteCache: { [userId: string]: number };
  } {
    const tempoRestanteCache: { [userId: string]: number } = {};
    const agora = Date.now();

    for (const [userId, cache] of this.cacheUsuarios.entries()) {
      const tempoRestante = Math.max(0, cache.dataExpiracao - agora);
      tempoRestanteCache[userId] = Math.round(tempoRestante / 1000 / 60);
    }

    return {
      modelosCarregados: this.verificarModelosCarregados(),
      usuariosEmCache: this.cacheUsuarios.size,
      tempoRestanteCache,
    };
  }

  limparCache(userId?: string): void {
    if (userId) {
      this.cacheUsuarios.delete(userId);
      this.removerCacheSeguro(userId);
    } else {
      this.cacheUsuarios.clear();
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("facial_preloaded_")) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // Silent fail
      }
    }
  }

  estimarTempoVerificacao(userId: string): string {
    if (
      this.funcionarioPreCarregado(userId) &&
      this.verificarModelosCarregados()
    ) {
      return "1-2s";
    } else if (this.verificarModelosCarregados()) {
      return "3-5s";
    } else {
      return "8-12s";
    }
  }
}

export const servicoReconhecimentoFacial = new ServicoReconhecimentoFacial();
