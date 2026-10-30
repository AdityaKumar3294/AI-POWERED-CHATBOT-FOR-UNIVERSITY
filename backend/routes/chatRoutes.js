const express = require("express");

const {
  generateAIResponse,
} = require("../services/geminiService");

const {
  generateLocalResponse,
  getRAGContext,
} = require("../services/localAIService");

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("\n==============================");
  console.log("📩 CHAT REQUEST RECEIVED");
  console.log("==============================");

  try {
    console.log("📦 Request body:", req.body);

    const {
      message,
      history = [],
    } = req.body;

    console.log("💬 Message:", message);
    console.log("🧾 History length:", history.length);

    /*
    ==========================================
    VALIDATION
    ==========================================
    */

    if (!message || !message.trim()) {
      console.log("❌ Message is empty");

      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    /*
    ==========================================
    AI MODE
    ==========================================
    */

    const aiMode =
      process.env.AI_MODE || "auto";

    console.log("⚙️ AI_MODE:", aiMode);

    /*
    ==========================================
    LOCAL MODE
    ==========================================
    */

    if (aiMode === "local") {
      console.log("🧠 Using Local RAG Mode");

      console.log(
        "🔎 Searching knowledge base..."
      );

      const result =
        await generateLocalResponse(message);

      console.log(
        "✅ Local RAG completed"
      );

      console.log(
        "📚 Sources:",
        result.sources
      );

      return res.json({
        success: true,
        reply: result.reply,
        sources: result.sources,
        mode: "local",
      });
    }

    /*
    ==========================================
    GEMINI MODE
    ==========================================
    */

    if (aiMode === "gemini") {
      console.log(
        "🤖 Using Gemini + RAG Mode"
      );

      console.log(
        "🔎 Retrieving RAG context..."
      );

      const ragResult =
        await getRAGContext(message);

      console.log(
        "📚 RAG Sources:",
        ragResult.sources
      );

      const reply =
        await generateAIResponse(
          message,
          history,
          ragResult.context
        );

      console.log(
        "✅ Gemini + RAG response generated"
      );

      return res.json({
        success: true,
        reply,
        sources: ragResult.sources,
        mode: "gemini-rag",
      });
    }

    /*
    ==========================================
    AUTO MODE
    ==========================================
    */

    if (aiMode === "auto") {
      console.log(
        "🔄 Using AUTO AI Mode"
      );

      /*
      ------------------------------------------
      STEP 1: Retrieve RAG Context
      ------------------------------------------
      */

      console.log(
        "🔎 Retrieving RAG context..."
      );

      const ragResult =
        await getRAGContext(message);

      console.log(
        "📚 RAG Sources:",
        ragResult.sources
      );

      /*
      ------------------------------------------
      STEP 2: Try Gemini
      ------------------------------------------
      */

      try {
        console.log(
          "🤖 Attempting Gemini + RAG..."
        );

        const reply =
          await generateAIResponse(
            message,
            history,
            ragResult.context
          );

        console.log(
          "✅ Gemini + RAG succeeded"
        );

        return res.json({
          success: true,
          reply,
          sources: ragResult.sources,
          mode: "gemini-rag",
        });

      } catch (geminiError) {

        /*
        ------------------------------------------
        Gemini failed
        ------------------------------------------
        */

        console.error(
          "\n⚠️ Gemini failed"
        );

        console.error(
          "Error:",
          geminiError.message
        );

        console.log(
          "🔄 Switching to Local RAG fallback..."
        );

        /*
        ------------------------------------------
        STEP 3: Local RAG Fallback
        ------------------------------------------
        */

        const localResult =
          await generateLocalResponse(
            message,
            ragResult.chunks
          );

        console.log(
          "✅ Local RAG fallback completed"
        );

        console.log(
          "📚 Fallback Sources:",
          localResult.sources
        );

        return res.json({
          success: true,
          reply: localResult.reply,
          sources: localResult.sources,
          mode: "local-fallback",
          fallbackReason:
            geminiError.message,
        });
      }
    }

    /*
    ==========================================
    INVALID MODE
    ==========================================
    */

    console.log(
      "❌ Invalid AI_MODE:",
      aiMode
    );

    return res.status(500).json({
      success: false,
      message:
        "Invalid AI_MODE configuration",
    });

  } catch (error) {
    console.error(
      "\n❌❌❌ CHAT ERROR ❌❌❌"
    );

    console.error(
      "Error name:",
      error.name
    );

    console.error(
      "Error message:",
      error.message
    );

    console.error(
      "Error stack:",
      error.stack
    );

    console.error(
      "❌❌❌ END CHAT ERROR ❌❌❌\n"
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate AI response",
      error: error.message,
    });
  }
});

module.exports = router;