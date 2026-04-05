const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password" // use app password
  }
});

const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: "Doctor App",
    to,
    subject,
    text
  });
};

module.exports = sendEmail;