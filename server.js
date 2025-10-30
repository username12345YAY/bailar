// server.js — Sagitarius AI Proxy (Final Version)
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow your Google Site to access the API (CORS)
app.use(
  cors({
    origin: "*", // You can change "*" to "https://sites.google.com" for more security
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse JSON request bodies
app.use(express.json());

// Get your Chatbase Agent ID securely from environment variables
const AGENT_ID = process.env.CHATBASE_AGENT_ID;

if (!AGENT_ID) {
  console.error("❌ CHATBASE_AGENT_ID is not set in Render environment variables.");
  process.exit(1);
}

// Serve static files (like chat.html)
app.use(express.static(path.join(__dirname)));

// ✅ Main endpoint: forwards messages to Chatbase
app.post("/help", async (req, res) => {
  try {
    console.log("🟢 Incoming message:", req.body);

    const response = await fetch(`https://www.chatbase.co/api/agent/${AGENT_ID}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log(`🟣 Chatbase responded (status ${response.status}):`, JSON.stringify(data, null, 2));

    res.status(response.status).json(data);
  } catch (error) {
    console.error("🔴 Error contacting Chatbase:", error);
    res.status(500).json({ error: "Failed to reach Chatbase API" });
  }
});

// Homepage route
app.get("/", (req, res) => {
  res.send(`
    <h1>✅ Sagitarius Proxy Server Running</h1>
    <p>Visit <a href="/chat.html" target="_blank">Chatbox</a></p>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sagitarius proxy running on port ${PORT}`);
});
