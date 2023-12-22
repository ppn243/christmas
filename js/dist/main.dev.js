"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var THREE = _interopRequireWildcard(require("three"));

var _GLTFLoader = require("three/addons/loaders/GLTFLoader.js");

var _OrbitControls = require("three/addons/controls/OrbitControls.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 5, 11);
var controls = new _OrbitControls.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update(); // Tạo hệ thống hạt tuyết

var snowflakeTexture = new THREE.TextureLoader().load("/496029_silver-snowflake-png.png");
var particleGeometry = new THREE.BufferGeometry();
var particles = 500;
var positions = new Float32Array(particles * 3);

for (var i = 0; i < particles * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 20;
  positions[i + 1] = Math.random() * 10;
  positions[i + 2] = (Math.random() - 0.5) * 20;
}

particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
var particleMaterial = new THREE.PointsMaterial({
  size: 0.2,
  map: snowflakeTexture,
  transparent: true
});
var particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem); // Tạo đất

var groundGeometry = new THREE.PlaneGeometry(10, 10, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
var groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide
});
var groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh); // Tạo đèn

var spotLight = new THREE.SpotLight(0xffffff, 1, 100000, 0.2, 0.5);
spotLight.position.set(300, 1185, 100);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.intensity = 2;
scene.add(spotLight); // Tải model

var loader = new _GLTFLoader.GLTFLoader().setPath("public/millennium_falcon/");
loader.load("scene.gltf", function (gltf) {
  var mesh = gltf.scene;
  mesh.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  mesh.position.set(1, 0, 1);
  scene.add(mesh);
  document.getElementById("progress-container").style.display = "none";
}, function (xhr) {
  document.getElementById("progress").innerHTML = "LOADING ".concat(Math.max(xhr.loaded / xhr.total, 1) * 100, "/100");
});
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate); // Cập nhật vị trí của hạt tuyết

  for (var _i = 0; _i < particles * 3; _i += 3) {
    positions[_i + 1] -= 0.05;

    if (positions[_i + 1] < 0) {
      positions[_i + 1] = 10;
    }
  }

  particleGeometry.attributes.position.needsUpdate = true;
  controls.update();
  renderer.render(scene, camera);
}

animate();