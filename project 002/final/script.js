const NodeWebcam = require("node-webcam");
const fs = require("fs");
const { exec } = require("child_process");
const Jimp = require("jimp");  // Make sure Jimp is imported correctly

// ASCII characters from light to dark
const asciiChars = '一二了上小天去好对宝海我睡哦啊';

// Webcam options
const opts = {
    width: 640,
    height: 480,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    callbackReturn: "location",
    verbose: false
};

// Create a webcam instance
const Webcam = NodeWebcam.create(opts);

// Function to convert an image to ASCII art
function convertToAscii(imagePath) {
    Jimp.read(imagePath).then(image => {
        // Crop the image to a square, keeping the center part of the image
        const side = Math.min(image.bitmap.width, image.bitmap.height);  // Determine the shorter side (to make it square)
        
        // Crop the image to the center square (no stretching)
        image.crop((image.bitmap.width - side) / 2, (image.bitmap.height - side) / 2, side, side);

        const asciiArt = [];
        const width = 47;  // Set width for 58mm thermal printer
        const height = 35;  // Set height to 35 to reduce vertical lines

        // Resize the image without stretching, keeping width at 47 but downsampling vertical resolution
        image.resize(width, height).greyscale();

        for (let y = 0; y < image.bitmap.height; y++) {
            let line = '';
            for (let x = 0; x < image.bitmap.width; x++) {
                const pixel = image.getPixelColor(x, y);
                const { r, g, b } = Jimp.intToRGBA(pixel);
                const grayscale = (r + g + b) / 3;
                const charIndex = Math.floor(grayscale / 255 * (asciiChars.length - 1));
                line += asciiChars[charIndex];
            }
            asciiArt.push(line.split('').reverse().join(''));  // Reverse each line for 180-degree rotation
        }

        // Reverse the order of the lines (rotating 180 degrees)
        const asciiString = asciiArt.reverse().join('\n');
        console.log(asciiString);

        // Save ASCII to a file in the "txtfile" folder
        const filename = `txtfile/ascii_frame_${Date.now()}.txt`;

        try {
            fs.writeFileSync(filename, asciiString);
            console.log(`Saved ASCII art to ${filename}`);
        } catch (err) {
            console.error(`Error saving file: ${err}`);
        }

        // Print the ASCII art
        printAscii(filename);
    }).catch(err => {
        console.error('Error processing image with Jimp:', err);
    });
}

// Function to print the ASCII file using Notepad's /p command
function printAscii(filename) {
    exec(`notepad /p "${filename}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error printing: ${error.message}`);
            return;
        }
        console.log('Print command sent successfully.');
    });
}

// Capture a frame and convert it to ASCII art every 10 seconds
setInterval(() => {
    Webcam.capture("current_frame", function(err, data) {
        if (err) {
            console.error("Error capturing image:", err);
            return;
        }
        convertToAscii(data);  // Convert captured image to ASCII
    });
}, 10000);  // Capture every 10 seconds