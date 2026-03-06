const { sendWhatsAppMessage } = require('../services/whatsappService');

module.exports = async (to, body) => sendWhatsAppMessage({ to, body });
