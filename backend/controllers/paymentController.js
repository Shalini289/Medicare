const crypto = require("crypto");
const createRazorpayClient = require("../config/razorpay");

const createPaymentOrder = async (req, res) => {
  const amount = Number(req.body.amount || 0);

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Valid amount is required" });
  }

  const razorpay = createRazorpayClient();

  if (!razorpay) {
    return res.json({
      id: `mock_order_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "INR",
      status: "created",
      mock: true,
    });
  }

  let order;

  try {
    order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `medicare_${Date.now()}`,
    });
  } catch (err) {
    console.error(`Razorpay order failed: ${err.error?.description || err.message}`);

    return res.json({
      id: `mock_order_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "INR",
      status: "created",
      mock: true,
      warning: "Payment provider unavailable. Created a demo payment order.",
    });
  }

  res.json(order);
};

const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!process.env.RAZORPAY_SECRET || req.body.mock) {
    return res.json({ verified: true, paymentId: razorpay_payment_id || "mock_payment" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ msg: "Payment verification failed" });
  }

  res.json({ verified: true, paymentId: razorpay_payment_id });
};

module.exports = { createPaymentOrder, verifyPayment };
