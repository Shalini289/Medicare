const express = require("express");
const {
  getVitals,
  createVital,
  updateVital,
  deleteVital,
} = require("../controllers/vitalController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getVitals);
router.post("/", createVital);
router.put("/:id", updateVital);
router.delete("/:id", deleteVital);

module.exports = router;
