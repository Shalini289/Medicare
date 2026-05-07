const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  schedule: { type: String, default: "Daily", trim: true },
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { _id: true });

const carePlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ["Recovery", "Fitness", "Diabetes", "Heart", "Mental Health", "General"],
    default: "General",
  },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  status: {
    type: String,
    enum: ["active", "completed", "paused"],
    default: "active",
  },
  tasks: [taskSchema],
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

carePlanSchema.index({ user: 1, status: 1, startDate: -1 });

module.exports =
  mongoose.models.CarePlan ||
  mongoose.model("CarePlan", carePlanSchema);
