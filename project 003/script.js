const video = document.getElementById('webcam');
const checkboxGrid = document.getElementById('checkbox-grid');
let gridSize = 20; // Start with 20x20 grid
const minGridSize = 20; // Minimum grid size (20x20)
const maxGridSize = 50; // Maximum grid size (50x50)

// Track manual interactions
let manualCheckboxes = {};

// Create the checkbox grid
function createCheckboxGrid(gridSize) {
    checkboxGrid.innerHTML = ''; // Clear the current grid

    // Calculate the size of each checkbox based on the grid size
    const checkboxSize = 600 / gridSize; // Fixed grid of 600px, so each checkbox size changes

    for (let i = 0; i < gridSize * gridSize; i++) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.width = `${checkboxSize}px`;
        checkbox.style.height = `${checkboxSize}px`;

        // Add a listener to track manual clicks
        checkbox.addEventListener('click', (event) => {
            manualCheckboxes[i] = checkbox.checked; // Store the manually checked/unchecked state
        });

        checkboxGrid.appendChild(checkbox);
    }

    checkboxGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    checkboxGrid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
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
function updateCheckboxes(gridSize) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = gridSize;
    canvas.height = gridSize;

    // Flip the video horizontally (mirror effect)
    context.translate(canvas.width, 0); // Move the canvas origin to the right edge
    context.scale(-1, 1); // Flip the horizontal axis

    context.drawImage(video, 0, 0, gridSize, gridSize);
    const imageData = context.getImageData(0, 0, gridSize, gridSize).data;

    const checkboxes = document.querySelectorAll('#checkbox-grid input');

    for (let i = 0; i < gridSize * gridSize; i++) {
        // Skip manual checkboxes
        if (manualCheckboxes[i] !== undefined) {
            continue; // Skip updating manually clicked checkboxes
        }

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

// Map scroll position to grid size
function updateGridSizeOnScroll() {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Calculate scroll percentage (0 at the top, 1 at the bottom)
    const scrollPercent = scrollTop / documentHeight;

    // Map scroll percentage to grid size between minGridSize and maxGridSize
    const newGridSize = Math.round(minGridSize + scrollPercent * (maxGridSize - minGridSize));

    // If the grid size changes, recreate the grid
    if (newGridSize !== gridSize) {
        gridSize = newGridSize;
        manualCheckboxes = {}; // Clear manual interactions when grid is resized
        createCheckboxGrid(gridSize);
    }
}

// Keep updating the grid's checkboxes based on the webcam feed
function continuouslyUpdateCheckboxes() {
    updateCheckboxes(gridSize); // Update based on the current grid size
    requestAnimationFrame(continuouslyUpdateCheckboxes); // Continue updating the grid
}

// Event listener for scroll to adjust the grid size based on scroll position
window.addEventListener('scroll', updateGridSizeOnScroll);

// Initialize the video stream and grid
setupWebcam();
createCheckboxGrid(gridSize);
continuouslyUpdateCheckboxes(); // Start continuously updating the checkboxes
