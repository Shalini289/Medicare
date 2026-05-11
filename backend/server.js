require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

// 🔧 CONFIG
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");

// 🔐 MIDDLEWARE
const errorHandler = require("./middleware/errorMiddleware");
const rateLimiter = require("./middleware/rateLimiter");
const logger = require("./middleware/loggerMiddleware");

// ⏰ JOBS
const startReminderJob = require("./jobs/reminderJob");
const startMedicineReminder = require("./jobs/medicineReminderJob");
const startCleanupJob = require("./jobs/cleanupJob");

// 🚀 APP INIT
const app = express();
const server = http.createServer(app);

// 📡 SOCKET
initSocket(server);
app.set("io", require("./config/socket").getIO());

// 🗄️ DB
connectDB();

// 🌐 GLOBAL MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimiter);

// 📂 STATIC (uploads)
app.use("/uploads", express.static("uploads"));

// 🔗 ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/doctor-portal", require("./routes/doctorPortal"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/pharmacy", require("./routes/pharmacy"));
app.use("/api/blood-donors", require("./routes/bloodDonors"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/report", require("./routes/report"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/risk", require("./routes/risk"));
app.use("/api/review", require("./routes/review"));
app.use("/api/family", require("./routes/family"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/hospital", require("./routes/hospital"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/medicine-reminders", require("./routes/medicineReminders"));
app.use("/api/prescriptions", require("./routes/prescriptions"));
app.use("/api/vitals", require("./routes/vitals"));
app.use("/api/medical-profile", require("./routes/medicalProfile"));
app.use("/api/lab-tests", require("./routes/labTests"));
app.use("/api/care-plans", require("./routes/carePlans"));
app.use("/api/vaccinations", require("./routes/vaccinations"));

// 🧪 TEST ROUTE
app.get("/", (req, res) => {
  res.send("🚀 API Running...");
});

// ❌ ERROR HANDLER
app.use(errorHandler);

// ⏰ START JOBS
startReminderJob();
startMedicineReminder();
startCleanupJob();

// 🚀 SERVER START
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
