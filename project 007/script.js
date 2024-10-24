// Utility function to get the query parameter from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Get the model name from the URL query string
const modelName = getQueryParam('model') || '14SW';  // Default to '14SW' if no model specified

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

// Updated vertex shader and fragment shader based on custom attributes
const vertexShader = `
    uniform float amplitude;
    attribute vec3 displacement;
    attribute vec3 customColor;
    varying vec3 vColor;

    void main() {
        vColor = customColor;
        vec3 newPosition = position + amplitude * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

const fragmentShader = `
    uniform vec3 color;
    uniform float opacity;
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor * color, opacity);
    }
`;

// Prepare uniforms and attributes
let originalMaterials = [];
let shaderModel, defaultModel;
let displacement, customColor;

// Load the GLTF model dynamically based on the modelName from the URL
const loader = new THREE.GLTFLoader();
loader.load(`assets/${modelName}.gltf`, function(gltf) {
    shaderModel = gltf.scene;
    shaderModel.position.set(0, -1, 0);
    shaderModel.scale.set(1, 1, 1);

    // Inside the shaderModel loading section
    shaderModel.traverse((child) => {
        if (child.isMesh) {
            const count = child.geometry.attributes.position.count;

            displacement = new THREE.Float32BufferAttribute(count * 3, 3);
            customColor = new THREE.Float32BufferAttribute(count * 3, 3);

            const color = new THREE.Color();
            for (let i = 0; i < displacement.count; i++) {
                // Make displacement smaller for reduced distortion
                displacement.setXYZ(i, Math.random() * 2, Math.random() * 2, Math.random() * 2);

                // Set the custom colors
                color.setHSL(Math.random(), 1.0, 0.9);
                customColor.setXYZ(i, color.r, color.g, color.b);
            }

            child.geometry.setAttribute('displacement', displacement);
            child.geometry.setAttribute('customColor', customColor);

            originalMaterials.push(child.material.clone()); // Clone the original material for later use

            child.material = new THREE.ShaderMaterial({
                uniforms: {
                    amplitude: { value: 0.5 },  // Reduce amplitude for smaller distortion
                    color: { value: new THREE.Color(0x17f700) },
                    opacity: { value: 1.0 }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                opacity: 1.0
            });
        }
    });

    scene.add(shaderModel);

    // Load the GLTF model without shaders (default model)
    loader.load(`assets/${modelName}.gltf`, function(gltfDefault) {
        defaultModel = gltfDefault.scene;
        defaultModel.position.set(0, -1, 0);
        defaultModel.scale.set(1, 1, 1);

        // Make default model transparent and invisible initially
        defaultModel.traverse((child) => {
            if (child.isMesh) {
                child.material = originalMaterials.shift(); // Restore the original material
                child.material.transparent = true;
                child.material.opacity = 0.0; // Start with fully transparent
            }
        });

        scene.add(defaultModel); // Add default model to the scene
    });
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

// Track time to control keyframe animation
let startTime = Date.now();
let animationEnded = false;
let showDefaultModel = false;

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Update orbit controls

    // Calculate elapsed time
    let elapsed = (Date.now() - startTime) / 1000; // Time in seconds
    let progress = Math.max(1.0 - (elapsed / 2.6), 0.0); // Reduce progress from 1 to 0 over 3 seconds

    // Animate the shader model (distortion + removal after 3 seconds)
    if (shaderModel) {
        shaderModel.traverse((object) => {
            if (object.isMesh && object.material.uniforms) {
                object.material.uniforms.amplitude.value = progress;  // Control the amplitude
                object.material.uniforms.opacity.value = progress;  // Adjust opacity with progress

                // Remove the shader model when the animation ends (after 3 seconds)
                if (progress === 0 && !animationEnded) {
                    scene.remove(shaderModel);  // Remove the shader model
                    animationEnded = true;  // Mark animation as ended
                }
            }
        });
    }

    // Start the fade-in animation for the default model after 2.5 seconds
    if (elapsed > 2.5 && !showDefaultModel) {
        showDefaultModel = true;
    }

    // Animate the default model (fade in)
    if (defaultModel && showDefaultModel) {
        defaultModel.traverse((object) => {
            if (object.isMesh) {
                object.material.opacity = Math.min(object.material.opacity + 0.02, 1.0); // Faster fade in
            }
        });
    }

    renderer.render(scene, camera);
}

animate();
