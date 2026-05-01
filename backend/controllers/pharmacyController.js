const Medicine = require("../models/Medicine");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

const getMedicines = async (req, res) => {
  res.json(await Medicine.find());
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

    total += med.price * item.quantity;

    med.stock -= item.quantity;
    await med.save();
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

module.exports = { getMedicines, placeOrder, getOrders };
