const MedicineReminder = require("../models/MedicineReminder");
const sendEmail = require("../utils/sendEmail");

const cron = require("node-cron");

// every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();

  const currentTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  const reminders = await MedicineReminder.find({
    time: currentTime,
    isActive: true
  }).populate("patientId");

  for (let rem of reminders) {
    await sendEmail(
      rem.patientId.email,
      "Medicine Reminder 💊",
      `Take your medicine: ${rem.medicineName}`
    );
  }
});