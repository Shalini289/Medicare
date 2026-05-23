const createGroqClient = require("../config/groq");

const DISCLAIMER =
  "This analysis is for understanding the prescription only. Do not start, stop, or change any medicine without confirming with your doctor or pharmacist.";

const emptyMedicine = {
  name: "Medicine needs confirmation",
  dosage: "Confirm from prescription",
  frequency: "Confirm from prescription",
  duration: "Confirm from prescription",
  instructions: "Ask a doctor or pharmacist to verify the prescription details.",
  purpose: "Not clearly identified",
  reminderTimes: [],
};

const stripCodeFence = (value = "") =>
  value
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

const safeJsonParse = (value) => {
  const cleaned = stripCodeFence(value);

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
};

const normalizeMedicine = (medicine = {}) => ({
  name: String(medicine.name || "").trim() || emptyMedicine.name,
  dosage: String(medicine.dosage || "").trim() || emptyMedicine.dosage,
  frequency: String(medicine.frequency || "").trim() || emptyMedicine.frequency,
  duration: String(medicine.duration || "").trim() || emptyMedicine.duration,
  instructions: String(medicine.instructions || "").trim() || emptyMedicine.instructions,
  purpose: String(medicine.purpose || "").trim() || emptyMedicine.purpose,
  reminderTimes: toStringArray(medicine.reminderTimes),
});

const normalizeAnalysis = (analysis = {}, extractedText = "") => {
  const medicines = Array.isArray(analysis.medicines)
    ? analysis.medicines.map(normalizeMedicine).filter((item) => item.name)
    : [];

  return {
    summary:
      String(analysis.summary || "").trim() ||
      "The prescription was read, but the medicine details need manual confirmation.",
    medicines: medicines.length > 0 ? medicines : [fallbackMedicine(extractedText)],
    safetyWarnings: toStringArray(analysis.safetyWarnings),
    possibleInteractions: toStringArray(analysis.possibleInteractions),
    adherenceTips: toStringArray(analysis.adherenceTips),
    nextSteps: toStringArray(analysis.nextSteps),
    disclaimer: String(analysis.disclaimer || "").trim() || DISCLAIMER,
  };
};

const fallbackMedicine = (text = "") => {
  const likelyLine = String(text)
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .find((line) => /tab|cap|syrup|inj|mg|ml|tablet|capsule/i.test(line));

  return {
    ...emptyMedicine,
    name: likelyLine || emptyMedicine.name,
  };
};

const fallbackAnalysis = (text = "") => ({
  summary:
    "AI service is not configured, so MediCare extracted the visible text and prepared a safety-first review for manual confirmation.",
  medicines: [fallbackMedicine(text)],
  safetyWarnings: [
    "Confirm medicine names, dose, timing, and duration with a doctor or pharmacist before taking anything.",
    "Share allergies, pregnancy status, kidney/liver disease, and current medicines before using this prescription.",
  ],
  possibleInteractions: [
    "Drug interaction checking needs verified medicine names and patient history. Ask a pharmacist to review the full prescription.",
  ],
  adherenceTips: [
    "Set reminders around the prescribed frequency after the dose is verified.",
    "Do not double a missed dose unless your doctor specifically instructed it.",
  ],
  nextSteps: [
    "Verify unclear handwriting or OCR mistakes.",
    "Create reminders only after the prescription is confirmed.",
    "Seek urgent care if symptoms worsen or serious side effects appear.",
  ],
  disclaimer: DISCLAIMER,
});

const analyzePrescriptionText = async (text = "") => {
  const extractedText = String(text || "").trim();

  if (!extractedText) {
    return fallbackAnalysis("");
  }

  const groq = createGroqClient();

  if (!groq) {
    return fallbackAnalysis(extractedText);
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You are a careful clinical prescription explainer. Analyze only the prescription text. Extract medicines, dosage, frequency, duration, instructions, plain-language purpose, reminder suggestions, and safety considerations. Do not diagnose, prescribe, change treatment, or claim interactions as certain without enough context. Return only valid JSON.",
      },
      {
        role: "user",
        content: `Read this prescription text and return JSON with this exact shape:
{
  "summary": "short patient-friendly summary",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dose strength",
      "frequency": "how often",
      "duration": "how long",
      "instructions": "how to take it",
      "purpose": "simple likely purpose, say confirm with doctor if unclear",
      "reminderTimes": ["morning", "night"]
    }
  ],
  "safetyWarnings": ["specific warning"],
  "possibleInteractions": ["interaction or context needing pharmacist review"],
  "adherenceTips": ["practical tip"],
  "nextSteps": ["what patient should do next"],
  "disclaimer": "${DISCLAIMER}"
}

Prescription text:
${extractedText}`,
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content || "";
  const parsed = safeJsonParse(content);

  return normalizeAnalysis(parsed || fallbackAnalysis(extractedText), extractedText);
};

module.exports = analyzePrescriptionText;
