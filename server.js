const express = require('express');
const path = require('path');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;

// --- Firestore Setup ---
const db = new Firestore({
    projectId: 'my-tech-486713',
});
const talksCollection = db.collection('talks');
const categoriesCollection = db.collection('categories');


// --- Mock Data Generation (for initial setup) ---
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};
const generateDayOfTalks = (dateString) => {
    const dailyTalks = [];
    let currentTime = new Date(`${dateString}T10:00:00`);
    const titles = ["Quantum Leap", "Resilient Microservices", "Modern Frontend", "Data Storytelling", "Cloud-Native Security", "Ethical AI"];
    const speakers = [["Dr. Reed"], ["J. Chen"], ["S. Wu"], ["D. Lee"], ["A. Khan"], ["Dr. Tanaka"]];
    const categories = [["AI", "ML"], ["Backend", "Architecture"], ["Frontend", "Web"], ["Data", "Analytics"], ["Security", "Cloud"], ["AI", "Ethics"]];
    for (let i = 0; i < 6; i++) {
        const startTime = new Date(currentTime);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        dailyTalks.push({
            date: dateString,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            title: titles[i],
            speakers: speakers[i],
            categories: categories[i % categories.length],
            description: "A deep dive into the patterns and practices."
        });
        currentTime.setTime(endTime.getTime() + (i === 2 ? 60 * 60 * 1000 : 10 * 60 * 1000));
    }
    return dailyTalks;
};
const generateAllTalks = () => Array.from({ length: 7 }, (_, i) => generateDayOfTalks(daysAgo(i))).flat();


// --- Database Initialization ---
async function initializeDatabase() {
    const talksSnapshot = await talksCollection.limit(1).get();
    if (talksSnapshot.empty) {
        console.log('Database is empty. Populating with initial mock data...');
        const initialTalks = generateAllTalks();
        const talkBatch = db.batch();
        initialTalks.forEach(talk => {
            const docRef = talksCollection.doc();
            talkBatch.set(docRef, talk);
        });
        await talkBatch.commit();
        
        // Also populate the categories collection
        const initialCategories = new Set(initialTalks.flatMap(talk => talk.categories));
        const categoryBatch = db.batch();
        initialCategories.forEach(categoryName => {
            const docRef = categoriesCollection.doc(categoryName); // Use category name as ID for easy lookup
            categoryBatch.set(docRef, { name: categoryName });
        });
        await categoryBatch.commit();
        console.log('Database initialized successfully.');
    }
}

// --- Server Endpoints ---
app.get('/api/talks', async (req, res) => {
    const snapshot = await talksCollection.get();
    const talks = [];
    snapshot.forEach(doc => talks.push({ id: doc.id, ...doc.data() }));
    res.json(talks);
});

// NEW: Endpoint to get all unique categories
app.get('/api/categories', async (req, res) => {
    const snapshot = await categoriesCollection.get();
    const categories = [];
    snapshot.forEach(doc => categories.push(doc.data().name));
    res.json(categories.sort());
});

app.post('/api/talks', async (req, res) => {
    const newTalk = req.body;
    if (!newTalk || !newTalk.title || !newTalk.date) {
        return res.status(400).json({ error: 'Invalid talk data provided.' });
    }

    // Use a transaction to save talk and update categories collection
    try {
        const talkRef = talksCollection.doc();
        await db.runTransaction(async (transaction) => {
            transaction.set(talkRef, newTalk);

            // For each category in the new talk, check if it exists in the categories collection
            for (const categoryName of newTalk.categories) {
                const categoryRef = categoriesCollection.doc(categoryName);
                const categoryDoc = await transaction.get(categoryRef);
                if (!categoryDoc.exists) {
                    transaction.set(categoryRef, { name: categoryName });
                }
            }
        });
        res.status(201).json({ id: talkRef.id, ...newTalk });
    } catch (e) {
        console.error("Transaction failure:", e);
        res.status(500).json({ error: "Failed to save talk." });
    }
});

app.delete('/api/talks/:id', async (req, res) => {
    // Note: This simplified version doesn't clean up orphan categories.
    // A full implementation would require checking if any other talk uses the category
    // before deleting it from the 'categories' collection, which is more complex.
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