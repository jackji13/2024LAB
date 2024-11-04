# Self as System / myReplica.txt

## Overview

#### Artwork info
*myReplica.txt*, 2024  
Mixed media  
5.9" x (7.7" or 55.5' variable dimensions) x 4.3"

#### Description
This project is an interactive wall art installation that captures webcam frames, converts them to ASCII art using Chinese characters, and prints the result on a thermal receipt printer.

#### Artist Statement
In *myReplica.txt*, I confront the complexities of digital identity and communication through a visual and textual medium. This piece is constructed using Chinese characters drawn directly from my chat history—specifically, characters that I use most frequently. By converting these into ASCII art, I aim to create a digital "replica" of myself, a version of me rendered from the data trails of my online interactions.

This work questions how deeply my chat records from WeChat truly represent who I am. Do the words we exchange online—those quick messages, fleeting responses, and data points—reflect the essence of a person? Or are they simply a stream of data, a filtered snapshot of a larger, more complex identity? The conversations we have online feel personal, yet they exist in a digital, impersonal space.

## Features

- **Webcam Image Capture**: Automatically captures frames from the webcam every 10 seconds.
- **ASCII Art Conversion**: Converts the captured frames to ASCII art using a predefined set of Chinese characters to represent different levels of brightness. The set of characters represent a replica of me as data.
- **Optimized for Thermal Printer**: The ASCII art is resized and cropped to fit within the constraints of a 58mm thermal receipt printer, ensuring that the output looks correct without stretching.

#### Showcase

<img src="example/ascii_art_demo.png" width="500">

*Example of real-time ASCII art conversion from webcam feed*

#### Demo Images

<img src="example/printer_output_demo.jpg" width="500">

*Example of printed ASCII art using the thermal receipt printer*

#### Install Shots

<img src="example/shot1.jpg" width="300">

*FInal installation shot full view*

<img src="example/shot2.jpg" width="500">

*FInal installation shot close up*

## Process

The creation of *myReplica.txt* involved several key steps:

1. **Data Collection**: I used WeChatMsg to export my chat history and selected the most frequent words using a JavaScript file I wrote myself. This provided a curated set of Chinese characters for the ASCII art.

2. **Webcam Setup and Image Processing**: A webcam was set up to capture real-time images of the surrounding environment. I developed a JavaScript file that handles capturing images every 10 seconds, converting them to ASCII art, package the ASCII art into a txt file and send the txt file to the thermal printer.

3. **Physical Installation**: The installation was constructed using custom 3D-printed PLA parts and aluminum extrusion, housing the thermal printer, mini PC, and webcam. This setup allowed for seamless operation and real-time printing of the ASCII art while also making the entire structure more compact and visually appealing.

4. **Final Assembly**: Once all components were integrated, I tested the system extensively to ensure that the images captured and printed aligned with my artistic vision for the piece.

## Technology

- **Node.js**: Handles backend processing, including capturing webcam frames, converting them to ASCII art, and sending the output to the printer.
- **Jimp**: For image manipulation (cropping, resizing, and grayscale conversion).
- **Node-Webcam**: Captures real-time images from the webcam.
- **Notepad (Windows)**: Used to send the ASCII art to the thermal printer via the command line.
- **WeChatMsg**: Used to export chat history from WeChat.
- **Thermal Receipt Printer**: Outputs the ASCII art.
- **Physical Installation**: Built using custom 3D-printed PLA parts and aluminum extrusion, housing the thermal printer, mini PC, and webcam that run the system in real-time.

## Credits

- **Jack Ji**: Project author and developer, responsible for the concept and implementation of the ASCII art conversion and printing system.
- **WeChatMsg (by LC044 https://github.com/LC044/WeChatMsg)**: Used for exporting chat history from WeChat in csv and json format.
- **Jimp (JavaScript Image Manipulation Program)**: Used for image processing, developed by various contributors in the open-source community.
- **Node-Webcam**: Webcam integration library used to capture real-time images, developed and maintained by the Node.js community.
