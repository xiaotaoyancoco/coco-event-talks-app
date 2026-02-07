# Tech Event Website

This project is a single-page application to display and manage the schedule for a multi-day technical conference. It is built with a Node.js backend, a lightweight JSON database, and standard HTML, CSS, and JavaScript on the front end.

## Features

- **Dynamic Schedule:** The event schedule is dynamically rendered from a persistent JSON database.
- **Data Persistence:** Uses **`lowdb`** to store all talk data in a `db.json` file, making data persistent across server restarts. The database is seeded with mock data on the first run.
- **Date & Category Filtering:** Users can filter the displayed talks by date and/or by category using dynamic dropdown menus.
- **Create Talks:** Click the **"+ Add Talk"** button to open a form and schedule a new talk for the next day.
    - The form intelligently shows only the available time slots for that day.
    - The category input allows filtering from existing categories or creating new ones on the fly.
- **Delete Talks:** A **"Delete"** button appears on all talks scheduled for a future time, allowing for their removal.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** `lowdb` (flat-file JSON database)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)

---

## Project Structure

```
/tech-event-website
├── db.json                # JSON file used by lowdb for data storage
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

1.  **Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

2.  **Install Dependencies:** Open your terminal in the project root directory and run the following command to install the necessary packages:
    ```bash
    npm install
    ```

3.  **Start the Server:** Once the dependencies are installed, start the local server with:
    ```bash
    npm start
    ```
    You will see a confirmation message in the terminal: `Server is running on http://localhost:3000`. On the very first run, it will also log that it is seeding the database.

4.  **View in Browser:** Open your web browser and navigate to the following address:
    [http://localhost:3000](http://localhost:3000)

**Note:** If you want to reset the data to the initial mock data, simply delete the `db.json` file and restart the server.