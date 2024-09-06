document.addEventListener("DOMContentLoaded", () => {

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // Get the scene container dimensions (cropped dimensions)
    const sceneContainer = document.getElementById('scene-container');
    const containerWidth = sceneContainer.clientWidth;
    const containerHeight = sceneContainer.clientHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 4.6;  // Set the initial camera distance from the model

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 0);
    sceneContainer.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    let model, coverMesh, mixer;  // For controlling animation and texture update

    // Load GLTF Model
    const loader = new THREE.GLTFLoader();
    loader.load('assets/albumcover1.gltf', (gltf) => {
        model = gltf.scene;

        model.traverse((child) => {
            if (child.isMesh) {
                if (child.name === 'cover') {
                    coverMesh = child;  // Store the mesh that needs to change texture
                    child.material = new THREE.MeshBasicMaterial({
                        map: textureLoader.load('assets/textures/Album-Cover-001.jpg')
                    });
                } else {
                    child.material = new THREE.MeshBasicMaterial({
                        map: textureLoader.load('assets/textures/disk.png')
                    });
                }
            }
        });

        model.scale.set(0.1, 0.1, 0.1);
        model.position.set(-1, 0, 0);
        scene.add(model);

        // Animation
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
            action.play();
        }
    });

    const audio = document.getElementById('animation-audio');

    // Event listener for clicking on images to change texture
    const albumContainer = document.querySelector('.albumContainer');
    albumContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            const newTexturePath = e.target.src;

            // Change the texture of the 3D model
            const newTexture = textureLoader.load(newTexturePath);
            coverMesh.material.map = newTexture;
            coverMesh.material.needsUpdate = true;

            // Replay the animation and play the audio
            if (mixer) {
                mixer.stopAllAction();  // Stop current animation
                const action = mixer.clipAction(mixer._actions[0].getClip());
                action.reset();  // Reset the animation
                action.play();  // Play the animation again

                // Play the audio
                audio.currentTime = 0;  // Reset the audio to the beginning
                audio.play();  // Play the MP3
            }
        }
    });

    function animate() {
        requestAnimationFrame(animate);

        if (mixer) mixer.update(0.01);  // Update mixer if animations exist

        renderer.render(scene, camera);  // Directly render the scene using the renderer
    }
    animate();

    // Handle window resizing
    window.addEventListener('resize', () => {
        const newWidth = sceneContainer.clientWidth;
        const newHeight = sceneContainer.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);  // Directly update renderer size
    });

    // Create and append 83 images
    for (let i = 1; i <= 83; i++) {
        const img = document.createElement('img');
        const fileName = 'Album-Cover-' + i.toString().padStart(3, '0') + '.jpg';
        img.src = `assets/textures/${fileName}`;
        document.querySelector('.albumContainer').appendChild(img);
    }
});