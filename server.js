// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Securely load your Chatbase Agent ID from environment variables
const AGENT_ID = process.env.CHATBASE_AGENT_ID;

if (!AGENT_ID) {
  console.error("❌ Error: CHATBASE_AGENT_ID is not set in environment variables.");
  process.exit(1);
}

// Serve static files like chat.html
app.use(express.static(path.join(__dirname)));

// Proxy middleware for Chatbase API messages
const chatbaseProxy = createProxyMiddleware({
  target: "https://www.chatbase.co",
  changeOrigin: true,
  pathRewrite: {
    "^/help": `/api/agent/${AGENT_ID}/message`, // correct API endpoint
  },
  proxyTimeout: 5000,
});

// Apply the proxy route
app.use("/help", chatbaseProxy);

// Simple homepage
app.get("/", (req, res) => {
  res.send(`
    <h1>✅ Chatbase Proxy Server Running</h1>
    <p>Try the chatbox at <a href="/chat.html" target="_blank">/chat.html</a></p>
    <p>Server is running with agent ID: <code>${AGENT_ID}</code></p>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
