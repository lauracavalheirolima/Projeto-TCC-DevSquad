const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
const canvasCtx = canvasElement.getContext('2d');


// ===============================
// MEDIA PIPE HANDS
// ===============================

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onResults);


// ===============================
// DESENHO DOS RESULTADOS
// ===============================

function onResults(results) {

  // Ajusta tamanho do canvas
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // Limpa canvas
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // ===============================
  // MODO SELFIE (ESPELHADO)
  // ===============================

  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);

  // Desenha webcam
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  // ===============================
  // SE DETECTAR MÃO
  // ===============================

  if (results.multiHandLandmarks) {

    for (const landmarks of results.multiHandLandmarks) {

      // ===============================
      // PROFUNDIDADE MÉDIA
      // ===============================

      const avgZ =
        landmarks.reduce((sum, point) => sum + point.z, 0)
        / landmarks.length;

      // ===============================
      // TAMANHO DINÂMICO DAS LINHAS
      // ===============================

      const dynamicLineWidth =
        Math.max(1, 6 - avgZ * 25);

      // ===============================
      // COR DINÂMICA
      // ===============================

      const lineColor =
        avgZ < 0
          ? '#00FF88'
          : '#00AAFF';

      // ===============================
      // EFEITO NEON
      // ===============================

      canvasCtx.shadowColor = lineColor;
      canvasCtx.shadowBlur = 20;

      // ===============================
      // DESENHA CONEXÕES
      // ===============================

      drawConnectors(
        canvasCtx,
        landmarks,
        HAND_CONNECTIONS,
        {
          color: lineColor,
          lineWidth: dynamicLineWidth
        }
      );

      // ===============================
      // DESENHA PONTOS
      // ===============================

      for (const point of landmarks) {

        const depth = point.z;

        // Quanto mais perto, maior
        const radius =
          Math.max(2, 8 - depth * 25);

        drawLandmarks(
          canvasCtx,
          [point],
          {
            color: '#FF3333',
            fillColor: '#FF0000',
            radius: radius
          }
        );
      }
    }
  }

  canvasCtx.restore();
}


// ===============================
// INICIA CÂMERA
// ===============================

const camera = new window.Camera(videoElement, {
  onFrame: async () => {
    await hands.send({
      image: videoElement
    });
  },

  width: 1280,
  height: 720
});

camera.start();