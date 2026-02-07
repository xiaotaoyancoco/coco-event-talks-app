const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// --- Mock Data Generation ---

// Helper to get date strings
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Data pools for variety
const titles = [
    "The Quantum Leap in Machine Learning", "Building Resilient Microservices", "Modern Frontend: Beyond Frameworks",
    "The Art of Data Storytelling", "Securing the Cloud-Native World", "Ethical AI: Navigating the Grey Areas",
    "The Future of Edge Computing", "Advanced CSS Grid Techniques", "Web Assembly: The Next Frontier",
    "Deep Dive into Serverless", "Optimizing Database Performance", "Introduction to Federated Learning"
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
    "A deep dive into the patterns and practices for creating robust, fault-tolerant systems.",
    "Explore how new technologies are set to revolutionize the field for the next decade.",
    "A thought-provoking session on our responsibilities as developers in a changing world.",
    "Learn how to turn raw data into compelling narratives that drive decision-making.",
    "An overview of the current landscape and how to defend against emerging threats.",
    "Discover the latest native browser APIs that can replace heavy JavaScript frameworks."
];

// Function to generate a full day of 6 talks
const generateDayOfTalks = (dateString) => {
    const dailyTalks = [];
    for (let i = 0; i < 6; i++) {
        dailyTalks.push({
            "date": dateString,
            "title": titles[(i * 2) % titles.length],
            "speakers": speakers[i % speakers.length],
            "categories": categories[i % categories.length],
            "description": descriptions[i % descriptions.length]
        });
    }
    return dailyTalks;
};

// Generate a consistent 7-day schedule, with 6 talks per day
const generateAllTalks = () => {
    let allTalks = [];
    for (let i = 0; i < 7; i++) {
        const date = daysAgo(i);
        const dailyTalks = generateDayOfTalks(date);
        allTalks = allTalks.concat(dailyTalks);
    }
    return allTalks;
};

const talks = generateAllTalks();


// --- Server Endpoints and Startup ---

// API endpoint to get talk data
app.get('/api/talks', (req, res) => {
    res.json(talks);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
