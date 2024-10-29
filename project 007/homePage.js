// Set up the basic Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true, // Enable anti-aliasing
    alpha: true // Optional: allows transparent backgrounds
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
scene.add(ambientLight);

camera.position.set(0, 5, 20);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const gridGroup = new THREE.Group();
scene.add(gridGroup);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const loader = new THREE.GLTFLoader();
let models = [];

// Adjust gaps for the 10x5 grid
const horizontalGap = 5;
const verticalGap = 4;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Loading screen
const loadingScreen = document.getElementById('loading-screen');

// Track how many models have been loaded
let modelsLoaded = 0;
const totalModels = 40; // Since you have 40 models in total
let allModelsRendered = false; // Flag to check if all models have been rendered

// Function to handle clicks and redirect to details page with model name
function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true);

    if (intersects.length > 0) {
        const selectedModel = intersects[0].object.parent;
        const modelName = selectedModel.name;
        // Redirect to details.html with the selected model name in the URL
        window.location.href = `details.html?model=${encodeURIComponent(modelName)}`;
    }
}

window.addEventListener('click', onClick, false);

// Function to load models and track loading progress
const loadModel = (fileName, x, y) => {
    loader.load(`assets/${fileName}.glb`, (gltf) => {
        const model = gltf.scene;
        model.position.set(x, y, 0);
        model.scale.set(1, 1, 1);
        model.name = fileName;
        models.push(model);
        gridGroup.add(model);

        // Increment the models loaded count
        modelsLoaded++;

        // Check if all models are loaded
        if (modelsLoaded === totalModels) {
            // Wait for one render cycle before hiding the loading screen
            allModelsRendered = true;
        }
    }, undefined, (error) => {
        console.error(`An error occurred while loading ${fileName}:`, error);
    });
};

// Update model names for all 40 corners
const modelNames = [
    "14NE", "14NW", "14SE", "14SW",
    "15NE", "15NW", "15SE", "15SW",
    "16NE", "16NW", "16SE", "16SW",
    "17NE", "17NW", "17SE", "17SW",
    "18NE", "18NW", "18SE", "18SW",
    "19NE", "19NW", "19SE", "19SW",
    "20NE", "20NW", "20SE", "20SW",
    "21NE", "21NW", "21SE", "21SW",
    "22NE", "22NW", "22SE", "22SW",
    "23NE", "23NW", "23SE", "23SW"
];

// Set starting position for the grid
let col = -20; // Adjust starting position for the wider grid
let row = 11.5;  // Adjust starting row position

// Create the 10-column, 5-row grid
modelNames.forEach((modelName, index) => {
    const x = col + (index % 10) * horizontalGap;  // Adjust for 10 columns
    const y = row - Math.floor(index / 10) * verticalGap; // Adjust for 5 rows
    loadModel(modelName, x, y);
});

// Animation loop (runs after all models are loaded)
function animate() {
    requestAnimationFrame(animate);

    models.forEach((model) => {
        model.rotation.y += 0.001;
    });

    controls.update();
    renderer.render(scene, camera);

    // Check if all models have rendered, and remove the loading screen smoothly
    if (allModelsRendered) {
        hideLoadingScreen();
    }
}

// Function to hide the loading screen with a smooth transition
function hideLoadingScreen() {
    loadingScreen.style.transition = 'opacity 0.5s ease'; // Add smooth fade-out transition
    loadingScreen.style.opacity = 0; // Trigger fade-out

    setTimeout(() => {
        loadingScreen.style.display = 'none'; // Hide after transition
        allModelsRendered = false; // Reset the flag
    }, 500); // Wait for the transition to complete
}

// Adjust the grid's overall position if necessary
gridGroup.position.set(-2.5, -4, 0);

animate();
