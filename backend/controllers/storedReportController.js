const fs = require("fs/promises");
const path = require("path");
const StoredReport = require("../models/StoredReport");

const getUserId = (req) => req.user.id || req.user._id;

const toPublicReport = (report) => ({
  _id: report._id,
  title: report.title,
  category: report.category,
  reportDate: report.reportDate,
  originalName: report.originalName,
  mimeType: report.mimeType,
  size: report.size,
  notes: report.notes,
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
  url: `/uploads/${path.basename(report.filePath)}`,
});

exports.uploadStoredReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "PDF report file is required" });
  }

  if (req.file.mimetype !== "application/pdf") {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ msg: "Only PDF reports are allowed" });
  }

  const title = req.body.title?.trim() || req.file.originalname.replace(/\.pdf$/i, "");

  const report = await StoredReport.create({
    user: getUserId(req),
    title,
    category: req.body.category?.trim() || "General",
    reportDate: req.body.reportDate || undefined,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
    notes: req.body.notes?.trim() || "",
  });

  res.status(201).json(toPublicReport(report));
};

exports.getStoredReports = async (req, res) => {
  const reports = await StoredReport.find({ user: getUserId(req) })
    .sort({ reportDate: -1, createdAt: -1 });

  res.json(reports.map(toPublicReport));
};

exports.deleteStoredReport = async (req, res) => {
  const report = await StoredReport.findOneAndDelete({
    _id: req.params.id,
    user: getUserId(req),
  });

  if (!report) {
    return res.status(404).json({ msg: "Report not found" });
  }

  await fs.unlink(report.filePath).catch(() => {});

  res.json({ msg: "Report deleted" });
};

exports.handleStoredReportUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ msg: "Report PDF must be 8MB or smaller" });
  }

  res.status(400).json({ msg: err.message || "Report upload failed" });
};
