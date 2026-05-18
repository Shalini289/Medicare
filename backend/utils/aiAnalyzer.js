const createGroqClient = require("../config/groq");

const analyzeWithAI = async (text) => {
  const groq = createGroqClient();
  const reportText = String(text || "").slice(0, 12000);

  if (!groq) {
    return [
      "Doctor's Clinical Review: AI analysis unavailable because GROQ_API_KEY is not configured. Extracted report text was saved for clinician review.",
      "Key Abnormal Findings: Not assessed automatically.",
      "Clinical Significance: Please review the extracted report values with a qualified doctor.",
      "Recommended Next Steps: Share this report with a clinician, especially if symptoms are present or values are outside reference ranges.",
      "Red Flags: Seek urgent medical care for chest pain, severe breathlessness, fainting, confusion, severe dehydration, uncontrolled bleeding, or rapidly worsening symptoms.",
      "Disclaimer: This is an informational report summary and does not replace diagnosis or treatment by a qualified doctor.",
    ].join("\n");
  }

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          "You are a highly skilled, careful physician reviewing a medical lab report for a patient-facing healthcare app.",
          "Write in clear clinical language that a patient can understand.",
          "Do not give a definitive diagnosis. Do not prescribe medicines. Do not invent values that are not present.",
          "Identify abnormal, borderline, and clinically important findings by comparing reported values with reference ranges.",
          "Mention when correlation with symptoms, history, examination, or doctor consultation is required.",
          "Return plain text only. Use the exact section headings below, each followed by concise content:",
          "Patient Review Summary:",
          "Doctor's Clinical Review:",
          "Key Abnormal Findings:",
          "Clinical Significance:",
          "Recommended Next Steps:",
          "Red Flags:",
          "Complete Blood Count (CBC) Highlights:",
          "Widal Test:",
          "Interpretation:",
          "Liver Function Tests (SGOT(AST) and SGPT(ALT)):",
          "Malaria Parasite Smear Test:",
          "Urine Routine Examination:",
          "Chemical Examination (by Reflectance Photometric Method):",
          "Microscopic Examination (Manual by Microscopy):",
          "Disclaimer:",
          "For lab values, preserve labels, values, units, and reference ranges when available.",
        ].join(" "),
      },
      {
        role: "user",
        content: `Review this extracted medical report text:\n\n${reportText}`,
      },
    ],
  });

  return res.choices[0].message.content;
};

module.exports = analyzeWithAI;
