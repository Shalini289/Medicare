const express = require("express");
const {
  getCarePlans,
  createCarePlan,
  updateCarePlan,
  toggleTask,
  deleteCarePlan,
} = require("../controllers/carePlanController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getCarePlans);
router.post("/", createCarePlan);
router.put("/:id", updateCarePlan);
router.put("/:id/tasks/:taskId/toggle", toggleTask);
router.delete("/:id", deleteCarePlan);

module.exports = router;
