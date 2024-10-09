const titleDiv = document.getElementById('title');
const textDiv = document.getElementById('text');

const titleInput = document.createElement('textarea');
titleInput.id = 'titleInputField';
titleInput.placeholder = 'Type something for the title';

const textInput = document.createElement('textarea');
textInput.id = 'textInputField';
textInput.placeholder = 'Type something for the text';
document.body.appendChild(titleInput);
document.body.appendChild(textInput);

function adjustHeight(element, maxHeight) {
    element.style.height = 'auto';
    const newHeight = Math.min(element.scrollHeight, maxHeight);
    element.style.height = `${newHeight}px`;
}

function adjustTextInputPosition() {
    const titleInputHeight = titleInput.offsetHeight;
    textInput.style.top = `${titleInputHeight + 20}px`;
}

adjustTextInputPosition();

titleInput.addEventListener('input', (event) => {
    titleDiv.textContent = event.target.value;
    adjustHeight(titleInput, window.innerHeight * 0.4);
    adjustHeight(titleDiv, window.innerHeight * 0.4);
    adjustTextInputPosition();
});

textInput.addEventListener('input', (event) => {
    textDiv.textContent = event.target.value;
    adjustHeight(textInput, window.innerHeight * 0.4);
    adjustHeight(textDiv, window.innerHeight * 0.4);
});