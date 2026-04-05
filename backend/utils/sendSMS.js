const twilio = require("twilio");

const client = twilio("ACCOUNT_SID", "AUTH_TOKEN");

const sendSMS = async (to, message) => {
  await client.messages.create({
    body: message,
    from: "+1234567890",
    to
  });
};

module.exports = sendSMS;