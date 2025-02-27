const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:5173',  // Allow requests from your frontend (Vue app)
    methods: 'GET,POST',
}));
app.use(express.json());

const nucleiPath = "C:\\Users\\ikadiri\\nuclei\\nuclei.exe"; // Full path to Nuclei

mongoose.connect('mongodb://localhost:27017/Capstone', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
const User = mongoose.model('User', userSchema, 'user-profiles');

// Define comment schema
const commentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    commentText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', commentSchema, 'user-comments');

// Define scan result schema
const scanResultSchema = new mongoose.Schema({
    targetUrl: { type: String, required: true },
    vulnerabilities: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});
const ScanResult = mongoose.model('ScanResult', scanResultSchema, 'scan-results');

// Authentication middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Route to fetch all comments (for public display)

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 }); // Sort by most recent
        res.json(comments); // Return all comments
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching comments' });
    }
});


// Route to submit a new comment (requires login)
app.post('/api/comments', authMiddleware, async (req, res) => {
    const { commentText } = req.body;
    const { username } = req.user; // The logged-in user's username from JWT
    if (!commentText.trim()) {
        return res.status(400).json({ msg: 'Comment cannot be empty' });
    }
    try {
        const newComment = new Comment({ username, commentText });
        await newComment.save();
        res.status(201).json({ msg: 'Comment added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error submitting comment' });
    }
});

// Route to fetch the latest scan result
// app.get('/api/scans/recent', authMiddleware, async (req, res) => {
//     try {
//         const recentScan = await ScanResult.findOne().sort({ createdAt: -1 }).limit(1); // Get the latest scan
//         if (!recentScan) {
//             return res.status(404).json({ msg: 'No scan results found' });
//         }
//         res.json(recentScan);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ msg: 'Error fetching scan results' });
//     }
// });

// Routes for signup and login
// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ msg: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Scan start route
app.post("/start-scan", (req, res) => {
    const { targetUrl } = req.body;

    if (!targetUrl) {
        return res.status(400).json({ error: "Target URL is required" });
    }

    const outputFilePath = path.join(__dirname, "output.txt");

    // Run Nuclei scan and save results to a plain text file
    exec(`${nucleiPath} -u ${targetUrl} -o ${outputFilePath}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error running Nuclei: ${err.message}`);
            return res.status(500).json({ error: "Failed to run Nuclei scan" });
        }

        console.log("Scan completed.");

        // Read and parse results from output.txt
        fs.readFile(outputFilePath, "utf-8", async (err, data) => {
            if (err) {
                console.error(`Error reading results file: ${err.message}`);
                return res.status(500).json({ error: "Failed to read scan results" });
            }

            try {
                const rawLines = data.trim().split("\n");

                // Convert plain text to structured JSON using regex
                const regex = /^\[([^\]]+)] \[([^\]]+)] \[([^\]]+)] ([^\[]+)$/gm;
                const vulnerabilities = rawLines.map(line => {
                    const match = regex.exec(line);
                    if (!match) return null;

                    return {
                        name: match[1],           // Vulnerability name
                        protocol: match[2],       // Protocol (http)
                        severity: capitalize(match[3]),  // Severity (info, critical)
                        target: match[4].trim()   // Target URL/IP
                    };
                }).filter(result => result !== null);

                // Save to database
                const newScanResult = new ScanResult({
                    targetUrl,
                    vulnerabilities: vulnerabilities.map(vul => vul.name), // Save only names for now
                });
                await newScanResult.save();

                res.json({ numOfVulnerabilities: vulnerabilities.length, vulnerabilities });
            } catch (parseError) {
                console.error("Error parsing Nuclei output:", parseError);
                res.status(500).json({ error: "Failed to parse Nuclei results" });
            }
        });
    });
});

// Download scan results as a text file
app.get("/download-scan-results", (req, res) => {
    const outputFilePath = path.join(__dirname, "output.txt");

    res.download(outputFilePath, "scan-results.txt", (err) => {
        if (err) {
            console.error(`Error downloading scan results: ${err.message}`);
            return res.status(500).json({ error: "Failed to download scan results" });
        }
    });
});

// Capitalize function for severity levels
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
