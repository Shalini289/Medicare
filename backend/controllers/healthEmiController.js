const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const calculateEmi = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return Math.round(principal / months);
  }

  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
};

const getRiskLevel = (score) => {
  if (score >= 78) return "low";
  if (score >= 58) return "medium";
  return "high";
};

const getDecision = (score) => {
  if (score >= 78) return "Likely eligible";
  if (score >= 58) return "Review required";
  return "Not eligible yet";
};

const buildReasons = ({ creditScore, disposableIncome, monthlyEmiCapacity, requestedAmount, employmentType, existingEmi }) => {
  const reasons = [];

  if (creditScore >= 750) reasons.push("Strong credit score supports eligibility.");
  if (creditScore > 0 && creditScore < 650) reasons.push("Credit score is below the preferred range.");
  if (monthlyEmiCapacity >= requestedAmount * 0.08) reasons.push("Monthly income can support a healthcare EMI plan.");
  if (disposableIncome < monthlyEmiCapacity) reasons.push("Existing EMI obligations reduce repayment comfort.");
  if (existingEmi > 0) reasons.push("Current EMI commitments were included in the risk score.");
  if (employmentType === "salaried") reasons.push("Stable salaried income improves the profile.");
  if (employmentType === "student" || employmentType === "unemployed") {
    reasons.push("A co-applicant or guarantor may be needed for stronger approval chances.");
  }

  return reasons.length ? reasons : ["Eligibility is based on the entered income, expense, and treatment amount."];
};

exports.predictHealthEmi = async (req, res) => {
  const monthlyIncome = toNumber(req.body.monthlyIncome);
  const monthlyExpenses = toNumber(req.body.monthlyExpenses);
  const existingEmi = toNumber(req.body.existingEmi);
  const requestedAmount = toNumber(req.body.requestedAmount);
  const creditScore = toNumber(req.body.creditScore);
  const employmentType = String(req.body.employmentType || "self-employed").toLowerCase();

  if (monthlyIncome <= 0 || requestedAmount <= 0) {
    return res.status(400).json({
      msg: "Monthly income and treatment amount are required for EMI prediction.",
    });
  }

  const disposableIncome = Math.max(monthlyIncome - monthlyExpenses - existingEmi, 0);
  const monthlyEmiCapacity = Math.round(disposableIncome * 0.35);
  const creditScoreNormalized = creditScore ? clamp((creditScore - 300) / 600, 0, 1) : 0.55;
  const affordabilityRatio = requestedAmount > 0
    ? clamp(monthlyEmiCapacity / Math.max(requestedAmount * 0.08, 1), 0, 1)
    : 0;
  const employmentBoost = employmentType === "salaried" ? 8 : employmentType === "business" ? 5 : employmentType === "self-employed" ? 3 : -6;
  const existingEmiPenalty = clamp(existingEmi / Math.max(monthlyIncome, 1), 0, 0.5) * 30;

  const score = Math.round(clamp(
    creditScoreNormalized * 45 + affordabilityRatio * 45 + employmentBoost - existingEmiPenalty + 10,
    0,
    100
  ));

  const recommendedAmount = Math.round(Math.min(requestedAmount, monthlyEmiCapacity * 10));
  const interestRate = score >= 78 ? 10.5 : score >= 58 ? 13.5 : 16.5;
  const tenures = [3, 6, 9, 12].map((months) => ({
    months,
    monthlyEmi: calculateEmi(requestedAmount, interestRate, months),
  }));

  res.json({
    score,
    riskLevel: getRiskLevel(score),
    decision: getDecision(score),
    requestedAmount,
    recommendedAmount: Math.max(recommendedAmount, 0),
    monthlyEmiCapacity,
    interestRate,
    tenures,
    reasons: buildReasons({
      creditScore,
      disposableIncome,
      monthlyEmiCapacity,
      requestedAmount,
      employmentType,
      existingEmi,
    }),
    nextSteps: [
      "Verify identity, income proof, and treatment estimate before final approval.",
      "Choose a tenure where EMI is within monthly comfort capacity.",
      "Use this as a demo prediction, not a bank approval.",
    ],
  });
};
