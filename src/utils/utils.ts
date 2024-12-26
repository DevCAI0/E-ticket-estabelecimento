// utils.ts
import { SelectionState } from '@/hooks/useReleases';
import * as faceapi from 'face-api.js';

interface ImageResponse {
  path: string;
  label: string;
  url: string;
}

interface ApiResponse {
  status: string;
  count: number;
  images: ImageResponse[];
}

interface ProcessingStatus {
  success: boolean;
  label: string;
  message: string;
  timing?: number;
}

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url, {
    credentials: 'include', // importante para CORS com cookies
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.blob();
}

async function blobToImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(blob);
  });
}

export const loadLabeledImages = async () => {
  console.log('🚀 Iniciando carregamento de imagens...');
  const processingResults: ProcessingStatus[] = [];
  
  try {
    console.log('📡 Fazendo requisição para o servidor...');
    const startFetch = performance.now();
    const response = await fetch('http://127.0.0.1:8000/api/face/images', {
      credentials: 'include' // importante para CORS com cookies
    });
    const data: ApiResponse = await response.json();
    const endFetch = performance.now();

    if (data.status === 'error') {
      throw new Error(`Erro do servidor: ${data.status}`);
    }

    console.log(`✅ ${data.count} imagens encontradas (${(endFetch - startFetch).toFixed(2)}ms)`);

    if (data.count === 0) {
      console.warn('⚠️ Nenhuma imagem encontrada no diretório');
      return [];
    }

    const descriptors = await Promise.all(
      data.images.map(async (image) => {
        const startProcess = performance.now();
        try {
          console.log(`🔄 Processando imagem: ${image.label}`);
          
          // Usando as novas funções para carregar imagem
          const blob = await fetchImageAsBlob(image.url);
          const img = await blobToImageElement(blob);

          console.log(`📸 Imagem carregada: ${image.label}`);

          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          const endProcess = performance.now();
          const processingTime = endProcess - startProcess;

          URL.revokeObjectURL(img.src); // Limpa a URL do blob

          if (!detection) {
            const message = `Nenhum rosto detectado na imagem`;
            processingResults.push({
              success: false,
              label: image.label,
              message,
              timing: processingTime
            });
            console.warn(`⚠️ ${image.label}: ${message} (${processingTime.toFixed(2)}ms)`);
            return null;
          }

          processingResults.push({
            success: true,
            label: image.label,
            message: 'Processado com sucesso',
            timing: processingTime
          });

          console.log(`✅ ${image.label}: Processado com sucesso (${processingTime.toFixed(2)}ms)`);
          return new faceapi.LabeledFaceDescriptors(image.label, [detection.descriptor]);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error(`❌ Erro em ${image.label}:`, errorMessage);
          processingResults.push({
            success: false,
            label: image.label,
            message: errorMessage
          });
          return null;
        }
      })
    );

    // Resultados do processamento
    const sucessos = processingResults.filter(r => r.success).length;
    const falhas = processingResults.filter(r => !r.success).length;
    
    console.log('\n📊 Resumo do Processamento:');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Falhas: ${falhas}`);
    
    if (falhas > 0) {
      console.log('\n⚠️ Detalhes das falhas:');
      processingResults
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`- ${result.label}: ${result.message} (${result?.timing?.toFixed(2)}ms)`);
        });
    }

    const validDescriptors = descriptors.filter((desc): desc is faceapi.LabeledFaceDescriptors => desc !== null);
    console.log(`\n🎉 Processamento finalizado: ${validDescriptors.length} descritores válidos`);

    return validDescriptors;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro crítico durante o processamento:', errorMessage);
    return [];
  }
  
};
// Adicione esta função após loadLabeledImages

export const compareFaces = async (
  labeledDescriptors: faceapi.LabeledFaceDescriptors[],
  liveDescriptor: Float32Array,
  solicitarTicket: (selection: SelectionState & { reconhecimento_facial: boolean }) => Promise<boolean>,
  selection: SelectionState
) => {
  console.log('🔄 Iniciando comparação de rostos...');
  try {
    const startCompare = performance.now();

    // Configurar o matcher com threshold de 0.6 (quanto menor, mais restrito)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

    // Encontrar a melhor correspondência
    const bestMatch = faceMatcher.findBestMatch(liveDescriptor);
    const endCompare = performance.now();

    // Calcular a similaridade em porcentagem (inversamente proporcional à distância)
    const similarity = (1 - bestMatch.distance) * 100;

    console.log('\n📊 Resultado da Comparação:');
    console.log(`✨ Melhor match: ${bestMatch.label}`);
    console.log(`📏 Similaridade: ${similarity.toFixed(2)}%`);
    console.log(`⏱️ Tempo de processamento: ${(endCompare - startCompare).toFixed(2)}ms`);

    const isMatch = bestMatch.label !== 'unknown';

    // Enviar para o servidor
    const reconhecimentoFacial = isMatch;

    const resultado = await solicitarTicket({
      ...selection,
      reconhecimento_facial: reconhecimentoFacial,
    });

    if (resultado) {
      console.log('🎉 Ticket gerado com sucesso após reconhecimento facial!');
    } else {
      console.log('⚠️ Falha ao gerar ticket após reconhecimento facial.');
    }

    // Retornar informações detalhadas
    return {
      isMatch,
      label: bestMatch.label,
      similarity: similarity,
      distance: bestMatch.distance,
      timestamp: new Date().toISOString(),
      processingTime: endCompare - startCompare,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro durante a comparação:', errorMessage);

    // Enviar tentativa de ticket com reconhecimento facial como `false`
    await solicitarTicket({
      ...selection,
      reconhecimento_facial: false,
    });

    return {
      isMatch: false,
      label: 'error',
      similarity: 0,
      distance: 1,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
  }
};


// Interface para o resultado da comparação
export interface FaceMatchResult {
  isMatch: boolean;
  label: string;
  similarity: number;
  distance: number;
  timestamp: string;
  processingTime?: number;
  error?: string;
}


