import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';
import './style.css';

let canvas = document.getElementById('canvas');

// Create the scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 6);

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Add HDRI lighting
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/blue_lagoon_night_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
    scene.background.intensity = 0.1;

});

const loader = new GLTFLoader();
let gltfScene;
let mixer;
let clip;
let action;

loader.load('./src/new.glb', function (gltf) {
    gltfScene = gltf.scene;
    gltfScene.intensity=10
    scene.add(gltfScene);

    gltfScene.position.set(4, -3, -1);

    mixer = new AnimationMixer(gltfScene);

    if (gltf.animations && gltf.animations.length > 0) {
        clip = gltf.animations[0];
        action = mixer.clipAction(clip);
        action.play();
    }
}, undefined, function (error) {
    console.error(error);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

let animationRunning = true;

// Create scroll bar and animation button.
let scrollBar = document.getElementById('scrollBar')
scrollBar.type = 'range';
scrollBar.min = '0';
scrollBar.max = '1';
scrollBar.step = '0.001';
scrollBar.value = '0';
scrollBar.style.position = 'absolute';
scrollBar.style.bottom = '20px';
scrollBar.style.left = '20px';
scrollBar.style.width = '200px';


let animationButton = document.getElementById('animationButton');
animationButton.textContent = '⏹️';
animationButton.style.position = 'absolute';



scrollBar.addEventListener('input', () => {
    if (mixer && clip) {
        mixer.setTime(clip.duration * parseFloat(scrollBar.value));
    }
});

animationButton.addEventListener('click', () => {
    animationRunning = !animationRunning;
    animationButton.textContent = animationRunning ? '⏹️' : '▶️';

    if (mixer) {
        if (animationRunning) {
            mixer.timeScale = 1; //Resume animation
        } else {
            mixer.timeScale = 0; //Pause animation
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (mixer && clip) {
        if (animationRunning) {
            mixer.update(clock.getDelta());
        }

        scrollBar.value = mixer.time / clip.duration;
        if (mixer.time >= clip.duration) {
            mixer.setTime(clip.duration);
            animationRunning = false;
            animationButton.textContent = '▶️';
            mixer.timeScale = 0;
        }
    }

    renderer.render(scene, camera);
}

animate();