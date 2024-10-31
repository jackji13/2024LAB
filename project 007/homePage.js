const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
scene.add(ambientLight);

let currentView = 'gallery';
camera.position.set(0, 11, 20);
camera.lookAt(0, 5, 0);

const gridGroup = new THREE.Group();
scene.add(gridGroup);

const pointLight = new THREE.PointLight(0xffffff, 0, 15);
pointLight.position.set(0, 10, 10);
pointLight.castShadow = true;
scene.add(pointLight);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const loader = new THREE.GLTFLoader();
let models = [];

const GalleryXGap = 5;
const GalleryYGap = 4;

const StreetXGap = 8;
const StreetZGap = 6;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const loadingScreen = document.getElementById('loading-screen');

let modelsLoaded = 0;
const totalModels = 40;
let allModelsRendered = false;

function updateRaycasterTargets() {
    raycaster.objects = models;
}

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true);

    if (intersects.length > 0) {
        const selectedModel = intersects[0].object.parent;
        const modelName = selectedModel.name;
        window.location.href = `details.html?model=${encodeURIComponent(modelName)}`;
    }
}
window.addEventListener('click', onClick, false);

function onHover(intersectedModel) {
    intersectedModel.traverse((child) => {
        if (child.isMesh) {
            gsap.to(child.material.color, { r: 1, g: 1, b: 1, duration: 0.5, ease: "power2.inOut" });
            gsap.to(child.material.emissive, { r: 0.5, g: 0.5, b: 0.5, duration: 0.5, ease: "power2.inOut" });
        }
    });
    gsap.to(pointLight, { intensity: 2, duration: 0.5, ease: "power2.inOut" });
}

function resetMaterial(intersectedModel) {
    intersectedModel.traverse((child) => {
        if (child.isMesh) {
            gsap.to(child.material.color, { r: 0.8, g: 0.8, b: 0.8, duration: 0.5, ease: "power2.inOut" });
            gsap.to(child.material.emissive, { r: 0, g: 0, b: 0, duration: 0.5, ease: "power2.inOut" });
        }
    });
    gsap.to(pointLight, { intensity: 0, duration: 0.5, ease: "power2.inOut" });
}

const loadModel = (fileName, x, y, z) => {
    loader.load(`assets/lowpoly/${fileName}-L.glb`, (gltf) => {
        const model = gltf.scene;
        model.position.set(x, y, z);
        model.scale.set(1, 1, 1);
        model.name = fileName;
        models.push(model);
        gridGroup.add(model);

        modelsLoaded++;
        if (modelsLoaded === totalModels) {
            allModelsRendered = true;
            updateRaycasterTargets();
        }
    }, undefined, (error) => {
        console.error(`An error occurred while loading ${fileName}-L.glb:`, error);
    });
};

const modelNames = [
    "14NE", "14NW", "14SE", "14SW", "15NE", "15NW", "15SE", "15SW",
    "16NE", "16NW", "16SE", "16SW", "17NE", "17NW", "17SE", "17SW",
    "18NE", "18NW", "18SE", "18SW", "19NE", "19NW", "19SE", "19SW",
    "20NE", "20NW", "20SE", "20SW", "21NE", "21NW", "21SE", "21SW",
    "22NE", "22NW", "22SE", "22SW", "23NE", "23NW", "23SE", "23SW"
];

function arrangeGalleryView() {
    camera.position.set(0, 11, 20);
    camera.lookAt(0, 5, 0);
    gridGroup.clear();
    gridGroup.position.set(-2.5, 0, 0);

    models = [];
    modelNames.forEach((modelName, index) => {
        const x = -20 + Math.floor(index / 4) * GalleryXGap;
        const y = 11.5 - (index % 4) * GalleryYGap;
        loadModel(modelName, x, y, 0);
    });
}

function arrangeStreetView() {
    camera.position.set(20, 10, 0);
    camera.lookAt(0, 0, -20);
    gridGroup.clear();
    gridGroup.position.set(8, 3, 0);

    models = [];
    
    const swappedModelNames = modelNames.map((name) => {
        if (name.endsWith("NW")) return name.replace("NW", "SE");
        if (name.endsWith("SE")) return name.replace("SE", "NW");
        if (name.endsWith("SW")) return name.replace("SW", "NE");
        if (name.endsWith("NE")) return name.replace("NE", "SW");
        return name;
    });

    swappedModelNames.forEach((modelName, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = -10 + column * StreetXGap;
        const z = -row * StreetZGap;

        loadModel(modelName, x, 0, z);
    });
}

document.getElementById('galleryView').addEventListener('click', () => {
    if (currentView !== 'gallery') {
        arrangeGalleryView();
        currentView = 'gallery';
    }
});

document.getElementById('streetView').addEventListener('click', () => {
    if (currentView !== 'street') {
        arrangeStreetView();
        currentView = 'street';
    }
});

arrangeGalleryView();

function animate() {
    requestAnimationFrame(animate);

    models.forEach((model) => {
        model.rotation.y += 0.001;
    });

    renderer.render(scene, camera);

    if (allModelsRendered) {
        hideLoadingScreen();
    }
}

function hideLoadingScreen() {
    loadingScreen.style.transition = 'opacity 0.5s ease';
    loadingScreen.style.opacity = 0;

    setTimeout(() => {
        loadingScreen.style.display = 'none';
        allModelsRendered = false;
    }, 500);
}

animate();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(models, true);

    models.forEach((model) => resetMaterial(model));

    if (intersects.length > 0) {
        const intersectedModel = intersects[0].object.parent;
        onHover(intersectedModel);
    }
});