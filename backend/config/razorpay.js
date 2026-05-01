const Razorpay = require("razorpay");

const createRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
};

module.exports = createRazorpayClient;
