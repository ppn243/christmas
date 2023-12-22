import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(4, 5, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// Tạo hệ thống hạt tuyết
const snowflakeTexture = new THREE.TextureLoader().load(
  "/496029_silver-snowflake-png.png"
);
const particleGeometry = new THREE.BufferGeometry();
const particles = 500;

const positions = new Float32Array(particles * 3);

for (let i = 0; i < particles * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 20;
  positions[i + 1] = Math.random() * 10;
  positions[i + 2] = (Math.random() - 0.5) * 20;
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  size: 0.2,
  map: snowflakeTexture,
  transparent: true,
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Tạo đất
const groundGeometry = new THREE.PlaneGeometry(10, 10, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Tạo đèn
const spotLight = new THREE.SpotLight(0xffffff, 1, 100000, 0.2, 0.5);
spotLight.position.set(300, 1185, 100);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.intensity = 2;
scene.add(spotLight);

// Tải model
const loader = new GLTFLoader().setPath("public/millennium_falcon/");
loader.load(
  "scene.gltf",
  (gltf) => {
    const mesh = gltf.scene;

    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    mesh.position.set(1, 0, 1);
    scene.add(mesh);

    document.getElementById("progress-container").style.display = "none";
  },
  (xhr) => {
    document.getElementById("progress").innerHTML = `LOADING ${
      Math.max(xhr.loaded / xhr.total, 1) * 100
    }/100`;
  }
);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  // Cập nhật vị trí của hạt tuyết
  for (let i = 0; i < particles * 3; i += 3) {
    positions[i + 1] -= 0.05;
    if (positions[i + 1] < 0) {
      positions[i + 1] = 10;
    }
  }

  particleGeometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
}

animate();
