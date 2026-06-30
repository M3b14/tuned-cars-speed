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

camera.position.set(0, 8, -15);

// ================= RENDER =================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ================= CONTROLS =================
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableZoom = true;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2.2;

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
  "./assets/chicken_gun_fruzer_megapolis.glb",
  (gltf) => {
    city = gltf.scene;

    city.scale.set(3, 3, 3);
    city.position.set(0, 485, 0);

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

    car.scale.set(200, 200, 200);
    car.position.set(15, 490, 25);
    car.rotation.y = Math.PI;

    scene.add(car);

    console.log("Carro carregado");
  },
  undefined,
  (error) => {
    console.log("Erro carro:", error);
  }
);

// ================= UPDATE CAR =================
function updateCar() {
  if (!car || !city) return;

  // movimento
  if (keys["w"]) speed += 0.08;
  if (keys["s"]) speed -= 0.03;

  speed *= 0.97;

  if (keys["a"]) car.rotation.y += 0.04;
  if (keys["d"]) car.rotation.y -= 0.04;

  // nitro
  if (keys["shift"] && nitro > 0) {
    speed += 0.03;
    nitro -= 1;
  }

  nitro = Math.min(100, nitro + 0.2);

  // dinheiro teste
  if (keys[" "]) {
    money += 1;
  }

  // andar
  car.position.x += Math.sin(car.rotation.y) * speed;
  car.position.z += Math.cos(car.rotation.y) * speed;

  // grudar na rua
  raycaster.set(
    new THREE.Vector3(
      car.position.x,
      car.position.y + 100,
      car.position.z
    ),
    new THREE.Vector3(0, -1, 0)
  );

  const hits = raycaster.intersectObject(city, true);

  if (hits.length > 0) {
    let highest = hits[0];

    for (let i = 1; i < hits.length; i++) {
      if (hits[i].point.y > highest.point.y) {
        highest = hits[i];
      }
    }

    car.position.y = highest.point.y + 1;
  }

  // camera segue o carro
  const camOffset = new THREE.Vector3(
    Math.sin(car.rotation.y) * -15,
    8,
    Math.cos(car.rotation.y) * -15
  );

  const targetCam = car.position.clone().add(camOffset);

  camera.position.lerp(targetCam, 0.08);

  const lookTarget = new THREE.Vector3(
    car.position.x,
    car.position.y + 2,
    car.position.z
  );

  controls.target.lerp(lookTarget, 0.08);

  // HUD
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
  controls.update();

  renderer.render(scene, camera);
}

animate();

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});