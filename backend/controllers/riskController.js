const Report = require("../models/Report");

const riskRules = [
  {
    match: ["diabetes", "glucose", "hba1c", "blood sugar"],
    label: "Diabetes risk",
    advice: "Review blood sugar trends and schedule regular diabetes screening.",
  },
  {
    match: ["cholesterol", "ldl", "triglyceride", "lipid"],
    label: "Cardiac risk",
    advice: "Discuss lipid management, diet, activity, and follow-up testing with a doctor.",
  },
  {
    match: ["thyroid", "tsh", "t3", "t4"],
    label: "Thyroid monitoring",
    advice: "Track thyroid markers and consult an endocrinologist if levels are abnormal.",
  },
  {
    match: ["hemoglobin", "anaemia", "anemia", "iron"],
    label: "Anaemia risk",
    advice: "Review iron, B12, and diet with a clinician if fatigue or low hemoglobin appears.",
  },
];

const predictRisk = async (req, res) => {
  const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
  const text = reports
    .map((report) => `${report.extractedText || ""} ${JSON.stringify(report.analysis || "")}`)
    .join(" ")
    .toLowerCase();

  const matches = riskRules.filter((rule) =>
    rule.match.some((keyword) => text.includes(keyword))
  );

  res.json({
    risks: matches.map((rule) => rule.label),
    advice: matches.length
      ? matches.map((rule) => rule.advice)
      : ["No report-based risks detected. Keep routine checkups up to date."],
    reportCount: reports.length,
    lastReportDate: reports[0]?.createdAt || null,
  });
};

module.exports = { predictRisk };
