const { sendEmail } = require('../services/emailService');

module.exports = async (options) => sendEmail(options);
