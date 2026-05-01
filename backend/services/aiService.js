const createGroqClient = require("../config/groq");

const analyzeText = async (text) => {
  const groq = createGroqClient();

  if (!groq) {
    return "AI analysis unavailable because GROQ_API_KEY is not configured.";
  }

  const res = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: text }]
  });

  return res.choices[0].message.content;
};

module.exports = { analyzeText };
