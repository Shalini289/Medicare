const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyTwoFactorLogin,
  getTwoFactorSettings,
  updateTwoFactorSettings,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.post("/2fa/verify", verifyTwoFactorLogin);
router.get("/2fa/settings", protect, getTwoFactorSettings);
router.put("/2fa/settings", protect, updateTwoFactorSettings);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
