const rateLimit = require('express-rate-limit');

const createLimiter = (max, message, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message }
  });

const globalLimiter = createLimiter(200, 'Too many requests. Please try again later.');
const authLimiter = createLimiter(20, 'Too many authentication attempts. Please wait and retry.');
const inquiryLimiter = createLimiter(15, 'Too many inquiry submissions. Please try again later.');

module.exports = {
  globalLimiter,
  authLimiter,
  inquiryLimiter
};
