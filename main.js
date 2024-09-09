import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('cubeCanvas');  // Get the specific canvas for the cube

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const vertexShader = `
    varying vec3 vPosition;
    void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    varying vec3 vPosition;
    uniform float time;
    void main() {
        float r = 0.5 + 0.5 * sin(vPosition.x * 2.0 + time);
        float g = 0.5 + 0.5 * sin(vPosition.y * 2.0 + time);
        float b = 0.5 + 0.5 * sin(vPosition.z * 2.0 + time);
        gl_FragColor = vec4(r, g, b, 1.0);
    }
`;

const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        time: { value: 0.0 }
    }
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(geometry, shaderMaterial);
scene.add(cube);

const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
const loader = new THREE.TextureLoader();

function loadTexture(url) {
    return new Promise((resolve) => {
        loader.load(url, (texture) => {
            texture.anisotropy = maxAnisotropy;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            resolve(texture);
        });
    });
}

Promise.all([
    loadTexture('assets/P.png'),
    loadTexture('assets/O.png'),
    loadTexture('assets/T.png'),
    loadTexture('assets/Y.png')
]).then(([textureP, textureO, textureT, textureY]) => {
    const materials = [
        new THREE.MeshBasicMaterial({ map: textureP, transparent: true }),
        new THREE.MeshBasicMaterial({ map: textureY, transparent: true }),
        new THREE.MeshBasicMaterial({ map: textureT, transparent: true }),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
        new THREE.MeshBasicMaterial({ map: textureO, transparent: true }),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    ];
    const overlayGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    const overlayCube = new THREE.Mesh(overlayGeometry, materials);
    scene.add(overlayCube);

    function animate() {
        requestAnimationFrame(animate);
        shaderMaterial.uniforms.time.value += 0.02;
        cube.rotation.x += scrollSpeed;
        cube.rotation.y += scrollSpeed;
        overlayCube.rotation.x = cube.rotation.x;
        overlayCube.rotation.y = cube.rotation.y;
        overlayCube.rotation.z = cube.rotation.z;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let scrollSpeed = 0.003;
const defaultRotationSpeed = 0.003;
let scrollTimeout;

function updateRotationSpeed() {
    clearTimeout(scrollTimeout);
    scrollSpeed = window.scrollY !== 0 ? 0.01 * Math.sign(window.scrollY) : defaultRotationSpeed;
    scrollTimeout = setTimeout(() => {
        scrollSpeed = defaultRotationSpeed;
    }, 20);
}

window.addEventListener('scroll', updateRotationSpeed);