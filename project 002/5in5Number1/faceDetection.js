let video;
let imageTimeout;

const emotionImages = {
    happy: [
        'assets/happy1.png',
        'assets/happy2.png',
        'assets/happy3.png'
    ],
    sad: [
        'assets/sad1.png',
        'assets/sad2.png',
        'assets/sad3.png'
    ],
    angry: [
        'assets/angry1.png',
        'assets/angry2.png',
        'assets/angry3.png'
    ],
    surprised: [
        'assets/surprised1.png',
        'assets/surprised2.png',
        'assets/surprised3.png'
    ],
    neutral: [
        'assets/neutral1.png',
        'assets/neutral2.png',
        'assets/neutral3.png'
    ],
    fearful: [
        'assets/fearful1.png',
        'assets/fearful2.png',
        'assets/fearful3.png'
    ],
    disgusted: [
        'assets/disgusted1.png',
        'assets/disgusted2.png',
        'assets/disgusted3.png'
    ]
};

async function startWebcam() {
    video = document.getElementById('webcam');

    video.width = 600;
    video.height = 600;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 600, height: 600 } });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            video.play();
        };
    } catch (error) {
        console.error('Error accessing the webcam: ', error);
    }
}

async function detectFaceInVideo(video) {
    const canvas = document.getElementById('canvasOverlay');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        let textContent = '';
        let imageDisplayed = false;
        for (const result of resizedDetections) {
            const { gender, age, expressions } = result;
            
            textContent += `Gender: ${gender}\n`;
            textContent += `Age: ${Math.round(age)}\n`;
            textContent += `Expressions:\n`;

            for (const [expression, probability] of Object.entries(expressions)) {
                textContent += `  - ${expression}: ${(probability * 100).toFixed(2)}%\n`;

                if (probability > 0.9 && !imageDisplayed) {
                    showEmotionImage(expression);
                    imageDisplayed = true;
                }
            }

            textContent += `\n`;
        }

        const pElement = document.querySelector('.text-container p');
        pElement.innerText = textContent;

    }, 500);
}

function showEmotionImage(emotion) {
    if (emotionImages[emotion]) {
        if (imageTimeout) clearTimeout(imageTimeout);

        const randomImage = emotionImages[emotion][Math.floor(Math.random() * emotionImages[emotion].length)];
        
        const imageElement = document.createElement('img');
        imageElement.src = randomImage;
        imageElement.style.position = 'absolute';
        imageElement.style.width = '150px';
        imageElement.style.height = 'auto';
        imageElement.style.bottom = '20px';
        imageElement.style.right = '20px';
        imageElement.style.zIndex = '10';

        const imageContainer = document.getElementById('image-gallery');
        imageContainer.appendChild(imageElement);

        imageTimeout = setTimeout(() => {
            if (imageContainer.contains(imageElement)) {
                imageContainer.removeChild(imageElement);
            }
        }, 500);
    }
}

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    await faceapi.nets.ageGenderNet.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    console.log('Face-api models loaded.');

    const pElement = document.querySelector('.text-container p');

    animateText(pElement, 'System override: Face detection protocols online\nInitiate webcam face detection sequence.', () => {
        detectFaceInVideo(video);
    });
}

function animateText(pElement, targetText, callback) {
    const lines = targetText.split('\n');
    pElement.innerHTML = '';

    let lineIndex = 0;

    function animateLine() {
        if (lineIndex < lines.length) {
            const line = lines[lineIndex];
            if (line.trim() === '') {
                pElement.appendChild(document.createElement('br'));
                lineIndex++;
                animateLine();
                return;
            }

            const span = document.createElement('span');
            span.textContent = line;
            pElement.appendChild(span);
            pElement.appendChild(document.createElement('br'));

            const duration = 1000;
            const frameRate = 40;
            const totalFrames = duration / (1000 / frameRate);
            let frame = 0;

            function frameUpdate() {
                const progress = frame / totalFrames;
                const numCorrectChars = Math.floor(progress * line.length);
                let displayText = "";

                for (let i = 0; i < line.length; i++) {
                    if (i < numCorrectChars) {
                        displayText += line[i];
                    } else if (line[i] === ' ') {
                        displayText += ' ';
                    } else {
                        displayText += getRandomChar();
                    }
                }

                span.textContent = displayText;
                frame++;

                if (frame <= totalFrames) {
                    setTimeout(frameUpdate, 1000 / frameRate);
                } else {
                    span.textContent = line;
                    lineIndex++;
                    animateLine();
                }
            }

            frameUpdate();
        } else if (callback) {

            callback();
        }
    }

    animateLine();
}

function getRandomChar() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()+=;:<>?/|";
    return chars[Math.floor(Math.random() * chars.length)];
}

window.onload = async () => {
    await loadModels();
    startWebcam();
};