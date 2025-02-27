const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());

const nucleiPath = "C:\\Users\\ikadiri\\nuclei\\nuclei.exe"; // Full path to Nuclei

// ✅ POST Request to Start Scan
app.post("/start-scan", (req, res) => {
    const { targetUrl } = req.body;

    if (!targetUrl) {
        return res.status(400).json({ error: "Target URL is required" });
    }

    console.log(`Starting scan for: ${targetUrl}`);

    const outputFilePath = path.join(__dirname, "output.txt");

    // Run Nuclei scan and save results to a plain text file
    exec(`${nucleiPath} -u ${targetUrl} -o ${outputFilePath}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error running Nuclei: ${err.message}`);
            return res.status(500).json({ error: "Failed to run Nuclei scan" });
        }

        console.log("Scan completed.");

        // Read and parse results from output.txt
        fs.readFile(outputFilePath, "utf-8", (err, data) => {
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

                res.json({ numOfVulnerabilities: vulnerabilities.length, vulnerabilities });
            } catch (parseError) {
                console.error("Error parsing Nuclei output:", parseError);
                res.status(500).json({ error: "Failed to parse Nuclei results" });
            }
        });
    });
});

// ✅ Capitalize function for severity levels
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
