const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.log(`Email skipped for ${to}: ${subject}\n${text}`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text
  });

  return true;
};

module.exports = sendEmail;
