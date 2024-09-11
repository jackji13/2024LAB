import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const canvas = document.getElementById('cubeCanvas');

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
    loadTexture('assets/L.png'),
    loadTexture('assets/A.png'),
    loadTexture('assets/B.png'),

]).then(([textureL, textureA, textureB]) => {
    const materials = [
        new THREE.MeshBasicMaterial({ map: textureB, transparent: true }),
        new THREE.MeshBasicMaterial({ map: textureA, transparent: true }),
        new THREE.MeshBasicMaterial({ map: textureL, transparent: true }),
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
        renderer.render(scene, camera);
    }
    animate();
});

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