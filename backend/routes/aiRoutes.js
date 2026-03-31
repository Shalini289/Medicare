const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required ❌"
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a medical AI.

Return ONLY JSON. No text outside JSON.

Format:
{
  "reply": "",
  "specialist": "",
  "urgent": false
}

Rules:
- specialist MUST be one word like: cardiologist, neurologist, dermatologist
- urgent = true if chest pain, breathing issue, severe pain
- reply should be short and helpful

DO NOT return explanation outside JSON.
`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3
    });

    let output =
  completion?.choices?.[0]?.message?.content || "";

// ✅ REMOVE markdown if present
output = output
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

    // 🧠 Parse safely
   let parsed;

try {
  parsed = JSON.parse(output);
} catch {
  parsed = {
    reply: output,
    specialist: "",
    urgent: false
  };
}

// ✅ ADD HERE 👇 (IMPORTANT)
if (!parsed.specialist) {
  const text = parsed.reply.toLowerCase();

  if (text.includes("cardio")) parsed.specialist = "cardiologist";
  else if (text.includes("derma")) parsed.specialist = "dermatologist";
  else if (text.includes("neuro")) parsed.specialist = "neurologist";
  else parsed.specialist = "general_physician"; // 🔥 fallback
}
    res.json(parsed);

  } catch (err) {
    console.error("GROQ ERROR 👉", err.message);

    res.status(500).json({
      message: "AI service failed ❌",
      error: err.message
    });
  }
});

module.exports = router;