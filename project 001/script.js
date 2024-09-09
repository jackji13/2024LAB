document.addEventListener("DOMContentLoaded", () => {

    //Scene
    const scene = new THREE.Scene();
    scene.background = null;
    const sceneContainer = document.getElementById('scene-container');
    const containerWidth = sceneContainer.clientWidth;
    const containerHeight = sceneContainer.clientHeight;

    //Camera
    const camera = new THREE.PerspectiveCamera(60, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 4.6;

    //Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 0);
    sceneContainer.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    let model, coverMesh, mixer;

    //GLTF Loader
    const loader = new THREE.GLTFLoader();
    loader.load('assets/albumcover1.gltf', (gltf) => {
        model = gltf.scene;

        model.traverse((child) => {
            if (child.isMesh) {
                if (child.name === 'cover') {
                    coverMesh = child;
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

    //Interaction
    const albumContainer = document.querySelector('.albumContainer');
    albumContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            const newTexturePath = e.target.src;

            const newTexture = textureLoader.load(newTexturePath);
            coverMesh.material.map = newTexture;
            coverMesh.material.needsUpdate = true;

            if (mixer) {
                mixer.stopAllAction();
                const action = mixer.clipAction(mixer._actions[0].getClip());
                action.reset();
                action.play();

                audio.currentTime = 0;
                audio.play();
            }
        }
    });

    function animate() {
        requestAnimationFrame(animate);

        if (mixer) mixer.update(0.01);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const newWidth = sceneContainer.clientWidth;
        const newHeight = sceneContainer.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });

    //Put 83 images on the page
    for (let i = 1; i <= 83; i++) {
        const img = document.createElement('img');
        const fileName = 'Album-Cover-' + i.toString().padStart(3, '0') + '.jpg';
        img.src = `assets/textures/${fileName}`;
        document.querySelector('.albumContainer').appendChild(img);
    }
});