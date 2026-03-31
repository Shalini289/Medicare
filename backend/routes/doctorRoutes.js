const express = require("express");
const router = express.Router();

const Doctor = require("../models/Doctor");

// GET doctors by specialization
router.get("/:specialization", async (req, res) => {
  try {
    const spec = req.params.specialization
      .replace(/_/g, " "); // general_physician → general physician

    const doctors = await Doctor.find({
      specialization: {
        $regex: `^${spec}$`,
        $options: "i" // case-insensitive
      }
    });

    console.log("SEARCHING FOR 👉", spec);
    console.log("FOUND DOCTORS 👉", doctors);

    res.json(doctors);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;