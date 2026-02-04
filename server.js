const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Sample talk data
const talks = [
    {
        "title": "The Quantum Leap in Machine Learning",
        "speakers": ["Dr. Evelyn Reed"],
        "categories": ["AI", "Quantum Computing", "ML"],
        "description": "Explore how quantum computing is set to revolutionize machine learning algorithms, making the impossible possible."
    },
    {
        "title": "Building Resilient Microservices",
        "speakers": ["Johnathan Chen", "Maria Garcia"],
        "categories": ["Backend", "Architecture"],
        "description": "A deep dive into the patterns and practices for creating robust, fault-tolerant microservices that scale."
    },
    {
        "title": "Modern Frontend: Beyond the Frameworks",
        "speakers": ["Samantha Wu"],
        "categories": ["Frontend", "Web", "JavaScript"],
        "description": "Discover the latest native browser APIs that can replace heavy JavaScript frameworks for a faster, leaner web."
    },
    {
        "title": "The Art of Data Storytelling",
        "speakers": ["David Lee"],
        "categories": ["Data", "Analytics"],
        "description": "Learn how to turn raw data into compelling narratives that drive decision-making and inspire action."
    },
    {
        "title": "Securing the Cloud-Native World",
        "speakers": ["Aisha Khan", "Ben Carter"],
        "categories": ["Security", "Cloud", "Architecture"],
        "description": "An overview of the current security landscape for cloud-native applications and how to defend against emerging threats."
    },
    {
        "title": "Ethical AI: Navigating the Grey Areas",
        "speakers": ["Dr. Kenji Tanaka"],
        "categories": ["AI", "Ethics"],
        "description": "A thought-provoking session on the ethical dilemmas posed by artificial intelligence and our responsibility as developers."
    }
];

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
