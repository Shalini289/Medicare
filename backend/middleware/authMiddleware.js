const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ msg: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

const admin = (req, res, next) => {
  if (req.user.role === "admin") next();
  else res.status(403).json({ msg: "Admin only" });
};

const pharmacyStaff = (req, res, next) => {
  if (["pharmacy", "admin"].includes(req.user.role)) next();
  else res.status(403).json({ msg: "Pharmacy staff only" });
};

const pathologyOnly = (req, res, next) => {
  if (req.user.role === "pathology") next();
  else res.status(403).json({ msg: "Pathology only" });
};

const hospitalOnly = (req, res, next) => {
  if (req.user.role === "hospital") next();
  else res.status(403).json({ msg: "Hospital only" });
};

const doctorOnly = (req, res, next) => {
  if (req.user.role === "doctor") next();
  else res.status(403).json({ msg: "Doctor only" });
};

module.exports = { protect, admin, pharmacyStaff, pathologyOnly, hospitalOnly, doctorOnly };
