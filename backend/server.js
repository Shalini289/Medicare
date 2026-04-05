require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();


// 🔥 CORS FIX
const allowedOrigins = [
  "http://localhost:3000",
  "https://doctor-appointment-pearl-six.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.use(express.json());


// 🔥 START CRON JOBS (IMPORTANT)
require("./cron/reminderJob");


// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const availableRoutes = require("./routes/availableRoutes");
const medicalRoutes = require("./routes/medicalRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const predictionReportRoutes = require("./routes/predictionReportRoutes");
const familyRoutes = require("./routes/familyRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");


// 🔥 Route mounting
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/family", familyRoutes);

// ⚠️ FIX: separate routes properly
app.use("/api/predict", predictionRoutes);
app.use("/api/predict-report", predictionReportRoutes);



app.use("/api/doctors/available", availableRoutes);
app.use("/api/medical", medicalRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);


// 🔥 STATIC FILE FIX
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});


// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));


// 🔥 IMPROVED ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong"
  });
});


// ✅ START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});