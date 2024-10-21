let scene, camera, renderer, earthMesh, orbitPath, controls;
const container = document.getElementById('threejs-container');

// Create the scene
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 2, 20);

renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Add OrbitControls to enable camera rotation, zoom, and pan
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable inertia (smooth movement)
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false; // Prevent camera from panning vertically
controls.minDistance = 5; // Minimum zoom distance
controls.maxDistance = 100; // Maximum zoom distance

// Light
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(2, 1, 0.3).normalize();
scene.add(light);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Load the necessary textures
const material50BaseColor = textureLoader.load('assets/textures/Material_50_baseColor.jpeg');
const material50Emissive = textureLoader.load('assets/textures/Material_50_emissive.jpeg');
const material50MetallicRoughness = textureLoader.load('assets/textures/Material_50_metallicRoughness.png');
const material50Normal = textureLoader.load('assets/textures/Material_50_normal.png');
const material62BaseColor = textureLoader.load('assets/textures/Material_62_baseColor.png');
const material62Emissive = textureLoader.load('assets/textures/Material_62_emissive.jpeg');

// Load the GLTF Model
const loader = new THREE.GLTFLoader();
loader.load('assets/scene.gltf', function (gltf) {
    earthMesh = gltf.scene;

    // Traverse the model to apply textures based on material names or indices
    earthMesh.traverse(function (child) {
        if (child.isMesh) {
            const material = child.material;

            // Apply textures conditionally based on material names or indices
            if (child.name === 'Material_50') {
                material.map = material50BaseColor;
                material.emissiveMap = material50Emissive;
                material.roughnessMap = material50MetallicRoughness;
                material.metalnessMap = material50MetallicRoughness;
                material.normalMap = material50Normal;
            }

            if (child.name === 'Material_62') {
                material.map = material62BaseColor;
                material.emissiveMap = material62Emissive;
            }

            material.needsUpdate = true; // Make sure Three.js updates the material with the new textures
        }
    });

    // Add the model to the scene
    earthMesh.scale.set(1.5, 1.5, 1.5); // Adjust scale if needed
    scene.add(earthMesh);
}, undefined, function (error) {
    console.error('Error loading GLTF model:', error);
});

// Create the orbital path around the Earth
const orbitRadius = 5;
const curve = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    orbitRadius, orbitRadius, // xRadius, yRadius
    0, 2 * Math.PI,  // StartAngle, EndAngle
    false,           // Clockwise
    0                // Rotation
);
const points = curve.getPoints(100);
const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
orbitPath = new THREE.Line(orbitGeometry, orbitMaterial);
scene.add(orbitPath);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update the orbit controls
    if (earthMesh) {
        earthMesh.rotation.y += 0.001; // Rotate the Earth slowly
    }
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
