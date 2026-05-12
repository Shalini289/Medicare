const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(process.cwd(), "uploads");
const allowedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.has(file.mimetype)) {
    return cb(new Error("Only PDF, PNG, JPG, and JPEG reports are allowed"));
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});
