const Report = require("../models/Report");
const extractText = require("../utils/extractText");
const analyzeWithAI = require("../utils/aiAnalyzer");
const fs = require("fs/promises");

const uploadReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "Report file is required" });
  }

  const filePath = req.file.path;
  let extractedText = "";
  let analysis = "";

  try {
    extractedText = await extractText(filePath);
  } catch (err) {
    extractedText = "";
    analysis = `Text extraction failed: ${err.message}`;
  }

  if (!analysis) {
    try {
      analysis = extractedText?.trim()
        ? await analyzeWithAI(extractedText)
        : "No readable text was extracted from this report. The file was saved for manual review.";
    } catch (err) {
      analysis = `AI analysis failed: ${err.message}. Extracted text was saved for manual review.`;
    }
  }

  const report = await Report.create({
    user: req.user.id,
    file: filePath,
    extractedText,
    analysis
  });

  res.json(report);
};

const handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ msg: "Report file must be 8MB or smaller" });
  }

  res.status(400).json({ msg: err.message || "Report upload failed" });
};

const getReports = async (req, res) => {
  const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(reports);
};

const deleteReport = async (req, res) => {
  const report = await Report.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!report) {
    return res.status(404).json({ msg: "Report not found" });
  }

  if (report.file) {
    await fs.unlink(report.file).catch(() => {});
  }

  res.json({ msg: "Report deleted" });
};

module.exports = { uploadReport, getReports, deleteReport, handleUploadError };
