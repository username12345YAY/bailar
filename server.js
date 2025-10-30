// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const { createProxyServer } = require("http-proxy");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON so we can forward it properly
app.use(express.json());

// Load your Chatbase agent ID
const AGENT_ID = process.env.CHATBASE_AGENT_ID;

if (!AGENT_ID) {
  console.error("❌ CHATBASE_AGENT_ID not set. Add it in Render environment variables.");
  process.exit(1);
}

// Serve static files (chat.html)
app.use(express.static(path.join(__dirname)));

// ✅ Proxy handler — correctly forwards body to Chatbase
app.post("/help", async (req, res) => {
  const proxy = createProxyServer({
    target: `https://www.chatbase.co`,
    changeOrigin: true,
  });

  // Intercept the proxy request to send the correct body
  proxy.on("proxyReq", (proxyReq, reqBody) => {
    const bodyData = JSON.stringify({
      messages: reqBody.messages,
    });

    proxyReq.setHeader("Content-Type", "application/json");
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  });

  proxy.web(req, res, {
    target: `https://www.chatbase.co/api/agent/${AGENT_ID}/message`,
  });
});

// Home route
app.get("/", (req, res) => {
  res.send(`
    <h1>✅ Sagitarius Proxy Server Running</h1>
    <p>Visit <a href="/chat.html" target="_blank">Chatbox</a></p>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sagitarius proxy server running on port ${PORT}`);
});
