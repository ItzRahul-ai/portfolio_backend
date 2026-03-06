const express = require('express');
const { createInquiry, getUserInquiries } = require('../controllers/inquiryController');
const { optionalAuth, protect } = require('../middleware/auth');
const { inquiryLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/', inquiryLimiter, optionalAuth, createInquiry);
router.get('/my', protect, getUserInquiries);

module.exports = router;
