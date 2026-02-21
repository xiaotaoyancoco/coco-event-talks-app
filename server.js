const express = require('express');
const path = require('path');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;

// --- Firestore Setup ---
const db = new Firestore({
    projectId: 'my-tech-486713', // Make sure this matches your project ID
});
const talksCollection = db.collection('talks');


// --- Mock Data Generation (for initial setup) ---
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};
const generateDayOfTalks = (dateString) => {
    // ... [Same data generation logic as before]
    const dailyTalks = [];
    let currentTime = new Date(`${dateString}T10:00:00`);
    const titles = ["Quantum Leap", "Resilient Microservices", "Modern Frontend", "Data Storytelling", "Cloud-Native Security", "Ethical AI"];
    const speakers = [["Dr. Reed"], ["J. Chen"], ["S. Wu"], ["D. Lee"], ["A. Khan"], ["Dr. Tanaka"]];
    const categories = [["AI"], ["Backend"], ["Frontend"], ["Data"], ["Security"], ["Ethics"]];
    for (let i = 0; i < 6; i++) {
        const startTime = new Date(currentTime);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        dailyTalks.push({
            date: dateString,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            title: titles[i],
            speakers: speakers[i],
            categories: categories[i],
            description: "A deep dive into the patterns and practices."
        });
        currentTime.setTime(endTime.getTime() + (i === 2 ? 60 * 60 * 1000 : 10 * 60 * 1000));
    }
    return dailyTalks;
};
const generateAllTalks = () => Array.from({ length: 7 }, (_, i) => generateDayOfTalks(daysAgo(i))).flat();


// --- Database Initialization ---
async function initializeDatabase() {
    const snapshot = await talksCollection.limit(1).get();
    if (snapshot.empty) {
        console.log('Talks collection is empty. Populating with initial mock data...');
        const initialTalks = generateAllTalks();
        const batch = db.batch();
        initialTalks.forEach(talk => {
            const docRef = talksCollection.doc(); // Firestore generates an ID
            batch.set(docRef, talk);
        });
        await batch.commit();
        console.log('Database initialized successfully.');
    }
}

// --- Server Endpoints ---
// GET all talks
app.get('/api/talks', async (req, res) => {
    const snapshot = await talksCollection.get();
    const talks = [];
    snapshot.forEach(doc => {
        talks.push({ id: doc.id, ...doc.data() });
    });
    res.json(talks);
});

// POST a new talk
app.post('/api/talks', async (req, res) => {
    const newTalk = req.body;
    if (!newTalk || !newTalk.title || !newTalk.date) {
        return res.status(400).json({ error: 'Invalid talk data provided.' });
    }
    const docRef = await talksCollection.add(newTalk);
    res.status(201).json({ id: docRef.id, ...newTalk });
});

// DELETE a talk by ID
app.delete('/api/talks/:id', async (req, res) => {
    const talkId = req.params.id;
    await talksCollection.doc(talkId).delete();
    res.status(204).send();
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
