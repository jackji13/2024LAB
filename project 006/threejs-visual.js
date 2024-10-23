let scene, camera, renderer, earthMesh, orbitPath, satelliteMesh, controls;
let satelliteOrbitPoints = [];
let satelliteOrbitIndex = 0;
let orbitGroup = null;
const container = document.getElementById('threejs-container');

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(4, 2, 16);

renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 100;

const light = new THREE.DirectionalLight(0xffffff, 3.3);
light.position.set(2, 1, 0.3).normalize();
scene.add(light);

const textureLoader = new THREE.TextureLoader();
const material50BaseColor = textureLoader.load('assets/textures/Material_50_baseColor.jpeg');
const material50Emissive = textureLoader.load('assets/textures/Material_50_emissive.jpeg');
const material50MetallicRoughness = textureLoader.load('assets/textures/Material_50_metallicRoughness.png');
const material50Normal = textureLoader.load('assets/textures/Material_50_normal.png');
const material62BaseColor = textureLoader.load('assets/textures/Material_62_baseColor.png');
const material62Emissive = textureLoader.load('assets/textures/Material_62_emissive.jpeg');

const loader = new THREE.GLTFLoader();
loader.load('assets/scene.gltf', function (gltf) {
    earthMesh = gltf.scene;

    earthMesh.traverse(function (child) {
        if (child.isMesh) {
            const material = child.material;

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

            material.needsUpdate = true;
        }
    });

    earthMesh.scale.set(1, 1, 1);
    scene.add(earthMesh);
}, undefined, function (error) {
    console.error('Error loading GLTF model:', error);
});

async function loadSatellites() {
    const localUrl = 'assets/satellites.txt';
    
    try {
        const response = await fetch(localUrl);
        const data = await response.text();
        const tleData = parseTLEData(data);
        displaySatellites(tleData);
        createOrbitPathFromTLE(tleData[0]);
    } catch (error) {
        console.error('Error loading local TLE data:', error);
    }
}

function parseTLEData(data) {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const satellites = [];
    for (let i = 0; i < lines.length; i += 3) {
        const name = lines[i]?.trim();
        const tleLine1 = lines[i + 1]?.trim();
        const tleLine2 = lines[i + 2]?.trim();
        if (name && tleLine1 && tleLine2) {
            const meanMotion = parseFloat(tleLine2.substring(52, 63));
            const inclination = parseFloat(tleLine2.substring(8, 16));
            satellites.push({ name, tleLine1, tleLine2, meanMotion, inclination });
        }
    }
    return satellites;
}

function displaySatellites(satellites) {
    const satelliteList = document.getElementById("satellite-list");
    satelliteList.innerHTML = '';

    satellites.forEach((satellite, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = satellite.name;

        listItem.onclick = () => {
            createOrbitPathFromTLE(satellites[index]);

            const selectedSatellite = [satellites[index]];
            updateChart(selectedSatellite);

            updateInfoSection(satellites[index]);
        };

        satelliteList.appendChild(listItem);
    });
}

function removeExistingOrbit() {
    if (orbitPath) {
        scene.remove(orbitPath);
        orbitPath.geometry.dispose();
        orbitPath.material.dispose();
        orbitPath = null;
    }
}

function createOrbitPathFromTLE(satelliteData) {
    const satrec = satellite.twoline2satrec(satelliteData.tleLine1, satelliteData.tleLine2);
    const meanMotion = satelliteData.meanMotion;
    const inclination = satelliteData.inclination * (Math.PI / 180);
    const satelliteSpeed = meanMotion * (2 * Math.PI);

    console.log(`Satellite: ${satelliteData.name}, Speed: ${satelliteSpeed.toFixed(5)} rad/s, Inclination: ${satelliteData.inclination.toFixed(2)}°`);

    removeExistingOrbit();

    orbitGroup = new THREE.Group();

    const date = new Date();
    const positionAndVelocity = satellite.propagate(satrec, date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(new Date());

    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    const longitude = positionGd.longitude;
    const latitude = positionGd.latitude;
    const height = positionGd.height;

    const earthRadius = 6371;
    const orbitalRadius = earthRadius + height;

    const scaleDownFactor = 0.001;
    const scaledOrbitRadius = orbitalRadius * scaleDownFactor;

    const satellitePos = convertLatLonToVector3(latitude, longitude, scaledOrbitRadius);

    const satelliteGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    satelliteMesh = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    satelliteMesh.position.copy(satellitePos);
    orbitGroup.add(satelliteMesh);

    const orbitPoints = new THREE.EllipseCurve(
        0, 0,
        scaledOrbitRadius, scaledOrbitRadius,
        0, 2 * Math.PI,
        false
    ).getPoints(100);

    satelliteOrbitPoints = orbitPoints;

    const orbitPathGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);

    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        linewidth: 50
    });

    orbitPath = new THREE.LineLoop(orbitPathGeometry, orbitMaterial);
    orbitPath.rotation.x = Math.PI / 2;

    orbitGroup.add(orbitPath);

    orbitGroup.rotation.x = inclination;
    scene.add(orbitGroup);

    satelliteOrbitSpeedFactor = satelliteSpeed;
}

function convertLatLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
}

let lastTime = 0;

const earthRotationDuration = 10;
const fullRotation = Math.PI * 2;
const earthRotationSpeed = fullRotation / earthRotationDuration;

function animate(time) {
    requestAnimationFrame(animate);
    controls.update();

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (earthMesh) {
        earthMesh.rotation.y += earthRotationSpeed * deltaTime;
    }

    if (satelliteOrbitPoints.length > 0) {
        satelliteOrbitIndex = (satelliteOrbitIndex + satelliteOrbitSpeedFactor * deltaTime) % satelliteOrbitPoints.length;
        const nextPoint = satelliteOrbitPoints[Math.floor(satelliteOrbitIndex)];
        satelliteMesh.position.set(nextPoint.x, 0, nextPoint.y);
    }

    renderer.render(scene, camera);
}

animate(performance.now());

function removeExistingOrbit() {
    if (orbitGroup) {
        scene.remove(orbitGroup);
        orbitGroup.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        orbitGroup = null;
    }
}

window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

loadSatellites();