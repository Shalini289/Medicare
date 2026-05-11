const User = require("../models/User");
const Doctor = require("../models/Doctor");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterInput = ({ name = "", email = "", password = "", role = "user", specialization = "" }) => {
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

  if (!["user", "doctor", "pharmacy"].includes(role)) {
    return "Select a valid account type";
  }

  if (role === "doctor" && !specialization.trim()) {
    return "Specialization is required for doctor accounts";
  }

  return "";
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const role = ["doctor", "pharmacy"].includes(req.body.role) ? req.body.role : "user";

  const validationError = validateRegisterInput({
    name,
    email,
    password,
    role,
    specialization: req.body.specialization,
  });

  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  const exists = await User.findOne({ email: cleanEmail });
  if (exists) return res.status(400).json({ msg: "User exists" });

  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
    password,
    phone: req.body.phone?.trim() || "",
    role,
  });

  if (role === "doctor") {
    await Doctor.create({
      user: user._id,
      name: cleanName,
      specialization: req.body.specialization.trim(),
      hospital: req.body.hospital?.trim() || "MediCare Online Clinic",
      about: req.body.about?.trim() || `${cleanName} is available for patient chat, video calls, appointments, and digital prescriptions.`,
      experience: Number(req.body.experience) || 0,
      fees: Number(req.body.fees) || 0,
      image: req.body.image || "/doctor-hero.png",
      rating: 0,
      availability: req.body.availability?.trim() || "Online consultation",
      availableToday: true,
      availabilitySchedule: [
        { day: "Monday", startTime: "09:00", endTime: "17:00", mode: "video" },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00", mode: "video" },
        { day: "Friday", startTime: "09:00", endTime: "17:00", mode: "video" },
      ],
    });
  }

  res.json({ token: generateToken(user), user: toSafeUser(user) });
};

const createTwoFactorCode = () => String(Math.floor(100000 + Math.random() * 900000));

const hashTwoFactorCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");

const issueTwoFactorChallenge = async (user) => {
  const code = createTwoFactorCode();

  user.twoFactorCodeHash = hashTwoFactorCode(code);
  user.twoFactorExpire = Date.now() + 1000 * 60 * 10;
  await user.save({ validateBeforeSave: false });

  const sent = await sendEmail(
    user.email,
    "MediCare login verification code",
    `Your MediCare verification code is ${code}. It expires in 10 minutes.`
  );

  return {
    tempToken: jwt.sign(
      { id: user._id, purpose: "2fa" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    ),
    devCode: sent ? undefined : code,
  };
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

  const user = await User.findOne({ email: email?.trim().toLowerCase() });

  if (user && await user.matchPassword(password)) {
    if (user.twoFactorEnabled) {
      const challenge = await issueTwoFactorChallenge(user);
      return res.json({
        requiresTwoFactor: true,
        tempToken: challenge.tempToken,
        devCode: challenge.devCode,
        msg: "Verification code sent",
      });
    }

    res.json({ token: generateToken(user), user: toSafeUser(user) });
  } else {
    res.status(400).json({ msg: "Invalid credentials" });
  }
};

const verifyTwoFactorLogin = async (req, res) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ msg: "Verification code is required" });
  }

  let decoded;

  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ msg: "Verification session expired" });
  }

  if (decoded.purpose !== "2fa") {
    return res.status(401).json({ msg: "Invalid verification session" });
  }

  const user = await User.findById(decoded.id);

  if (!user || !user.twoFactorCodeHash || user.twoFactorExpire < Date.now()) {
    return res.status(400).json({ msg: "Verification code expired" });
  }

  if (user.twoFactorCodeHash !== hashTwoFactorCode(code)) {
    return res.status(400).json({ msg: "Invalid verification code" });
  }

  user.twoFactorCodeHash = undefined;
  user.twoFactorExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ token: generateToken(user), user: toSafeUser(user) });
};

const getTwoFactorSettings = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ enabled: Boolean(user?.twoFactorEnabled), email: user?.email || "" });
};

const updateTwoFactorSettings = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  user.twoFactorEnabled = Boolean(req.body.enabled);
  user.twoFactorCodeHash = undefined;
  user.twoFactorExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ enabled: user.twoFactorEnabled });
};

module.exports = {
  register,
  login,
  verifyTwoFactorLogin,
  getTwoFactorSettings,
  updateTwoFactorSettings,
  forgotPassword,
  resetPassword,
};
