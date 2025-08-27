import * as faceapi from "@vladmandic/face-api";
import {
  buscarImagensReferenciaPorId,
  buscarImagemComoBlob,
  dataUrlParaBlob,
} from "@/api/facial-recognition/face-images";
import { showErrorToast } from "@/components/ui/sonner";

export interface VerificationResult {
  isMatch: boolean;
  similarity: number;
  confidence: number;
  label: string;
  processingTime: number;
}

class FaceRecognitionService {
  private isInitialized = false;
  private readonly SIMILARITY_THRESHOLD = 0.6;
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);

      this.isInitialized = true;
    } catch (error) {
      showErrorToast("Erro ao carregar modelos de reconhecimento facial");
      throw error;
    }
  }

  async loadReferenceImagesById(
    id: string,
  ): Promise<faceapi.LabeledFaceDescriptors[]> {
    try {
      const images = await buscarImagensReferenciaPorId(id);

      const labeledDescriptors = await Promise.all(
        images.map(async (image) => {
          try {
            const imgBlob = await buscarImagemComoBlob(image.url);
            const img = await faceapi.bufferToImage(imgBlob);

            const detection = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (!detection) {
              return null;
            }

            return new faceapi.LabeledFaceDescriptors(id, [
              detection.descriptor,
            ]);
          } catch (_error) {
            return null;
          }
        }),
      );

      const validDescriptors = labeledDescriptors.filter(
        (desc): desc is faceapi.LabeledFaceDescriptors => desc !== null,
      );

      return validDescriptors;
    } catch (error) {
      showErrorToast("Erro ao carregar imagens de referência");
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

      const referenceDescriptors =
        await this.loadReferenceImagesById(funcionarioId);

      if (referenceDescriptors.length === 0) {
        throw new Error(
          "Nenhuma imagem de referência encontrada para o funcionário",
        );
      }

      const imgBlob = await dataUrlParaBlob(capturedImage);
      const img = await faceapi.bufferToImage(imgBlob);

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error("Nenhum rosto detectado na imagem capturada");
      }

      const faceMatcher = new faceapi.FaceMatcher(
        referenceDescriptors,
        this.SIMILARITY_THRESHOLD,
      );

      const match = faceMatcher.findBestMatch(detection.descriptor);

      const processingTime = performance.now() - startTime;

      return {
        isMatch: match.label !== "unknown",
        similarity: (1 - match.distance) * 100,
        confidence: this.CONFIDENCE_THRESHOLD * 100,
        label: match.label,
        processingTime,
      };
    } catch (error) {
      showErrorToast("Erro na verificação facial");
      throw error;
    }
  }

  async verifyMultipleFaces(
    capturedImages: string[],
    funcionarioId: string,
  ): Promise<VerificationResult> {
    try {
      const results = await Promise.all(
        capturedImages.map((img) => this.verifyFace(img, funcionarioId)),
      );

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

      return averageResult;
    } catch (error) {
      showErrorToast("Erro na verificação múltipla");
      throw error;
    }
  }
}

export const faceRecognitionService = new FaceRecognitionService();
