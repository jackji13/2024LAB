let video; // Declare video in a higher scope so it can be accessed globally
let imageTimeout; // To store the timeout reference for the image display delay

// Arrays for images corresponding to each emotion
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
    video = document.getElementById('webcam'); // Assign video element to the global variable

    // Set intrinsic dimensions for the video element
    video.width = 600;
    video.height = 600;
    
    // Get access to the user's webcam
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 600, height: 600 } });
        video.srcObject = stream;

        // When the video starts, call detectFaceInVideo to analyze the video stream
        video.onloadedmetadata = () => {
            video.play();
            // Do not call detectFaceInVideo here, it will be triggered after the animation
        };
    } catch (error) {
        console.error('Error accessing the webcam: ', error);
    }
}

async function detectFaceInVideo(video) {
    const canvas = document.getElementById('canvasOverlay');

    // Set the canvas size to match the video element size
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

        // Clear the canvas before drawing new detections
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw detections
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        // Display face information
        let textContent = '';
        let imageDisplayed = false; // Flag to check if an image has been displayed
        for (const result of resizedDetections) {
            const { gender, age, expressions } = result;
            
            textContent += `Gender: ${gender}\n`;
            textContent += `Age: ${Math.round(age)}\n`;
            textContent += `Expressions:\n`;

            // Display all expressions
            for (const [expression, probability] of Object.entries(expressions)) {
                textContent += `  - ${expression}: ${(probability * 100).toFixed(2)}%\n`;

                // Check if an expression is above 95% and show a corresponding image
                if (probability > 0.9 && !imageDisplayed) {
                    showEmotionImage(expression);
                    imageDisplayed = true; // Set flag to true to prevent multiple images at once
                }
            }

            textContent += `\n`; // Add a new line for spacing between different faces
        }

        const pElement = document.querySelector('.text-container p');
        pElement.innerText = textContent;

    }, 500); // Run the face detection every 500ms
}

function showEmotionImage(emotion) {
    // Check if the emotion has an array of images
    if (emotionImages[emotion]) {
        // Clear the existing timeout to prevent flickering
        if (imageTimeout) clearTimeout(imageTimeout);

        // Select a random image from the emotion array
        const randomImage = emotionImages[emotion][Math.floor(Math.random() * emotionImages[emotion].length)];
        
        // Create an image element to display on the canvas
        const imageElement = document.createElement('img');
        imageElement.src = randomImage;
        imageElement.style.position = 'absolute';
        imageElement.style.width = '150px'; // Set the width of the image
        imageElement.style.height = 'auto'; // Set the height of the image
        imageElement.style.bottom = '20px'; // Position it at the bottom
        imageElement.style.right = '20px'; // Position it at the right
        imageElement.style.zIndex = '10'; // Ensure the image is on top of the canvas

        // Append the image to the image container
        const imageContainer = document.getElementById('image-gallery');
        imageContainer.appendChild(imageElement);

        // Set a timeout to remove the image after 500ms
        imageTimeout = setTimeout(() => {
            if (imageContainer.contains(imageElement)) {
                imageContainer.removeChild(imageElement);
            }
        }, 500); // Display each image for 500ms
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
    // Pass detectFaceInVideo as a callback to start after the text animation
    animateText(pElement, 'System override: Face detection protocols online\nInitiate webcam face detection sequence.', () => {
        detectFaceInVideo(video); // Start face detection after animation is done
    });
}

function animateText(pElement, targetText, callback) {
    const lines = targetText.split('\n');
    pElement.innerHTML = '';

    let lineIndex = 0; // Track which line is currently being animated

    function animateLine() {
        if (lineIndex < lines.length) {
            const line = lines[lineIndex];
            if (line.trim() === '') {
                pElement.appendChild(document.createElement('br'));
                lineIndex++;
                animateLine(); // Move to the next line
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
                    lineIndex++; // Move to the next line
                    animateLine(); // Recursively call animateLine for the next line
                }
            }

            frameUpdate();
        } else if (callback) {
            // Call the callback function after the text animation is complete
            callback();
        }
    }

    animateLine(); // Start animating the first line
}

function getRandomChar() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()+=;:<>?/|";
    return chars[Math.floor(Math.random() * chars.length)];
}

// Initialize everything on window load
window.onload = async () => {
    await loadModels();
    startWebcam();
};
