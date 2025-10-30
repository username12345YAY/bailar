// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const open = require("open"); // optional: opens browser locally (safe to leave)

const app = express();
const PORT = process.env.PORT || 3000;

// Securely load your Chatbase Agent ID from environment variables
const AGENT_ID = process.env.CHATBASE_AGENT_ID;

if (!AGENT_ID) {
  console.error("❌ Error: CHATBASE_AGENT_ID is not set in environment variables.");
  process.exit(1); // Stop the server if the ID isn't configured
}

// Create proxy middleware for Chatbase
const chatbaseProxy = createProxyMiddleware({
  target: "https://chatbase.co",
  changeOrigin: true,
  pathRewrite: {
    "^/help": `/${AGENT_ID}/help`,
  },
  proxyTimeout: 5000,
});

// Apply the proxy route
app.use("/help", chatbaseProxy);

// Simple homepage
app.get("/", (req, res) => {
  res.send(`
    <h1>✅ Chatbase Proxy Server Running</h1>
    <p>Try visiting <a href="/help" target="_blank">/help</a> to test the Chatbase proxy.</p>
    <p>Server is running with agent ID: <code>${AGENT_ID}</code></p>
  `);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  // Only open the browser if running locally (Render ignores this safely)
  if (process.env.RENDER === undefined) {
    await open(`http://localhost:${PORT}`);
  }
});
