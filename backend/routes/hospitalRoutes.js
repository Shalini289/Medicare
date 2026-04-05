const express = require("express");
const router = express.Router();

const {
  getHospitals,
  updateBeds
} = require("../controllers/hospitalController");

router.get("/", getHospitals);
router.put("/:id", updateBeds);

module.exports = router;