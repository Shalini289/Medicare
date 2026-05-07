const CarePlan = require("../models/CarePlan");

const getUserId = (req) => req.user.id || req.user._id;

const cleanTasks = (tasks = []) =>
  tasks
    .map((task) => ({
      title: task.title?.trim(),
      schedule: task.schedule?.trim() || "Daily",
      completed: Boolean(task.completed),
      completedAt: task.completedAt || undefined,
    }))
    .filter((task) => task.title);

const normalizePlan = (body) => ({
  title: body.title?.trim(),
  category: body.category || "General",
  startDate: body.startDate || new Date(),
  endDate: body.endDate || undefined,
  status: body.status || "active",
  tasks: cleanTasks(body.tasks),
  notes: body.notes?.trim() || "",
});

const withProgress = (plan) => {
  const object = plan.toObject ? plan.toObject() : plan;
  const totalTasks = object.tasks?.length || 0;
  const completedTasks = object.tasks?.filter((task) => task.completed).length || 0;

  return {
    ...object,
    totalTasks,
    completedTasks,
    progress: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
  };
};

exports.getCarePlans = async (req, res) => {
  const plans = await CarePlan.find({ user: getUserId(req) })
    .sort({ status: 1, startDate: -1, createdAt: -1 });

  res.json(plans.map(withProgress));
};

exports.createCarePlan = async (req, res) => {
  const data = normalizePlan(req.body);

  if (!data.title) {
    return res.status(400).json({ msg: "Plan title is required" });
  }

  if (data.tasks.length === 0) {
    return res.status(400).json({ msg: "Add at least one care task" });
  }

  const plan = await CarePlan.create({
    ...data,
    user: getUserId(req),
  });

  res.status(201).json(withProgress(plan));
};

exports.updateCarePlan = async (req, res) => {
  const data = normalizePlan(req.body);

  if (!data.title || data.tasks.length === 0) {
    return res.status(400).json({ msg: "Plan title and tasks are required" });
  }

  const plan = await CarePlan.findOneAndUpdate(
    { _id: req.params.id, user: getUserId(req) },
    data,
    { new: true, runValidators: true }
  );

  if (!plan) {
    return res.status(404).json({ msg: "Care plan not found" });
  }

  res.json(withProgress(plan));
};

exports.toggleTask = async (req, res) => {
  const plan = await CarePlan.findOne({
    _id: req.params.id,
    user: getUserId(req),
  });

  if (!plan) {
    return res.status(404).json({ msg: "Care plan not found" });
  }

  const task = plan.tasks.id(req.params.taskId);

  if (!task) {
    return res.status(404).json({ msg: "Task not found" });
  }

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : undefined;

  const totalTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter((item) => item.completed).length;
  if (totalTasks > 0 && completedTasks === totalTasks) {
    plan.status = "completed";
  } else if (plan.status === "completed") {
    plan.status = "active";
  }

  await plan.save();
  res.json(withProgress(plan));
};

exports.deleteCarePlan = async (req, res) => {
  const plan = await CarePlan.findOneAndDelete({
    _id: req.params.id,
    user: getUserId(req),
  });

  if (!plan) {
    return res.status(404).json({ msg: "Care plan not found" });
  }

  res.json({ msg: "Care plan deleted" });
};
