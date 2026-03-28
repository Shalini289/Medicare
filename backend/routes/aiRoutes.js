const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY not set");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ FIXED ROUTE → matches frontend
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    // ✅ validation
    if (!message) {
      return res.status(400).json({
        message: "Message is required ❌"
      });
    }

    // ✅ API call
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a healthcare assistant. Suggest ONLY doctor specialization like cardiologist, dermatologist, etc."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7
    });

    const reply =
      completion?.choices?.[0]?.message?.content || "No response";

    res.json({ reply });

  } catch (err) {
    console.error("GROQ ERROR 👉", err.message);

    res.status(500).json({
      message: "AI service failed ❌",
      error: err.message
    });
  }
});

module.exports = router;