const Medicine = require("../models/Medicine");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const demoMedicines = require("../data/medicines");

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return "unknown";

  const today = new Date();
  const expires = new Date(expiryDate);
  const days = Math.ceil((expires - today) / (1000 * 60 * 60 * 24));

  if (days < 0) return "expired";
  if (days <= 30) return "expiring-soon";
  return "safe";
};

const enrichMedicine = (medicine) => {
  const item = medicine.toObject ? medicine.toObject() : medicine;
  const stock = Number(item.stock || 0);
  const reorderLevel = Number(item.reorderLevel || 0);

  return {
    ...item,
    stockStatus: stock <= 0 ? "out" : stock <= reorderLevel ? "low" : "available",
    expiryStatus: getExpiryStatus(item.expiryDate),
  };
};

const seedDemoMedicinesIfEmpty = async () => {
  const count = await Medicine.countDocuments();

  if (count > 0) {
    return;
  }

  await Medicine.bulkWrite(
    demoMedicines.map((medicine) => ({
      updateOne: {
        filter: {
          barcode: medicine.barcode,
        },
        update: {
          $set: medicine,
        },
        upsert: true,
      },
    }))
  );
};

const getMedicines = async (req, res) => {
  await seedDemoMedicinesIfEmpty();

  const medicines = await Medicine.find().sort({ name: 1 });
  res.json(medicines.map(enrichMedicine));
};

const getPharmacyAlerts = async (req, res) => {
  await seedDemoMedicinesIfEmpty();

  const medicines = await Medicine.find().sort({ expiryDate: 1, stock: 1 });
  const enriched = medicines.map(enrichMedicine);

  res.json({
    lowStock: enriched.filter((item) => item.stockStatus === "low" || item.stockStatus === "out"),
    expiringSoon: enriched.filter((item) => ["expired", "expiring-soon"].includes(item.expiryStatus)),
  });
};

const getMedicineByBarcode = async (req, res) => {
  const medicine = await Medicine.findOne({ barcode: req.params.barcode });

  if (!medicine) {
    return res.status(404).json({ msg: "Medicine not found for this barcode" });
  }

  res.json(enrichMedicine(medicine));
};

const cleanMedicineInput = (body) => ({
  name: body.name?.trim(),
  price: Number(body.price || 0),
  stock: Number(body.stock || 0),
  category: body.category?.trim() || "",
  supplier: body.supplier?.trim() || "",
  reorderLevel: Number(body.reorderLevel || 10),
  barcode: body.barcode?.trim() || "",
  batchNumber: body.batchNumber?.trim() || "",
  expiryDate: body.expiryDate || undefined,
  description: body.description?.trim() || "",
  image: body.image?.trim() || "",
});

const createMedicine = async (req, res) => {
  const payload = cleanMedicineInput(req.body);

  if (!payload.name) {
    return res.status(400).json({ msg: "Medicine name is required" });
  }

  if (payload.price < 0 || payload.stock < 0 || payload.reorderLevel < 0) {
    return res.status(400).json({ msg: "Price, stock, and reorder level cannot be negative" });
  }

  if (payload.barcode) {
    const exists = await Medicine.findOne({ barcode: payload.barcode });
    if (exists) return res.status(400).json({ msg: "Barcode already exists" });
  }

  const medicine = await Medicine.create({
    ...payload,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  });

  res.status(201).json(enrichMedicine(medicine));
};

const updateMedicine = async (req, res) => {
  const payload = cleanMedicineInput(req.body);

  if (!payload.name) {
    return res.status(400).json({ msg: "Medicine name is required" });
  }

  if (payload.price < 0 || payload.stock < 0 || payload.reorderLevel < 0) {
    return res.status(400).json({ msg: "Price, stock, and reorder level cannot be negative" });
  }

  if (payload.barcode) {
    const exists = await Medicine.findOne({
      barcode: payload.barcode,
      _id: { $ne: req.params.id },
    });
    if (exists) return res.status(400).json({ msg: "Barcode already exists" });
  }

  const medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    { ...payload, updatedBy: req.user.id },
    { new: true, runValidators: true }
  );

  if (!medicine) {
    return res.status(404).json({ msg: "Medicine not found" });
  }

  res.json(enrichMedicine(medicine));
};

const deleteMedicine = async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);

  if (!medicine) {
    return res.status(404).json({ msg: "Medicine not found" });
  }

  res.json({ msg: "Medicine deleted" });
};

const placeOrder = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: "Order items are required" });
  }

  let total = 0;

  for (let item of items) {
    const med = await Medicine.findById(item.medicine);

    if (!med) {
      return res.status(404).json({ msg: "Medicine not found" });
    }

    if (med.stock < item.quantity) {
      return res.status(400).json({ msg: `${med.name} is out of stock` });
    }

    if (getExpiryStatus(med.expiryDate) === "expired") {
      return res.status(400).json({ msg: `${med.name} is expired and cannot be ordered` });
    }

    total += med.price * item.quantity;

    med.stock -= item.quantity;
    await med.save();

    if (med.stock <= Number(med.reorderLevel || 0)) {
      await Notification.create({
        title: "Low medicine stock",
        message: `${med.name} stock is ${med.stock}. Reorder level is ${med.reorderLevel || 0}.`,
        type: "pharmacy",
      });

      req.app.get("io")?.emit("notification", {
        title: "Low medicine stock",
        message: `${med.name} stock is ${med.stock}.`,
        type: "pharmacy",
      });
    }
  }

  const order = await Order.create({
    user: req.user.id,
    items,
    total,
    paymentId: req.body.paymentId || null
  });

  await Notification.create({
    user: req.user.id,
    title: "Order placed",
    message: `Pharmacy order placed for Rs ${total}`,
    type: "order",
  });

  res.json(order);
};

const getOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.medicine");

  res.json(orders);
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email phone")
    .populate("items.medicine")
    .sort({ createdAt: -1 });

  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const allowed = ["pending", "paid", "delivered"];

  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ msg: "Invalid order status" });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  )
    .populate("user", "name email phone")
    .populate("items.medicine");

  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  if (order.user?._id) {
    await Notification.create({
      user: order.user._id,
      title: "Pharmacy order updated",
      message: `Your pharmacy order is now ${order.status}.`,
      type: "order",
    });
  }

  res.json(order);
};

module.exports = {
  getMedicines,
  getPharmacyAlerts,
  getMedicineByBarcode,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  placeOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus,
};
