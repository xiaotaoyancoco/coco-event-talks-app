# Tech Event Website

This project is a simple, single-page website to display the schedule for a one-day technical conference. It is built with a Node.js backend and standard HTML, CSS, and JavaScript on the front end.

## Features

- **Single-Page Layout:** All information is presented on a single, easy-to-navigate page.
- **Dynamic Schedule:** The event schedule is dynamically rendered from data fetched from the backend.
- **Category Filtering:** Users can filter the displayed talks by selecting a category from a dropdown menu.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)

---

## Project Structure

The project follows a standard structure for a simple web application:

```
/tech-event-website
├── .gitignore             # Specifies files to be ignored by Git
├── node_modules/          # Contains all project dependencies (created after `npm install`)
├── package.json           # Lists project dependencies and defines scripts
├── package-lock.json      # Records the exact versions of dependencies
├── README.md              # This file
├── server.js              # The main backend server file
└── public/
    ├── index.html         # The main HTML page for the frontend
    ├── css/
    │   └── style.css      # All styling for the application
    └── js/
        └── script.js      # Client-side logic for rendering and filtering
```

---

## Modules and Functions

### `server.js`
-   **Purpose:** This is the heart of the backend.
-   **Functions:**
    -   It uses **Express.js** to create a web server.
    -   It serves all static files (HTML, CSS, JS) located in the `public/` directory.
    -   It defines an API endpoint at `/api/talks` which returns a JSON object containing the data for all the talks. For this project, the data is stored directly in this file.

### `public/index.html`
-   **Purpose:** This is the main and only webpage for the application.
-   **Functions:**
    -   Provides the basic HTML structure, including the header and a container for the schedule.
    -   Includes a `<select>` dropdown that will be populated with talk categories for filtering.
    -   Links to the `style.css` for styling and `script.js` for functionality.

### `public/css/style.css`
-   **Purpose:** Contains all the visual styling for the application.
-   **Functions:**
    -   Styles the layout, typography, colors, and the "card" appearance for each talk.
    -   Defines a `.hidden` class to hide talks that do not match the filter criteria.

### `public/js/script.js`
-   **Purpose:** This file contains all the client-side logic that makes the page interactive.
-   **Functions:**
    -   Fetches the event data from the `/api/talks` endpoint when the page loads.
    -   Dynamically generates the schedule HTML based on the fetched data, including calculating timings and inserting breaks.
    -   Populates the category filter dropdown with unique categories from the talk data.
    -   Adds an event listener to the dropdown to filter the talks in real-time by hiding or showing schedule items based on the user's selection.

---

## How to Run This Project

To run this project locally, please follow these steps:

1.  **Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

2.  **Install Dependencies:** Open your terminal in the project root directory and run the following command to install the necessary `express` package:
    ```bash
    npm install
    ```

3.  **Start the Server:** Once the dependencies are installed, start the local server with:
    ```bash
    npm start
    ```
    You will see a confirmation message in the terminal: `Server is running on http://localhost:3000`.

4.  **View in Browser:** Open your web browser and navigate to the following address:
    [http://localhost:3000](http://localhost:3000)

You can now view the event schedule and test the category filtering functionality.
