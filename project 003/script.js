const video = document.getElementById('webcam');
const checkboxGrid = document.getElementById('checkbox-grid');
const gridSize = 50;

// Create the checkbox grid
function createCheckboxGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        // Remove disabled attribute
        checkboxGrid.appendChild(checkbox);
    }
}

// Capture video from webcam
async function setupWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accessing webcam", error);
    }
}

// Convert video to grayscale and update checkboxes
function updateCheckboxes() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = gridSize;
    canvas.height = gridSize;

    context.drawImage(video, 0, 0, gridSize, gridSize);
    const imageData = context.getImageData(0, 0, gridSize, gridSize).data;

    const checkboxes = document.querySelectorAll('#checkbox-grid input');

    for (let i = 0; i < gridSize * gridSize; i++) {
        const r = imageData[i * 4];
        const g = imageData[i * 4 + 1];
        const b = imageData[i * 4 + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 85) {
            checkboxes[i].checked = true; // Dark pixels are checked
            checkboxes[i].style.visibility = "visible";
        } else if (brightness < 170) {
            checkboxes[i].checked = false; // Medium pixels are unchecked
            checkboxes[i].style.visibility = "visible";
        } else {
            checkboxes[i].style.visibility = "hidden"; // Light pixels are blank (hidden)
        }
    }
}

video.addEventListener('play', () => {
    setInterval(updateCheckboxes, 10);
});

createCheckboxGrid();
setupWebcam();
