const express = require("express");
const router = express.Router();

const Doctor = require("../models/Doctor");

// GET doctors by specialization
router.get("/:specialization", async (req, res) => {
  try {
    const doctors = await Doctor.find({
      specialization: req.params.specialization
    });

    res.json(doctors);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;