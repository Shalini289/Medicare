const express = require("express");
const {
  deleteStoredReport,
  getStoredReports,
  handleStoredReportUploadError,
  uploadStoredReport,
} = require("../controllers/storedReportController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../utils/upload");

const router = express.Router();

router.use(protect);

router.get("/", getStoredReports);
router.post("/", upload.single("file"), handleStoredReportUploadError, uploadStoredReport);
router.delete("/:id", deleteStoredReport);

module.exports = router;
