const express = require("express");
const router = express.Router();

const { getThreads, getMessages, sendMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/threads", protect, getThreads);
router.get("/", protect, getMessages);
router.post("/", protect, sendMessage);

module.exports = router;
