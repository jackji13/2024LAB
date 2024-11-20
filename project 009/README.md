
# HTML Elements Scraper Frontend

**Website URL:** [https://jackji13.github.io/2024LAB/project%20009/index.html](https://jackji13.github.io/2024LAB/project%20009/index.html)

## Overview

The HTML Elements Scraper Frontend is a web application that allows users to scrape specific HTML elements from any publicly accessible website. Users can retrieve elements along with their attributes, computed CSS styles, and screenshots. The frontend interacts with a custom backend API to perform the scraping.

## Features

- **Element Selection:** Choose from common HTML elements like `input`, `button`, `h1`, and `hr`.
- **Custom URL Input:** Enter any website URL to scrape elements from.
- **Display Results:** View the scraped elements with their full attributes and styles.
- **Screenshots:** See screenshots of each scraped element.
- **Element Count:** Displays the number of elements scraped and labels each one.
- **Responsive Design:** The application is accessible on various screen sizes.

## Tech Stack

- **HTML5 & CSS3:** Structure and styling of the web page.
- **JavaScript (ES6+):** Client-side scripting for user interaction and API communication.
- **Fetch API:** Communicate with the backend API.
- **Puppeteer (via Backend API):** Used for headless browser automation and scraping.
- **Express.js (via Backend API):** Web framework for handling API requests.

## API Usage

The frontend uses the custom HTML Elements Scraper API to fetch data. Here's basic information about the API:

- **API URL:** [https://element-scaper-api.onrender.com/](https://element-scaper-api.onrender.com/)
- **Endpoint:** `/scrape`
- **Methods:** `GET`
- **Parameters:**
  - `url` (string): The target website URL.
  - `elementType` (string): The type of element to scrape.

## How It Works

1. **User Input:** The user enters a website URL and selects an element type from the dropdown menu.
2. **API Request:** Upon clicking the "Scrape" button, the frontend sends a GET request to the backend API with the provided parameters.
3. **Data Processing:** The backend API processes the request using Puppeteer to scrape the specified elements and returns a JSON response.
4. **Display Results:** The frontend parses the response, displays the elements with their styles, and shows screenshots.

## Notes
- **Browser Compatibility:** The application is designed to work with modern browsers that support ES6 features and the Fetch API.
- **API Availability:** The frontend relies on the backend API being available. Ensure the API is running and accessible at the specified URL.
- **Error Handling:** If the API request fails, the application alerts the user and resets the headings.
