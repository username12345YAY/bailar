// server.js — FINAL ES MODULE VERSION
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow parsing JSON from frontend
app.use(express.json());

// Get your Chatbase Agent ID from environment variable
const AGENT_ID = process.env.CHATBASE_AGENT_ID;

if (!AGENT_ID) {
  console.error("❌ CHATBASE_AGENT_ID is not set in environment variables.");
  process.exit(1);
}

// Serve static files like chat.html
app.use(express.static(path.join(__dirname)));

// ✅ Direct API call to Chatbase
app.post("/help", async (req, res) => {
  try {
    console.log("🟢 Incoming request body:", req.body);

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

// Homepage
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
