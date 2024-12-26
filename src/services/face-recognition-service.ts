// src/services/face-recognition.ts
import { api } from "@/lib/axios";
import * as faceapi from "face-api.js";

interface ImageData {
  url: string;
  path: string;
}

export interface VerificationResult {
  isMatch: boolean;
  similarity: number;
  confidence: number;
  label: string;
  processingTime: number;
}

class FaceRecognitionService {
  private isInitialized = false;
  private readonly SIMILARITY_THRESHOLD = 0.6; // 60% de similaridade mínima
  private readonly CONFIDENCE_THRESHOLD = 0.7; // 70% de confiança mínima

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log("🚀 Iniciando carregamento dos modelos face-api.js...");
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);

      console.log("✅ Modelos carregados com sucesso!");
      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Erro ao carregar modelos:", error);
      throw error;
    }
  }

  async loadReferenceImagesById(
    id: string,
  ): Promise<faceapi.LabeledFaceDescriptors[]> {
    try {
      console.log(`📡 Buscando imagens de referência para ID ${id}...`);

      const { data } = await api.get<{ images: ImageData[] }>(
        `/face/images/${id}`,
      );
      console.log("📸 Imagens encontradas:", data.images?.length || 0);

      const labeledDescriptors = await Promise.all(
        data.images.map(async (image) => {
          try {
            const imageResponse = await api.get(image.url, {
              responseType: "blob",
            });
            const imgBlob = imageResponse.data;
            const img = await faceapi.bufferToImage(imgBlob);

            const detection = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (!detection) {
              console.warn(`⚠️ Nenhum rosto detectado em: ${image.path}`);
              return null;
            }

            return new faceapi.LabeledFaceDescriptors(id, [
              detection.descriptor,
            ]);
          } catch (error) {
            console.error(`❌ Erro ao processar imagem ${image.path}:`, error);
            return null;
          }
        }),
      );

      const validDescriptors = labeledDescriptors.filter(
        (desc): desc is faceapi.LabeledFaceDescriptors => desc !== null,
      );
      console.log(
        "✅ Descritores válidos carregados:",
        validDescriptors.length,
      );

      return validDescriptors;
    } catch (error) {
      console.error("❌ Erro ao carregar imagens de referência:", error);
      throw error;
    }
  }

  async verifyFace(
    capturedImage: string,
    funcionarioId: string,
  ): Promise<VerificationResult> {
    const startTime = performance.now();

    try {
      await this.initialize();

      // Carrega as imagens de referência do funcionário
      const referenceDescriptors =
        await this.loadReferenceImagesById(funcionarioId);

      if (referenceDescriptors.length === 0) {
        throw new Error(
          "Nenhuma imagem de referência encontrada para o funcionário",
        );
      }

      // Converte a imagem capturada para o formato aceito pelo face-api.js
      const img = await faceapi.bufferToImage(
        await (await fetch(capturedImage)).blob(),
      );

      // Detecta o rosto na imagem capturada
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error("Nenhum rosto detectado na imagem capturada");
      }

      // Cria o matcher com as imagens de referência
      const faceMatcher = new faceapi.FaceMatcher(
        referenceDescriptors,
        this.SIMILARITY_THRESHOLD,
      );

      // Faz o match do rosto capturado com as referências
      const match = faceMatcher.findBestMatch(detection.descriptor);

      const processingTime = performance.now() - startTime;

      return {
        isMatch: match.label !== "unknown",
        similarity: (1 - match.distance) * 100, // Converte para porcentagem
        confidence: this.CONFIDENCE_THRESHOLD * 100,
        label: match.label,
        processingTime,
      };
    } catch (error) {
      console.error("❌ Erro na verificação facial:", error);
      throw error;
    }
  }

  async verifyMultipleFaces(
    capturedImages: string[],
    funcionarioId: string,
  ): Promise<VerificationResult> {
    try {
      console.log(
        `🔍 Iniciando verificação de ${capturedImages.length} imagens...`,
      );

      const results = await Promise.all(
        capturedImages.map((img) => this.verifyFace(img, funcionarioId)),
      );

      // Calcula a média dos resultados
      const averageResult = results.reduce(
        (acc, curr) => {
          return {
            isMatch: acc.isMatch && curr.isMatch,
            similarity: acc.similarity + curr.similarity / results.length,
            confidence: this.CONFIDENCE_THRESHOLD * 100,
            label: curr.label,
            processingTime:
              acc.processingTime + curr.processingTime / results.length,
          };
        },
        {
          isMatch: true,
          similarity: 0,
          confidence: this.CONFIDENCE_THRESHOLD * 100,
          label: funcionarioId,
          processingTime: 0,
        },
      );

      console.log("✅ Verificação múltipla concluída:", averageResult);
      return averageResult;
    } catch (error) {
      console.error("❌ Erro na verificação múltipla:", error);
      throw error;
    }
  }
}

export const faceRecognitionService = new FaceRecognitionService();
