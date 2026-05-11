const nodemailer = require("nodemailer");

const getMailConfig = () => {
  const emailUser = process.env.EMAIL?.trim() || process.env.SMTP_USER?.trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").replace(/\s/g, "");

  if (!emailUser || !emailPass) {
    return null;
  }

  if (process.env.SMTP_HOST) {
    return {
      from: process.env.EMAIL_FROM?.trim() || emailUser,
      transport: {
        host: process.env.SMTP_HOST.trim(),
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      },
    };
  }

  return {
    from: process.env.EMAIL_FROM?.trim() || `MediCare <${emailUser}>`,
    transport: {
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    },
  };
};

const sendEmail = async (to, subject, text) => {
  const config = getMailConfig();

  if (!config) {
    console.log(`Email skipped for ${to}: ${subject}\n${text}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport(config.transport);

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text
    });

    return true;
  } catch (err) {
    console.error(`Email failed for ${to}: ${err.code || "MAIL_ERROR"} ${err.message}`);
    console.log(`Development fallback email for ${to}: ${subject}\n${text}`);
    return false;
  }
};

module.exports = sendEmail;
