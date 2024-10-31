const h1Element = document.querySelector("p");

if (!h1Element) {
    console.error("p element not found");
} else {
    const targetText = h1Element.textContent;

    const duration = 1700;
    const frameRate = 50;
    const totalFrames = duration / (1000 / frameRate);
    let frame = 0;

    function getRandomChar() {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*(){}[].,-_+=;:<>?/|";
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
}