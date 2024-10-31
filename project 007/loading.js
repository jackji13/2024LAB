document.addEventListener("DOMContentLoaded", () => {
    const h1Element = document.querySelector("h1");

    if (!h1Element) return;

    const targetText = h1Element.textContent;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()+=;:<>?/|";
    const duration = 1000;
    const totalFrames = Math.ceil(40 * (duration / 1000));
    let frame = 0;

    function getRandomChar() {
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function animateText() {
        const progress = frame / totalFrames;
        const numCorrectChars = Math.floor(progress * targetText.length);
        h1Element.textContent = targetText.substring(0, numCorrectChars) + 
            targetText.substring(numCorrectChars).replace(/[^ ]/g, getRandomChar);

        if (++frame <= totalFrames) {
            requestAnimationFrame(animateText);
        } else {
            document.dispatchEvent(new CustomEvent('loadingAnimationComplete'));
        }
    }

    animateText();
});
