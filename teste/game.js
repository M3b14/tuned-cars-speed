import * as THREE from "https://esm.sh/three@0.152.2";
import { GLTFLoader } from "https://esm.sh/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.152.2/examples/jsm/controls/OrbitControls.js";

// ================= CENA =================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

camera.position.set(0, 10, 20);

// ================= RENDER =================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ================= CONTROLS =================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;

// ================= LUZ =================
const ambient = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(100, 200, 100);
scene.add(sun);

// ================= LOADER =================
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();

// ================= VARIÁVEIS =================
let car;
let city;
let speed = 0;
let nitro = 100;
let money = 0;
let timer = 0;

const keys = {};

// ================= INPUT =================
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ================= MAPA =================
loader.load(
  "./assets/race_track_23mb_glb",
  (gltf) => {
    city = gltf.scene;

    city.scale.set(20, 20, 20);
    city.position.set(0, -5, 0);

    scene.add(city);

    console.log("Mapa carregado");
  },
  undefined,
  (error) => {
    console.log("Erro mapa:", error);
  }
);

// ================= CARRO =================
loader.load(
  "./assets/1999_nissan_skyline_gtr_r34_c-west__2f2f.glb",
  (gltf) => {
    car = gltf.scene;

    car.scale.set(2000, 2000, 2000);
    car.position.set(0, 2, 0);
    car.rotation.y = Math.PI;

    scene.add(car);

    console.log("Carro carregado");
  },
  undefined,
  (error) => {
    console.log("Erro carro:", error);
  }
);

// ================= UPDATE =================
function updateCar() {
  if (!car) return;

  // acelerar/frear
  if (keys["w"]) speed += 0.5;
  if (keys["s"]) speed -= 0.05;

  speed *= 0.98;

  // virar
  if (keys["a"]) car.rotation.y += 0.03;
  if (keys["d"]) car.rotation.y -= 0.03;

  // nitro
  if (keys["shift"] && nitro > 2) {
    speed += 0.03;
    nitro -= 1;
  }

  nitro = Math.min(100, nitro + 0.2);

  // drift = ganhar dinheiro
  if (keys[" "]) {
    money += 1;
  }

  // movimento
  car.position.x += Math.sin(car.rotation.y) * speed;
  car.position.z += Math.cos(car.rotation.y) * speed;

  // raycast no chão
  if (city) {
    raycaster.set(
      new THREE.Vector3(
        car.position.x,
        car.position.y + 50,
        car.position.z
      ),
      new THREE.Vector3(0, -1, 0)
    );

    const hits = raycaster.intersectObject(city, true);

    if (hits.length > 0) {
      car.position.y = hits[0].point.y + 8;
    }
  }

  // ================= CAMERA ESTILO CORRIDA =================
  const distance = 80;
  const height = 50;

  const camX = car.position.x - Math.sin(car.rotation.y) * distance;
  const camY = car.position.y + height;
  const camZ = car.position.z - Math.cos(car.rotation.y) * distance;

  camera.position.lerp(
    new THREE.Vector3(camX, camY, camZ),
    0.10
  );

  camera.lookAt(
    car.position.x,
    car.position.y + 2,
    car.position.z
  );

  // ================= HUD =================
  document.getElementById("speed").innerText =
    "VEL: " + Math.floor(Math.abs(speed) * 220) + " KM/H";

  document.getElementById("nitro").innerText =
    "NITRO: " + Math.floor(nitro) + "%";

  document.getElementById("money").innerText =
    "MONEY: $" + money;

  document.getElementById("time").innerText =
    "TIME: " + Math.floor(timer) + " s";
}

// ================= LOOP =================
function animate() {
  requestAnimationFrame(animate);

  timer += 0.016;

  updateCar();

  renderer.render(scene, camera);
}

animate();

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
