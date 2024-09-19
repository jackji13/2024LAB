const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const asciiOutput = document.getElementById('ascii-output');


const asciiChars = '一二了上小天去好对宝海我睡哦啊';

const asciiWidth = 70;
const asciiHeight = 70;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        video.addEventListener('loadeddata', () => {
            canvas.width = asciiWidth;
            canvas.height = asciiHeight;
            updateAsciiArt(video);
        });
    })
    .catch(error => {
        console.error('Error accessing webcam:', error);
    });

function updateAsciiArt(video) {

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-asciiWidth, 0);

    ctx.drawImage(video, 0, 0, asciiWidth, asciiHeight);

    ctx.restore();

    const imageData = ctx.getImageData(0, 0, asciiWidth, asciiHeight);
    const pixels = imageData.data;

    let ascii = '';
    for (let y = 0; y < asciiHeight; y++) {
        for (let x = 0; x < asciiWidth; x++) {
            const i = (y * asciiWidth + x) * 4;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            const grayscale = (r + g + b) / 3;

            const charIndex = Math.floor(grayscale / 255 * (asciiChars.length - 1));
            ascii += asciiChars[charIndex];
        }
        ascii += '\n';
    }

    asciiOutput.textContent = ascii;

    requestAnimationFrame(() => updateAsciiArt(video));
}
