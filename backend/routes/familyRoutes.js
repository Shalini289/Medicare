const express = require("express");
const router = express.Router();

const { addMember, getMembers } = require("../controllers/familyController");

// ✅ correct
router.get("/:ownerId", getMembers);

module.exports = router;