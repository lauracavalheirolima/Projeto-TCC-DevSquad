const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// Configuração do MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

// Configurações
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Resultado da detecção
hands.onResults(onResults);

function onResults(results) {

  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Fundo preto
  canvasCtx.fillStyle = "black";
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // =========================
  // ESPELHA APENAS A MÃO
  // =========================
  canvasCtx.save();

  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);

  if (results.multiHandLandmarks && results.multiHandedness) {

    for (let i = 0; i < results.multiHandLandmarks.length; i++) {

      const landmarks = results.multiHandLandmarks[i];

      drawConnectors(
        canvasCtx,
        landmarks,
        HAND_CONNECTIONS,
        {
          color: '#00FF00',
          lineWidth: 2
        }
      );

      drawLandmarks(
        canvasCtx,
        landmarks,
        {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        }
      );
    }
  }

  canvasCtx.restore();

  // =========================
  // TEXTO NORMAL
  // =========================
  if (results.multiHandLandmarks && results.multiHandedness) {

    for (let i = 0; i < results.multiHandLandmarks.length; i++) {

      const landmarks = results.multiHandLandmarks[i];
      const handedness = results.multiHandedness[i];

      const handLabel =
        handedness.label === "Right"
          ? "LH"
          : "RH";

      // Corrige posição X por causa do espelho
      const x = canvasElement.width - (landmarks[0].x * canvasElement.width);

      const y = landmarks[0].y * canvasElement.height;

      canvasCtx.font = "30px Arial";
      canvasCtx.fillStyle = "#FFFFFF";

      canvasCtx.fillText(handLabel, x + 10, y + 30);
    }
  }
}

// Inicializa câmera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});

camera.start();