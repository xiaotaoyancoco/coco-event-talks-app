const express = require('express');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
const PORT = process.env.PORT || 3000;

// --- Database Setup ---
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// --- Mock Data Generation (for initial setup) ---
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};
const titles = [
    "The Quantum Leap in Machine Learning", "Building Resilient Microservices", "Modern Frontend: Beyond Frameworks", "The Art of Data Storytelling",
    "Securing the Cloud-Native World", "Ethical AI: Navigating the Grey Areas", "The Future of Edge Computing", "Advanced CSS Grid Techniques",
    "Web Assembly: The Next Frontier", "Deep Dive into Serverless", "Optimizing Database Performance", "Introduction to Federated Learning"
];
const speakers = [
    ["Dr. Evelyn Reed"], ["Johnathan Chen", "Maria Garcia"], ["Samantha Wu"], ["David Lee"],
    ["Aisha Khan", "Ben Carter"], ["Dr. Kenji Tanaka"], ["Lena Petrova"], ["Marco Rossi"]
];
const categories = [
    ["AI", "ML"], ["Backend", "Architecture"], ["Frontend", "Web"], ["Data", "Analytics"],
    ["Security", "Cloud"], ["AI", "Ethics"], ["Cloud", "IoT"], ["CSS", "Frontend"]
];
const descriptions = [
    "A deep dive into the patterns and practices for creating robust, fault-tolerant systems.", "Explore how new technologies are set to revolutionize the field for the next decade.",
    "A thought-provoking session on our responsibilities as developers in a changing world.", "Learn how to turn raw data into compelling narratives that drive decision-making.",
    "An overview of the current landscape and how to defend against emerging threats.", "Discover the latest native browser APIs that can replace heavy JavaScript frameworks."
];

const generateDayOfTalks = (dateString) => {
    const dailyTalks = [];
    let currentTime = new Date(`${dateString}T10:00:00`);
    for (let i = 0; i < 6; i++) {
        const startTime = new Date(currentTime);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        dailyTalks.push({
            date: dateString,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            title: titles[(i * 2) % titles.length],
            speakers: speakers[i % speakers.length],
            categories: categories[i % categories.length],
            description: descriptions[i % descriptions.length]
        });
        if (i === 2) {
            currentTime.setTime(endTime.getTime() + 60 * 60 * 1000);
        } else {
            currentTime.setTime(endTime.getTime() + 10 * 60 * 1000);
        }
    }
    return dailyTalks;
};
const generateAllTalks = () => Array.from({ length: 7 }, (_, i) => generateDayOfTalks(daysAgo(i))).flat();

// --- Database Initialization ---
async function initializeDatabase() {
    await db.read();
    if (!db.data || !db.data.talks) {
        db.data = { talks: [] };
        await db.write();
    }
    if (db.data.talks.length === 0) {
        console.log('Database is empty. Populating with initial mock data...');
        const initialTalks = generateAllTalks();
        let nextId = 1;
        const talksWithIds = initialTalks.map(talk => ({ id: nextId++, ...talk }));
        db.data.talks = talksWithIds;
        await db.write();
        console.log('Database initialized successfully.');
    }
}

// --- Server Endpoints ---
app.get('/api/talks', async (req, res) => {
    await db.read();
    res.json(db.data.talks || []);
});

app.post('/api/talks', async (req, res) => {
    const newTalk = req.body;
    if (!newTalk || !newTalk.title || !newTalk.date) {
        return res.status(400).json({ error: 'Invalid talk data provided.' });
    }
    await db.read();
    const lastId = db.data.talks.length > 0 ? Math.max(...db.data.talks.map(t => t.id)) : 0;
    const talkWithId = { id: lastId + 1, ...newTalk };
    db.data.talks.push(talkWithId);
    await db.write();
    res.status(201).json(talkWithId);
});

// DELETE a talk by ID
app.delete('/api/talks/:id', async (req, res) => {
    const talkId = parseInt(req.params.id, 10);
    if (isNaN(talkId)) {
        return res.status(400).json({ error: 'Invalid ID format.' });
    }

    await db.read();
    const talkIndex = db.data.talks.findIndex(t => t.id === talkId);

    if (talkIndex === -1) {
        return res.status(404).json({ error: 'Talk not found.' });
    }

    db.data.talks.splice(talkIndex, 1);
    await db.write();
    
    res.status(204).send(); // No Content
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
});