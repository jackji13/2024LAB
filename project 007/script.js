function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const modelName = getQueryParam('model') || '14SW';

const textElement = document.getElementById('text');
if (textElement) {
    textElement.textContent = `${modelName} Corner`;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 1.8;
controls.minDistance = 0.5;
controls.maxDistance = 50;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
scene.add(ambientLight);

let shaderModel, defaultModel;

const loader = new THREE.GLTFLoader();
loader.load(`assets/${modelName}.glb`, function(gltf) {
    shaderModel = gltf.scene;
    shaderModel.position.set(0, 1, 0);
    shaderModel.scale.set(1, 1, 1);

    shaderModel.traverse((child) => {
        if (child.isMesh) {
            const count = child.geometry.attributes.position.count;

            const displacement = new THREE.Float32BufferAttribute(count * 3, 3);
            const customColor = new THREE.Float32BufferAttribute(count * 3, 3);

            const color = new THREE.Color();
            for (let i = 0; i < displacement.count; i++) {
                displacement.setXYZ(i, Math.random() * 2, Math.random() * 2, Math.random() * 2);

                color.setHSL(Math.random(), 1.0, 0.9);
                customColor.setXYZ(i, color.r, color.g, color.b);
            }

            child.geometry.setAttribute('displacement', displacement);
            child.geometry.setAttribute('customColor', customColor);

            child.material = new THREE.ShaderMaterial({
                uniforms: {
                    amplitude: { value: 0.5 },
                    color: { value: new THREE.Color(0xf70000) },
                    opacity: { value: 1.0 }
                },
                vertexShader: `
                    uniform float amplitude;
                    attribute vec3 displacement;
                    attribute vec3 customColor;
                    varying vec3 vColor;

                    void main() {
                        vColor = customColor;
                        vec3 newPosition = position + amplitude * displacement;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    uniform float opacity;
                    varying vec3 vColor;

                    void main() {
                        gl_FragColor = vec4(vColor * color, opacity);
                    }
                `,
                transparent: true,
                opacity: 1.0
            });
        }
    });

    scene.add(shaderModel);

    loader.load(`assets/${modelName}.glb`, function(gltfDefault) {
        defaultModel = gltfDefault.scene;
        defaultModel.position.set(0, 1, 0);
        defaultModel.scale.set(1, 1, 1);

        defaultModel.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0.0;
            }
        });

        scene.add(defaultModel);
    });
}, undefined, function(error) {
    console.error('An error occurred while loading the model:', error);
});

camera.position.set(4, 2, 4);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

let startTime = Date.now();
let animationEnded = false;
let showDefaultModel = false;

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    let elapsed = (Date.now() - startTime) / 1000;
    let progress = Math.max(1.0 - (elapsed / 2.6), 0.0);

    if (shaderModel) {
        shaderModel.traverse((object) => {
            if (object.isMesh && object.material.uniforms) {
                object.material.uniforms.amplitude.value = progress;
                object.material.uniforms.opacity.value = progress;

                if (progress === 0 && !animationEnded) {
                    scene.remove(shaderModel);
                    animationEnded = true;
                }
            }
        });
    }

    if (elapsed > 2.5 && !showDefaultModel) {
        showDefaultModel = true;
    }

    if (defaultModel && showDefaultModel) {
        defaultModel.traverse((object) => {
            if (object.isMesh) {
                object.material.opacity = Math.min(object.material.opacity + 0.02, 1.0);
            }
        });
    }

    renderer.render(scene, camera);
}

animate();