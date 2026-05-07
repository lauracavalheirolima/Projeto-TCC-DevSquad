// script.js

const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('three-canvas');

// ==== Setup Three.js ====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, canvasElement.clientWidth / canvasElement.clientHeight, 0.1, 100);
camera.position.z = 1.5;

const renderer = new THREE.WebGLRenderer({ canvas: canvasElement });
renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);

// Criar esferas para cada landmark
const spheres = [];
const sphereGeometry = new THREE.SphereGeometry(0.02, 16, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
for (let i = 0; i < 21; i++) {
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);
  spheres.push(sphere);
}

// Conexões entre os pontos da mão (para desenhar linhas)
const connections = [
  [0,1],[1,2],[2,3],[3,4],      // Polegar
  [0,5],[5,6],[6,7],[7,8],      // Indicador
  [0,9],[9,10],[10,11],[11,12], // Médio
  [0,13],[13,14],[14,15],[15,16], // Anelar
  [0,17],[17,18],[18,19],[19,20]  // Mínimo
];

const lines = [];
connections.forEach(conn => {
  const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(), new THREE.Vector3()
  ]);
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  lines.push({ line, conn });
});

// ==== Setup MediaPipe Hands ====
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const cameraFeed = new Camera(videoElement, {
  onFrame: async () => { await hands.send({ image: videoElement }); },
  width: 640,
  height: 480
});
cameraFeed.start();

// ==== Processar resultados ====
function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    landmarks.forEach((lm, i) => {
      // Ajustar coordenadas para Three.js (-0.5 a 0.5)
      spheres[i].position.set(lm.x - 0.5, -lm.y + 0.5, -lm.z);
    });

    // Atualizar linhas
    lines.forEach(({line, conn}) => {
      line.geometry.setFromPoints([
        spheres[conn[0]].position,
        spheres[conn[1]].position
      ]);
    });
  }
}

// ==== Render Loop ====
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();