const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterInput = ({ name = "", email = "", password = "" }) => {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return "Name, email, and password are required";
  }

  if (cleanName.length < 2 || !/^[a-zA-Z\s.'-]+$/.test(cleanName)) {
    return "Enter a valid full name";
  }

  if (!emailPattern.test(cleanEmail)) {
    return "Enter a valid email address";
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return "Password must be 8+ characters and include uppercase, lowercase, and a number";
  }

  return "";
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const validationError = validateRegisterInput({ name, email, password });

  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  const exists = await User.findOne({ email: cleanEmail });
  if (exists) return res.status(400).json({ msg: "User exists" });

  const user = await User.create({ name: cleanName, email: cleanEmail, password });

  res.json({ token: generateToken(user), user: toSafeUser(user) });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ msg: "If an account exists, a reset link has been sent." });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  const sent = await sendEmail(
    user.email,
    "MediCare password reset",
    `Use this link to reset your password. It expires in 15 minutes:\n\n${resetUrl}`
  );

  res.json({
    msg: sent
      ? "Password reset link sent to your email."
      : "Email is not configured. Use the development reset link.",
    resetUrl: sent ? undefined : resetUrl,
  });
};

const resetPassword = async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ msg: "Reset link is invalid or expired" });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ msg: "Password reset successful" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && await user.matchPassword(password)) {
    res.json({ token: generateToken(user), user: toSafeUser(user) });
  } else {
    res.status(400).json({ msg: "Invalid credentials" });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
