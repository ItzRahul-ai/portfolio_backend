const express = require('express');
const {
  getInquiries,
  updateInquiry,
  getAdminMetrics
} = require('../controllers/inquiryController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/metrics', getAdminMetrics);
router.get('/inquiries', getInquiries);
router.patch('/inquiries/:id', updateInquiry);

module.exports = router;
