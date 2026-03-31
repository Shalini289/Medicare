const express = require("express");
const router = express.Router();

const predictSpecialists = require("../utils/predictor");

router.post("/", (req, res) => {
  try {
    const text = req.body.text || "";

    const symptoms = text.split(" ");

    const specialists = predictSpecialists(symptoms);

    res.json({
      specialists
    });

  } catch (err) {
    console.log("ERROR 👉", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;