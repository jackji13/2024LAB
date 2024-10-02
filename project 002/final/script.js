const NodeWebcam = require("node-webcam");
const fs = require("fs");
const { exec } = require("child_process");
const Jimp = require("jimp");

const asciiChars = '一二了上小天去好对宝海我睡哦啊';

const opts = {
    width: 640,
    height: 480,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    callbackReturn: "location",
    verbose: false
};

const Webcam = NodeWebcam.create(opts);

function convertToAscii(imagePath) {
    Jimp.read(imagePath).then(image => {
        const side = Math.min(image.bitmap.width, image.bitmap.height);
        
        image.crop((image.bitmap.width - side) / 2, (image.bitmap.height - side) / 2, side, side);

        const asciiArt = [];
        const width = 47;
        const height = 35;

        image.resize(width, height).greyscale();

        for (let y = 0; y < image.bitmap.height; y++) {
            let line = '';
            for (let x = 0; x < image.bitmap.width; x++) {
                const pixel = image.getPixelColor(x, y);
                const { r, g, b } = Jimp.intToRGBA(pixel);
                const grayscale = (r + g + b) / 3;

                const invertedGrayscale = 255 - grayscale;

                const charIndex = Math.floor(invertedGrayscale / 255 * (asciiChars.length - 1));
                line += asciiChars[charIndex];
            }
            asciiArt.push(line.split('').reverse().join(''));
        }

        const asciiString = asciiArt.reverse().join('\n');
        console.log(asciiString);

        const filename = `txtfile/ascii_frame_${Date.now()}.txt`;

        try {
            fs.writeFileSync(filename, asciiString);
            console.log(`Saved ASCII art to ${filename}`);
        } catch (err) {
            console.error(`Error saving file: ${err}`);
        }

        printAscii(filename);
    }).catch(err => {
        console.error('Error processing image with Jimp:', err);
    });
}

function printAscii(filename) {
    exec(`notepad /p "${filename}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error printing: ${error.message}`);
            return;
        }
        console.log('Print command sent successfully.');
    });
}

setInterval(() => {
    Webcam.capture("current_frame", function(err, data) {
        if (err) {
            console.error("Error capturing image:", err);
            return;
        }
        convertToAscii(data);
    });
}, 10000);