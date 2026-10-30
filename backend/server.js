const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");

const {
  initializeKnowledgeBase,
} = require("./services/knowledgeService");

const app = express();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json());

// ==========================================
// ROUTES
// ==========================================

app.use("/api/chat", chatRoutes);

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🧠 Initializing UniAssist Knowledge Base...");

    await initializeKnowledgeBase();

    console.log("✅ Knowledge Base Ready");

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error(
      "❌ Failed to initialize Knowledge Base:",
      error
    );

    process.exit(1);
  }
};

startServer();