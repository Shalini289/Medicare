const predictSpecialists = require("../utils/predictor");

exports.predict = async (req, res) => {
  try {
  

    const text = req.body.text || "";

    const symptoms = text.split(" "); // pass array

    const specialists = predictSpecialists(symptoms);

    res.json({
      specialists: specialists.slice(0, 3)
    });
console.log("TEXT 👉", text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};