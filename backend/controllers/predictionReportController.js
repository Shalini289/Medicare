const predictRisk = async (req, res) => {
  try {
    const {
      age,
      bmi,
      bloodSugar,
      cholesterol,
      bloodPressure,
      smoking,
      exercise
    } = req.body;

    let diabetesRisk = 0;
    let heartRisk = 0;

    // 🩸 Diabetes logic
    if (bloodSugar > 140) diabetesRisk += 2;
    if (bmi > 25) diabetesRisk += 1;
    if (age > 40) diabetesRisk += 1;

    // ❤️ Heart logic
    if (cholesterol > 200) heartRisk += 2;
    if (bloodPressure > 130) heartRisk += 2;
    if (smoking) heartRisk += 2;
    if (!exercise) heartRisk += 1;

    // Convert to levels
    const getLevel = (score) => {
      if (score <= 1) return "Low";
      if (score <= 3) return "Medium";
      return "High";
    };

    res.json({
      success: true,
      data: {
        diabetesRisk: getLevel(diabetesRisk),
        heartRisk: getLevel(heartRisk)
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { predictRisk };