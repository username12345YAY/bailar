// server.js
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const AGENT_ID = process.env.CHATBASE_AGENT_ID;

if (!AGENT_ID) {
  console.error("❌ CHATBASE_AGENT_ID not set in environment variables.");
  process.exit(1);
}

app.use(express.static(path.join(__dirname)));

// ✅ New direct API call instead of proxy — more reliable for Chatbase
app.post("/help", async (req, res) => {
  try {
    console.log("🟢 Incoming request body:", req.body);

    const response = await fetch(`https://www.chatbase.co/api/agent/${AGENT_ID}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.text();
    console.log("🟣 Chatbase response:", data);

    res.status(response.status).send(data);
  } catch (err) {
    console.error("🔴 Error calling Chatbase:", err);
    res.status(500).send({ error: "Failed to reach Chatbase API" });
  }
});

app.get("/", (req, res) => {
  res.send(`
    <h1>✅ Sagitarius Proxy Server Running</h1>
    <p>Visit <a href="/chat.html" target="_blank">Chatbox</a></p>
  `);
});

app.listen(PORT, () => console.log(`🚀 Sagitarius proxy running on port ${PORT}`));
