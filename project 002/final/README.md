# Self as System / ASCII Art Webcam Thermal Printer

## Overview

### Title: me.txt

### Description
This project is an interactive wall installation that captures webcam frames, converts them to ASCII art using Chinese characters, and prints the result on a 58mm thermal receipt printer.

## Features

- **Webcam Image Capture**: Automatically captures frames from the webcam every 10 seconds.
- **ASCII Art Conversion**: Converts the captured frames to ASCII art using a predefined set of Chinese characters to represent different levels of brightness.
- **Inverted Colors**: The ASCII art is inverted so that light areas in the image are printed with dark characters, ideal for printing on white paper with black ink.
- **Optimized for Thermal Printer**: The ASCII art is resized and cropped to fit within the constraints of a 58mm thermal receipt printer, ensuring that the output looks correct without stretching.
- **Wall-Mounted Printer Installation**: Designed for art installations where the printer is mounted on a wall, with text output rotated 180 degrees for optimal viewing when printed.

### Usages

- **Real-Time Art Generation**: This project can be used to create real-time ASCII art from webcam feeds, printing the result as an ongoing artistic output.
- **Interactive Installations**: Ideal for art galleries or public installations, where viewers can see their live image converted to ASCII art and printed instantly.
  
### Showcase

![Webcam to ASCII Art Conversion](showcase/ascii_art_demo.png)  
*Example of real-time ASCII art conversion from webcam feed*

### Demo Images

![Thermal Printer Output](showcase/printer_output_demo.png)  
*Example of printed ASCII art using the POS-58 thermal receipt printer*

## Technology

### Tech Stack

- **Node.js**: Handles the backend processing, including capturing webcam frames and converting them to ASCII art.
- **Jimp**: A JavaScript image processing library used to manipulate the captured webcam frames, converting them to grayscale and resizing them to fit within the printer's constraints.
- **Node-Webcam**: A Node.js library for interfacing with the webcam, capturing images at set intervals.
- **Notepad (Windows)**: Used to send the ASCII art to the printer via the command line.

### Tools & External Libraries

- **Node-Webcam**: For capturing webcam images.
- **Jimp**: For image manipulation, including cropping, resizing, and converting to grayscale.
- **child_process (Node.js)**: For executing the Notepad printing command in Windows.
- **Thermal Receipt Printer**: A 58mm printer (e.g., POS-58) for outputting the ASCII art.

## Credits

- **Jack Ji**: Project author and developer, responsible for the concept and implementation of the ASCII art conversion and printing system.
- **Jimp (JavaScript Image Manipulation Program)**: Used for image processing, developed by various contributors in the open-source community.
- **Node-Webcam**: Webcam integration library used to capture real-time images, developed and maintained by the Node.js community.
