const nodemailer = require("nodemailer");

const getFromAddress = () =>
  process.env.EMAIL_FROM?.trim() ||
  process.env.RESEND_FROM?.trim() ||
  process.env.SENDGRID_FROM?.trim() ||
  process.env.EMAIL?.trim() ||
  "MediCare <onboarding@resend.dev>";

const sendWithResend = async ({ to, subject, text }) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) return null;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend email failed (${response.status}): ${body || response.statusText}`);
  }

  return true;
};

const sendWithSendGrid = async ({ to, subject, text }) => {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();

  if (!apiKey) return null;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: getFromAddress().replace(/^.*<(.+)>$/, "$1") },
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`SendGrid email failed (${response.status}): ${body || response.statusText}`);
  }

  return true;
};

const getMailConfig = () => {
  const emailUser = process.env.EMAIL?.trim() || process.env.SMTP_USER?.trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").replace(/\s/g, "");

  if (!emailUser || !emailPass) {
    return null;
  }

  if (process.env.SMTP_HOST) {
    return {
      from: getFromAddress() || emailUser,
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
    from: getFromAddress() || `MediCare <${emailUser}>`,
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
  const payload = { to, subject, text };

  try {
    const apiSent = await sendWithResend(payload) || await sendWithSendGrid(payload);

    if (apiSent) return true;
  } catch (err) {
    console.error(`API email failed for ${to}: ${err.message}`);
    return false;
  }

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
