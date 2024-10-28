import * as faceapi from 'face-api.js';

export const loadLabeledImages = async () => {
  const labels = ['caio1', 'caio2', 'caio3', 'caio4', 'caio5'];
  const descriptors = await Promise.all(
    labels.map(async (label) => {
      try {
        const img = await faceapi.fetchImage(`/caio/${label}.jpeg`);
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        return detection ? new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]) : null;
      } catch (error) {
        console.error(`Erro ao carregar ou processar ${label}.jpeg:`, error);
        return null;
      }
    })
  );

  return descriptors.filter((desc) => desc !== null);
};

export const compareFaces = (
  labeledDescriptors: faceapi.LabeledFaceDescriptors[],
  liveDescriptor: Float32Array
) => {
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
  const bestMatch = faceMatcher.findBestMatch(liveDescriptor);
  
  // Adicionar lógica de verificação para exibir apenas uma vez
  if (bestMatch.label !== 'unknown') {
    console.log(`Similaridade: ${(1 - bestMatch.distance) * 100}%`);
  }

  return bestMatch.label !== 'unknown';
};
