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
    origin: 'http://localhost:5173',  
    methods: 'GET,POST,OPTIONS',
    credentials: true
}));
app.use(express.json());

const nucleiPath = "C:\\Users\\ikadiri\\nuclei\\nuclei.exe"; 

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

const commentSchema = new mongoose.Schema({
    vulnerabilityName: { type: String, required: true },
    name: { type: String, required: true },
    definitionText: { type: String, required: true },
    fixText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', commentSchema, 'user-comments');

// Define scan result schema
const scanReportSchema = new mongoose.Schema({
    target: { type: String, required: true },
    vulnerabilities: [{
        name: { type: String, required: true },
        protocol: { type: String, required: true },
        target: { type: String, required: true }
    }],
    createdAt: { type: Date, default: Date.now },
});
const ScanReport = mongoose.model('ScanReport', scanReportSchema, 'scan-report');

// Authentication middleware(i had chatgpt help with this part)
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



app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 }); // Sort by most recent
        res.json(comments); // Return all comments
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error fetching comments' });
    }
});


app.post('/api/comments', authMiddleware, async (req, res) => {
    const { vulnerabilityName, name, definitionText, fixText } = req.body;
   
    if (!definitionText.trim() || !fixText.trim()) {
        return res.status(400).json({ msg: 'Comment cannot be empty' });
    }
    try {
        const newComment = new Comment({  vulnerabilityName, name, definitionText, fixText});
        await newComment.save();
        res.status(201).json({ msg: 'Comment added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error submitting comment' });
    }
});
app.get('/api/comments/search', async (req, res) => {
    try {
        const { query } = req.query;  // Get the search term from the request

        if (!query || query.trim() === "") {
            return res.status(400).json({ msg: "Search query cannot be empty" });
        }

        // Perform a case-insensitive search for vulnerability names
        const comments = await Comment.find({ 
            vulnerabilityName: { $regex: query, $options: "i" } 
        }).sort({ createdAt: -1 });

        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error searching comments' });
    }
});



// Routes for signup and login
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


app.post("/start-scan", (req, res) => {
    const { targetUrl, targetIP } = req.body;
    let command;

    if (targetIP) {
        command = `${nucleiPath} -target ${targetIP} -t network/ -o output.txt`;
        
    }else if(targetUrl){
        command = `${nucleiPath} -u ${targetUrl} -t http -o output.txt`;
    }else{
        return res.status(400).json({ error: "Target IP is required" });
    }

    const outputFilePath = path.join(__dirname, "output.txt");

    // Run Nuclei scan and save results to a plain text file
    exec(command, (err, stdout, stderr) => {
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

            if (!data||!data.trim()){
                console.log("no vulnerbility found")
                return res.status(200).json({ msg: "Scan completed successfully", vulnerabilities: [] });
            }

         
            try {
                const rawLines = data.trim().split("\n");
                console.log("Raw Nuclei Output:\n", data);
                // Convert plain text to structured JSON using regex
                const regex = /^\[([^\]]+)] \[([^\]]+)] \[([^\]]+)] ([^\[]+)$/gm;
                const regex2 = /^\[([^\]]+)] \[([^\]]+)] \[([^\]]+)] ([^\[]+)\s+\["([^\]]+)"\]$/gm; 
                const vulnerabilities = [];
                    let match ;
                    while ((match = regex.exec(data)) !== null) {
                        vulnerabilities.push({
                            name: match[1],           // Vulnerability name
                            protocol: match[2],       // Protocol (http, network, etc.)
                            target: match[4].trim()   // Target URL/IP
                        });
                }
                console.log("Parsed Vulnerabilities:", vulnerabilities);


                // Save to database
                const newScanResult = new ScanReport({target: targetIP || targetUrl, vulnerabilities});
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));