// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Add anti-aliasing and other renderer settings for optimal quality
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,   // Enable anti-aliasing
    alpha: true        // Optional: allows transparent backgrounds
});
renderer.setPixelRatio(window.devicePixelRatio);  // Adjust pixel ratio for sharper visuals on high-DPI screens
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;  // Enable shadow mapping for better depth perception
document.body.appendChild(renderer.domElement);

// Set up orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // for smooth controls
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 1.8;
controls.minDistance = 0.5;
controls.maxDistance = 50;

// Set up lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.1); // white light
scene.add(ambientLight);

// Load the GLTF model
const loader = new THREE.GLTFLoader();
loader.load('assets/14 SW.gltf', function(gltf) {
    const model = gltf.scene;
    model.position.set(0, -1, 0);
    model.scale.set(1, 1, 1);
    scene.add(model);

    // Optionally, log the GLTF model to inspect it
    console.log(gltf);
}, undefined, function(error) {
    console.error('An error occurred while loading the model:', error);
});

// Set the camera position
camera.position.set(4, 2, 4);

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Update orbit controls

    renderer.render(scene, camera);
}

animate();