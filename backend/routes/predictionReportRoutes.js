const express = require("express");
const router = express.Router();

const { predictRisk } = require("../controllers/predictionReportController");

router.post("/", predictRisk);

module.exports = router;