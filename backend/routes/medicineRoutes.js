const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");

// get all medicines
router.get("/", async (req, res) => {
  try {
    console.log("🔥 API HIT /api/medicines");
    const meds = await Medicine.find();
    res.json({ success: true, data: meds });
  } catch (err) {
    console.error("❌ Error fetching medicines:", err);
      next(err);
  }
});

// add medicine (admin)
router.post("/", async (req, res) => {
  const med = await Medicine.create(req.body);
  res.json({ success: true, data: med });
});

module.exports = router;