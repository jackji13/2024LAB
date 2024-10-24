document.addEventListener("DOMContentLoaded", () => {
    const h1Element = document.querySelector("p");

    if (!h1Element) return; // Exit if there's no h1 element

    const targetText = h1Element.textContent;
    
    const duration = 2000; // total duration of the animation in milliseconds
    const frameRate = 35; // number of frames per second
    const totalFrames = duration / (1000 / frameRate);
    let frame = 0;

    function getRandomChar() {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()+=;:<>?/|";
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function animateText() {
        const progress = frame / totalFrames;
        const numCorrectChars = Math.floor(progress * targetText.length);
        let displayText = "";

        for (let i = 0; i < targetText.length; i++) {
            if (i < numCorrectChars) {
                displayText += targetText[i];
            } else if (targetText[i] === ' ') {
                displayText += ' ';
            } else {
                displayText += getRandomChar();
            }
        }

        h1Element.textContent = displayText;
        frame++;

        if (frame <= totalFrames) {
            setTimeout(animateText, 1000 / frameRate);
        } else {
            h1Element.textContent = targetText;
        }
    }

    animateText();
});