export type VerificationStep = "INITIAL" | "COMPARING" | "SUCCESS" | "FAILED";

export interface VerificationResult {
  isMatch: boolean;
  label: string;
  similarity: number;
  confidence: number;
  processingTime: number;
  timestamp: string;
  distance: number;
  errorMessage?: string;
  message?: string; // Propriedade opcional para mensagens de erro
  referenceImagesCount: number; // Certifique-se de usar o nome correto aqui
}
