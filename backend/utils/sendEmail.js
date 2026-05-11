const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.log(`Email skipped for ${to}: ${subject}\n${text}`);
    return false;
  }

  try {
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
  } catch (err) {
    console.error(`Email failed for ${to}: ${err.message}`);
    console.log(`Development fallback email for ${to}: ${subject}\n${text}`);
    return false;
  }
};

module.exports = sendEmail;
