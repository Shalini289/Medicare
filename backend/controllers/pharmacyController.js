const Medicine = require("../models/Medicine");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

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

const getMedicines = async (req, res) => {
  const medicines = await Medicine.find().sort({ name: 1 });
  res.json(medicines.map(enrichMedicine));
};

const getPharmacyAlerts = async (req, res) => {
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

module.exports = { getMedicines, getPharmacyAlerts, getMedicineByBarcode, placeOrder, getOrders };
