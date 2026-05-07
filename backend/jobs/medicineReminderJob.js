const cron = require("node-cron");
const MedicineLog = require("../models/MedicineLog");
const sendSMS = require("../utils/sendSMS");

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const startMedicineReminder = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Medicine reminder job");

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const startOfMinute = new Date(now);
    startOfMinute.setSeconds(0, 0);
    const { start, end } = getTodayRange();

    const reminders = await MedicineLog.find({
      active: true,
      time: currentTime,
      startDate: { $lte: now },
      $and: [
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: start } },
          ],
        },
        {
          $or: [
            { lastReminderSentAt: { $exists: false } },
            { lastReminderSentAt: null },
            { lastReminderSentAt: { $lt: startOfMinute } },
          ],
        },
        {
          $or: [
            { lastTakenAt: { $exists: false } },
            { lastTakenAt: null },
            { lastTakenAt: { $lt: start } },
            { frequency: "as-needed" },
          ],
        },
      ],
    }).populate("user");

    for (const reminder of reminders) {
      if (reminder.user?.phone) {
        await sendSMS(
          reminder.user.phone,
          `Reminder: Take your ${reminder.medicine}${reminder.dosage ? ` (${reminder.dosage})` : ""}.`
        );
      }

      reminder.lastReminderSentAt = now;
      await reminder.save();
    }
  });
};

module.exports = startMedicineReminder;
