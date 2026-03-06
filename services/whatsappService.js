const twilio = require('twilio');

let cachedClient = null;

const getTwilioClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  return cachedClient;
};

const sendWhatsAppMessage = async ({ to, body }) => {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    return { skipped: true, reason: 'Twilio credentials are missing' };
  }

  const client = getTwilioClient();

  await client.messages.create({
    body,
    from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
    to: `whatsapp:${to}`
  });

  return { skipped: false };
};

module.exports = { sendWhatsAppMessage };
