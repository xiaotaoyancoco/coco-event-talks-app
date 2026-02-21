# Tech Event Website

This project is a single-page application to display and manage the schedule for a multi-day technical conference. It is built with a Node.js backend, Google Cloud Firestore for data persistence, and standard HTML, CSS, and JavaScript on the front end.

## Features

- **Dynamic Schedule:** The event schedule is dynamically rendered from the Firestore database.
- **Cloud Data Persistence:** Uses **Google Cloud Firestore** to store all talk and category data, making it persistent, scalable, and available across all running instances. The database is seeded with mock data on the first run.
- **Optimized Filtering:** Talk filtering by date and category is highly performant, using a dedicated `categories` collection in the database.
- **Create Talks:** Click the **"+ Add Talk"** button to open a form and schedule a new talk for the next day.
    - The form intelligently shows only the available time slots for that day.
    - The category input allows filtering from existing categories or creating new ones on the fly, which are then persisted in the database.
- **Delete Talks:** A **"Delete"** button appears on all talks scheduled for a future time, allowing for their removal.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Google Cloud Firestore
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)

---

## Project Structure

```
/tech-event-website
├── .dockerignore          # Specifies files to be ignored by Docker
├── Dockerfile             # Instructions to build the Docker image
├── .gitignore             # Specifies files to be ignored by Git
├── node_modules/          # Contains all project dependencies
├── package.json           # Lists project dependencies and defines scripts
├── package-lock.json      # Records the exact versions of dependencies
├── README.md              # This file
├── server.js              # The main backend server file
└── public/
    ├── index.html         # The main HTML page for the frontend
    ├── css/
    │   └── style.css      # All styling for the application
    └── js/
        └── script.js      # Client-side logic for rendering, filtering, and interactions
```

---

## How to Run This Project

1.  **Prerequisites:** 
    - Make sure you have [Node.js](https://nodejs.org/) installed.
    - You must have the [Google Cloud SDK](https://cloud.google.com/sdk/install) installed and authenticated (`gcloud auth application-default login`).
    - You need a Google Cloud project with Firestore enabled.

2.  **Install Dependencies:** Open your terminal in the project root directory and run the following command:
    ```bash
    npm install
    ```

3.  **Start the Server:** Once the dependencies are installed, start the local server with:
    ```bash
    npm start
    ```
    You will see a confirmation message in the terminal: `Server is running on http://localhost:8080`. On the very first run against an empty database, it will also log that it is seeding Firestore.

4.  **View in Browser:** Open your web browser and navigate to the following address:
    [http://localhost:8080](http://localhost:8080)

**Note:** The application is configured to connect to the Google Cloud project `my-tech-486713`. To reset the data, you will need to manually delete the `talks` and `categories` collections from the Firestore console.