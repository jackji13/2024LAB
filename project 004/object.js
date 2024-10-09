const objectDiv = document.getElementById('object');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, objectDiv.clientWidth / objectDiv.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(objectDiv.clientWidth, objectDiv.clientHeight);
objectDiv.appendChild(renderer.domElement);

const geometries = [
    new THREE.TetrahedronGeometry(1.25),
    new THREE.OctahedronGeometry(1.25),
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.DodecahedronGeometry(1.2),
    new THREE.IcosahedronGeometry(1.3),
    new THREE.ConeGeometry(0.88, 2, 32),
    new THREE.CylinderGeometry(0.85, 0.85, 1.8, 32),
    new THREE.SphereGeometry(1.2, 20, 20),
    new THREE.TorusGeometry(0.90, 0.4, 16, 50),
    new THREE.TorusKnotGeometry(0.72, 0.24, 120, 13)
];

let currentIndex = 0;
let material = new THREE.MeshBasicMaterial({
    color: 0x17f700,
    wireframe: true
});
let shape = new THREE.Mesh(geometries[currentIndex], material);
scene.add(shape);

camera.position.z = 3.15;

function updateGeometry(index) {
    scene.remove(shape);
    shape.geometry.dispose();
    shape = new THREE.Mesh(geometries[index], material);
    scene.add(shape);
}

function animate() {
    requestAnimationFrame(animate);
    shape.rotation.x += 0.004;
    shape.rotation.y += 0.007;
    shape.rotation.z += 0.002;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScroll;
    const totalGeometries = geometries.length;
    const newIndex = Math.min(Math.floor(scrollFraction * totalGeometries), totalGeometries - 1);

    if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        updateGeometry(currentIndex);
    }
});

window.addEventListener('resize', () => {
    renderer.setSize(objectDiv.clientWidth, objectDiv.clientHeight);
    camera.aspect = objectDiv.clientWidth / objectDiv.clientHeight;
    camera.updateProjectionMatrix();
});