async function scrapeElements() {
  const url = document.getElementById("urlInput").value;
  const elementType = document.getElementById("elementType").value;

  if (!url) {
    alert("Please enter a URL");
    return;
  }

  try {
    // Include elementType in the request
    const response = await fetch(
      `https://element-scaper-api.onrender.com/scrape?url=${encodeURIComponent(url)}&elementType=${encodeURIComponent(elementType)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the server");
    }
    const data = await response.json();
    const resultContainer = document.getElementById("result");
    resultContainer.innerHTML = ""; // Clear previous results

    const imageContainer = document.getElementById("image");
    imageContainer.innerHTML = ""; // Clear previous images

    // Display only the selected element type
    data[elementType].forEach((element) => {
      const elementWrapper = document.createElement("div");

      if (element.tagName === "input") {
        const inputElement = document.createElement("input");
        inputElement.type = element.attributes.type || "text";
        inputElement.id = element.id;
        inputElement.className = element.className;
        inputElement.placeholder = element.attributes.placeholder || "";
        inputElement.value = element.attributes.value || "";
        inputElement.required = element.attributes.required === "true";
        inputElement.disabled = element.attributes.disabled === "true";

        // Apply the scraped CSS styles
        Object.entries(element.styles).forEach(([property, value]) => {
          inputElement.style[property] = value;
        });

        elementWrapper.appendChild(inputElement);
      } else if (element.tagName === "h1" || element.tagName === "button") {
        const newElement = document.createElement(element.tagName);
        newElement.textContent = element.textContent;
        newElement.id = element.id;
        newElement.className = element.className;

        // Apply the scraped CSS styles
        Object.entries(element.styles).forEach(([property, value]) => {
          newElement.style[property] = value;
        });

        elementWrapper.appendChild(newElement);
      } else if (element.tagName === "hr") {
        const hrElement = document.createElement("hr");
        hrElement.id = element.id;
        hrElement.className = element.className;

        // Apply the scraped CSS styles
        Object.entries(element.styles).forEach(([property, value]) => {
          hrElement.style[property] = value;
        });

        elementWrapper.appendChild(hrElement);
      }

      resultContainer.appendChild(elementWrapper);
      resultContainer.appendChild(document.createElement("br")); // Line break between elements

      // Display the screenshot if available
      if (element.screenshot) {
        const imgElement = document.createElement("img");
        imgElement.src = "data:image/png;base64," + element.screenshot;
        imageContainer.appendChild(imgElement);
      }
    });
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to scrape the URL");
  }
}
