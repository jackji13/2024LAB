const video = document.getElementById('webcam');
const checkboxGrid = document.getElementById('checkbox-grid');
let gridSize = 20;
const minGridSize = 20;
const maxGridSize = 50;

let manualCheckboxes = {};

function createCheckboxGrid(gridSize) {
    checkboxGrid.innerHTML = '';

    const checkboxSize = 600 / gridSize;

    for (let i = 0; i < gridSize * gridSize; i++) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.width = `${checkboxSize}px`;
        checkbox.style.height = `${checkboxSize}px`;

        checkbox.addEventListener('click', (event) => {
            manualCheckboxes[i] = checkbox.checked;
        });

        checkboxGrid.appendChild(checkbox);
    }

    checkboxGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    checkboxGrid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
}

async function setupWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accessing webcam", error);
    }
}

function updateCheckboxes(gridSize) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = gridSize;
    canvas.height = gridSize;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(video, 0, 0, gridSize, gridSize);
    const imageData = context.getImageData(0, 0, gridSize, gridSize).data;

    const checkboxes = document.querySelectorAll('#checkbox-grid input');

    for (let i = 0; i < gridSize * gridSize; i++) {
        if (manualCheckboxes[i] !== undefined) {
            continue;
        }

        const r = imageData[i * 4];
        const g = imageData[i * 4 + 1];
        const b = imageData[i * 4 + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 85) {
            checkboxes[i].checked = true;
            checkboxes[i].style.visibility = "visible";
        } else if (brightness < 170) {
            checkboxes[i].checked = false;
            checkboxes[i].style.visibility = "visible";
        } else {
            checkboxes[i].style.visibility = "hidden";
        }
    }
}

function updateGridSizeOnScroll() {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

    const scrollPercent = scrollTop / documentHeight;

    const newGridSize = Math.round(minGridSize + scrollPercent * (maxGridSize - minGridSize));

    if (newGridSize !== gridSize) {
        gridSize = newGridSize;
        manualCheckboxes = {};
        createCheckboxGrid(gridSize);
    }
}

function continuouslyUpdateCheckboxes() {
    updateCheckboxes(gridSize);
    requestAnimationFrame(continuouslyUpdateCheckboxes);
}

window.addEventListener('scroll', updateGridSizeOnScroll);

setupWebcam();
createCheckboxGrid(gridSize);
continuouslyUpdateCheckboxes();