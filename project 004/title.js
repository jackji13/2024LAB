// Select the title div and create an input field
const titleDiv = document.getElementById('title');
const input = document.createElement('input');
input.id = 'inputField'; // Assign an id so it can be styled via CSS
input.placeholder = 'Type something for the title'; // Set the placeholder text

// Append the input field to the body
document.body.appendChild(input);

// Listen for user input and update the title div
input.addEventListener('input', (event) => {
    titleDiv.textContent = event.target.value; // Reflect the input text in the title div
});
