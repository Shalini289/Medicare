const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getFamily,
  addFamily,
  updateFamily,
  deleteFamily
} = require("../controllers/familyController");

router.use(protect);

router.get("/", getFamily);
router.post("/", addFamily);
router.put("/:id", updateFamily);
router.delete("/:id", deleteFamily);

module.exports = router;
