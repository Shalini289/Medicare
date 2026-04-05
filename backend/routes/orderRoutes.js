const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

// place order
router.post("/", async (req, res) => {
  const { userId, items } = req.body;

  let total = 0;

  for (let item of items) {
    const med = await Medicine.findById(item.medicineId);

    if (!med || med.stock < item.quantity) {
      return res.status(400).json({ message: "Out of stock" });
    }

    total += med.price * item.quantity;

    // reduce stock
    med.stock -= item.quantity;
    await med.save();
  }

  const order = await Order.create({
    userId,
    items,
    totalAmount: total
  });

  res.json({ success: true, data: order });
});

// track order
router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.medicineId");
  res.json({ success: true, data: order });
});

module.exports = router;