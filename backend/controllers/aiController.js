const createGroqClient = require("../config/groq");

const fallbackConditions = [
  {
    keywords: ["fever", "cough", "throat", "cold", "runny"],
    condition: "Viral upper respiratory infection",
    care: "Rest, fluids, temperature monitoring, and medical advice if symptoms worsen.",
  },
  {
    keywords: ["headache", "migraine", "light", "nausea"],
    condition: "Headache or migraine pattern",
    care: "Hydrate, rest in a quiet room, and seek care for sudden severe pain.",
  },
  {
    keywords: ["chest", "breath", "breathing", "pain"],
    condition: "Chest or breathing concern",
    care: "This can be urgent. Seek medical care promptly, especially with breathlessness.",
  },
  {
    keywords: ["stomach", "vomit", "diarrhea", "nausea", "abdominal"],
    condition: "Gastrointestinal irritation or infection",
    care: "Hydration is important. Seek care for blood, severe pain, or dehydration.",
  },
];

const healthKeywords = [
  "ache",
  "allergy",
  "anxiety",
  "appetite",
  "asthma",
  "back",
  "bleeding",
  "blood",
  "body",
  "breath",
  "breathing",
  "burn",
  "chest",
  "cold",
  "constipation",
  "cough",
  "cramp",
  "diabetes",
  "diarrhea",
  "dizzy",
  "doctor",
  "dose",
  "ear",
  "eye",
  "fatigue",
  "fever",
  "flu",
  "head",
  "headache",
  "heart",
  "infection",
  "injury",
  "itch",
  "medicine",
  "medication",
  "migraine",
  "nausea",
  "pain",
  "pregnancy",
  "rash",
  "sick",
  "skin",
  "sleep",
  "sore",
  "stomach",
  "swelling",
  "symptom",
  "temperature",
  "throat",
  "tired",
  "urine",
  "vomit",
  "weak",
];

const nonHealthKeywords = [
  "code",
  "cricket",
  "finance",
  "game",
  "homework",
  "javascript",
  "movie",
  "politics",
  "python",
  "recipe",
  "salary",
  "stock",
  "travel",
  "weather",
];

const isHealthRelated = (text = "") => {
  const normalized = text.toLowerCase();
  const hasHealthKeyword = healthKeywords.some((keyword) => normalized.includes(keyword));
  const hasNonHealthKeyword = nonHealthKeywords.some((keyword) => normalized.includes(keyword));

  if (hasHealthKeyword) return true;
  if (hasNonHealthKeyword) return false;

  return /\b(bp|b\.p\.|spo2|sugar|pulse|tablet|capsule|mg|ml|bpm|cbc|lft|rbc|wbc|hba1c)\b/i.test(text);
};

const buildFallback = (text) => {
  const normalized = text.toLowerCase();
  const matches = fallbackConditions.filter((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );

  const conditions = matches.length
    ? matches.map((item) => item.condition)
    : ["General symptom review recommended"];

  return {
    conditions,
    urgency: normalized.includes("chest") || normalized.includes("breath") ? "high" : "routine",
    advice: matches.map((item) => item.care),
    nextSteps: [
      "Track temperature, pain level, and symptom changes.",
      "Consult a doctor for persistent, severe, or unusual symptoms.",
      "Seek emergency care for chest pain, severe breathlessness, fainting, or confusion.",
    ],
  };
};

const parseAIResponse = (content, symptoms) => {
  try {
    return JSON.parse(content);
  } catch {
    const fallback = buildFallback(symptoms);
    return {
      ...fallback,
      summary: content,
    };
  }
};

const symptomCheck = async (req, res) => {
  const symptoms = req.body.symptoms || req.body.text || "";

  if (!symptoms.trim()) {
    return res.status(400).json({ msg: "Symptoms are required" });
  }

  if (!isHealthRelated(symptoms)) {
    return res.status(400).json({
      msg: "Please ask only health, symptom, medicine, or care-related questions.",
    });
  }

  const groq = createGroqClient();

  if (!groq) {
    return res.json(buildFallback(symptoms));
  }

  try {
    const ai = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content:
            "You are a healthcare symptom checker. Answer only health, symptom, medicine, and care-related requests. If the request is unrelated to health, return valid JSON with empty conditions and advice arrays, urgency 'not_applicable', nextSteps containing one instruction to ask a health-related question, and summary saying you can only help with health-related questions. Return only valid JSON with keys: conditions array, urgency string, advice array, nextSteps array, summary string. Do not diagnose definitively.",
        },
        { role: "user", content: symptoms },
      ],
    });

    res.json(parseAIResponse(ai.choices[0].message.content, symptoms));
  } catch {
    res.json(buildFallback(symptoms));
  }
};

module.exports = { symptomCheck };
