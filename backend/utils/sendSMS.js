const twilio = require("twilio");

const isConfigured = Boolean(
  process.env.TWILIO_SID &&
  process.env.TWILIO_AUTH &&
  process.env.TWILIO_PHONE
);

const client = isConfigured
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
  : null;

const sendSMS = async (to, msg) => {
  if (!client) {
    console.log(`SMS skipped: ${msg}`);
    return;
  }

  await client.messages.create({
    body: msg,
    from: process.env.TWILIO_PHONE,
    to
  });
};

module.exports = sendSMS;
