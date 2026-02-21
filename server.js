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
        console.log('Talks collection is empty. Populating...');
        const initialTalks = generateAllTalks();
        const talkBatch = db.batch();
        initialTalks.forEach(talk => {
            const docRef = talksCollection.doc();
            talkBatch.set(docRef, talk);
        });
        await talkBatch.commit();
        console.log('Talks collection seeded.');
    }
    const categoriesSnapshot = await categoriesCollection.limit(1).get();
    if (categoriesSnapshot.empty) {
        console.log('Categories collection is empty. Populating from existing talks...');
        const allTalksSnapshot = await talksCollection.get();
        const allTalks = [];
        allTalksSnapshot.forEach(doc => allTalks.push(doc.data()));
        const allCategories = new Set(allTalks.flatMap(talk => talk.categories));
        const categoryBatch = db.batch();
        allCategories.forEach(categoryName => {
            if (categoryName) {
                const docRef = categoriesCollection.doc(categoryName);
                categoryBatch.set(docRef, { name: categoryName });
            }
        });
        await categoryBatch.commit();
        console.log('Categories collection seeded.');
    }
}

// --- Server Endpoints ---
app.get('/api/talks', async (req, res) => {
    const snapshot = await talksCollection.get();
    const talks = [];
    snapshot.forEach(doc => talks.push({ id: doc.id, ...doc.data() }));
    res.json(talks);
});

app.get('/api/categories', async (req, res) => {
    const snapshot = await categoriesCollection.get();
    const categories = [];
    snapshot.forEach(doc => categories.push(doc.data().name));
    res.json(categories.sort());
});

// FIXED POST endpoint
app.post('/api/talks', async (req, res) => {
    const newTalk = req.body;
    if (!newTalk || !newTalk.title || !newTalk.date || !newTalk.categories) {
        return res.status(400).json({ error: 'Invalid talk data provided.' });
    }

    try {
        const talkRef = talksCollection.doc();
        await db.runTransaction(async (transaction) => {
            // 1. Perform all reads first
            const categoryRefs = newTalk.categories.map(name => categoriesCollection.doc(name));
            const categoryDocs = await transaction.getAll(...categoryRefs);
            
            // 2. Now, perform all writes
            transaction.set(talkRef, newTalk); // Write the new talk

            // Write only the categories that don't exist yet
            categoryDocs.forEach((doc, index) => {
                if (!doc.exists) {
                    const newCategoryName = newTalk.categories[index];
                    const newCategoryRef = categoriesCollection.doc(newCategoryName);
                    transaction.set(newCategoryRef, { name: newCategoryName });
                }
            });
        });
        res.status(201).json({ id: talkRef.id, ...newTalk });
    } catch (e) {
        console.error("Transaction failure:", e);
        res.status(500).json({ error: "Failed to save talk." });
    }
});


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