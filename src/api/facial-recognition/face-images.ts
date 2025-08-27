import { api } from "@/lib/axios";
import { showErrorToast } from "@/components/ui/sonner";

export interface ImageData {
  url: string;
  path: string;
}

export async function buscarImagensReferenciaPorId(
  id: string,
): Promise<ImageData[]> {
  try {
    const { data } = await api.get<{ images: ImageData[] }>(
      `/face/images/${id}`,
    );
    return data.images;
  } catch (error) {
    showErrorToast("Erro ao buscar imagens de referência");
    throw error;
  }
}

export async function buscarImagemComoBlob(url: string): Promise<Blob> {
  try {
    const imageResponse = await api.get(url, {
      responseType: "blob",
    });
    return imageResponse.data;
  } catch (error) {
    showErrorToast("Erro ao buscar imagem");
    throw error;
  }
}

export async function dataUrlParaBlob(dataUrl: string): Promise<Blob> {
  try {
    return await (await fetch(dataUrl)).blob();
  } catch (error) {
    showErrorToast("Erro ao converter imagem");
    throw error;
  }
}
