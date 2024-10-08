// Select the object div
const objectDiv = document.getElementById('object');

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, objectDiv.clientWidth / objectDiv.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparent background
renderer.setSize(objectDiv.clientWidth, objectDiv.clientHeight);
objectDiv.appendChild(renderer.domElement);

// Define different geometries
const geometries = [
    new THREE.TetrahedronGeometry(1.25),   // Tetrahedron
    new THREE.OctahedronGeometry(1.25),    // Octahedron
    new THREE.BoxGeometry(1.5, 1.5, 1.5),        // Cube
    new THREE.DodecahedronGeometry(1.2),  // Dodecahedron
    new THREE.IcosahedronGeometry(1.3),   // Icosahedron
    new THREE.ConeGeometry(1, 2, 32),   // Cone
    new THREE.CylinderGeometry(1, 1, 1.8, 32), // Cylinder
    new THREE.SphereGeometry(1.3, 20, 20), // Sphere
    new THREE.TorusGeometry(1, 0.4, 16, 50), // Torus
    new THREE.TorusKnotGeometry(0.82, 0.24, 120, 13) // Smaller size
];

// Initial shape (the first geometry)
let currentIndex = 0;
let material = new THREE.MeshBasicMaterial({
    color: 0x17f700,
    wireframe: true
});
let shape = new THREE.Mesh(geometries[currentIndex], material);
scene.add(shape);

// Set the camera position
camera.position.z = 3;

// Function to update geometry
function updateGeometry(index) {
    scene.remove(shape);
    shape.geometry.dispose(); // Clean up the old geometry
    shape = new THREE.Mesh(geometries[index], material);
    scene.add(shape);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the shape for some animation
    shape.rotation.x += 0.004;
    shape.rotation.y += 0.007;
    shape.rotation.z += 0.002;

    renderer.render(scene, camera);
}
animate();

// Map scroll position to geometry index
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScroll;

    // Map scrollFraction (0 to 1) to geometry index (0 to geometries.length - 1)
    const totalGeometries = geometries.length;

    // Ensure we round up to the last geometry when at the bottom
    const newIndex = Math.min(Math.floor(scrollFraction * totalGeometries), totalGeometries - 1);

    if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        updateGeometry(currentIndex);
    }
});

// Adjust canvas size when window is resized
window.addEventListener('resize', () => {
    renderer.setSize(objectDiv.clientWidth, objectDiv.clientHeight);
    camera.aspect = objectDiv.clientWidth / objectDiv.clientHeight;
    camera.updateProjectionMatrix();
});
