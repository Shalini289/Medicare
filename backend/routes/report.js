const express = require("express");
const router = express.Router();

const {
  uploadReport,
  getReports,
  deleteReport,
  handleUploadError
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../utils/upload");

router.post("/upload", protect, upload.single("file"), handleUploadError, uploadReport);
router.get("/", protect, getReports);
router.delete("/:id", protect, deleteReport);

module.exports = router;
