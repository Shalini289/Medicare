const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access only"
      });
    }

    next();

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = adminMiddleware;