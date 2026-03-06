const mongoose = require('mongoose');
const ClientInquiry = require('../models/ClientInquiry');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { validateInquiryInput, validateInquiryUpdateInput } = require('../validators/inquiryValidator');

const formatInquiryResponse = (inquiry) => ({
  id: inquiry._id,
  name: inquiry.name,
  phone: inquiry.phone,
  email: inquiry.email,
  projectType: inquiry.projectType,
  budget: inquiry.budget,
  requirements: inquiry.requirements,
  timeline: inquiry.timeline,
  status: inquiry.status,
  price: inquiry.price,
  projectDetails: inquiry.projectDetails,
  projectLinks: inquiry.projectLinks,
  progressUpdates: inquiry.progressUpdates,
  createdAt: inquiry.createdAt,
  updatedAt: inquiry.updatedAt
});

const sendInquiryNotifications = async (inquiry) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const adminPhone = process.env.ADMIN_PHONE || '+918100192586';

  const clientEmailPromise = sendEmail({
    to: inquiry.email,
    subject: 'Inquiry Received - dipCoder',
    text: `Hi ${inquiry.name}, your inquiry for ${inquiry.projectType} was received. We will contact you shortly.`
  });

  const adminEmailPromise = sendEmail({
    to: adminEmail,
    subject: 'New Client Inquiry Received',
    text: `New inquiry from ${inquiry.name} (${inquiry.email}, ${inquiry.phone}). Project: ${inquiry.projectType}, Budget: ${inquiry.budget}, Timeline: ${inquiry.timeline}.`
  });

  const adminWhatsAppPromise = sendWhatsAppMessage({
    to: adminPhone,
    body: `New dipCoder inquiry from ${inquiry.name}. Project: ${inquiry.projectType}. Budget: ${inquiry.budget}.`
  });

  await Promise.allSettled([clientEmailPromise, adminEmailPromise, adminWhatsAppPromise]);
};

const createInquiry = async (req, res) => {
  const { errors, data } = validateInquiryInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  let clientId = req.user?._id || null;

  if (!clientId) {
    const linkedUser = await User.findOne({ email: data.email });
    if (linkedUser) {
      clientId = linkedUser._id;
    }
  }

  const inquiry = await ClientInquiry.create({
    ...data,
    clientId
  });

  await sendInquiryNotifications(inquiry);

  return res.status(201).json({
    message: 'Inquiry submitted successfully',
    inquiry: formatInquiryResponse(inquiry)
  });
};

const getUserInquiries = async (req, res) => {
  const inquiries = await ClientInquiry.find({
    $or: [{ clientId: req.user._id }, { email: req.user.email.toLowerCase() }]
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    inquiries: inquiries.map(formatInquiryResponse)
  });
};

const getInquiries = async (req, res) => {
  const { status, search } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { projectType: { $regex: search, $options: 'i' } }
    ];
  }

  const inquiries = await ClientInquiry.find(query).sort({ createdAt: -1 });

  return res.status(200).json({
    count: inquiries.length,
    inquiries: inquiries.map(formatInquiryResponse)
  });
};

const updateInquiry = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid inquiry id' });
  }

  const { errors, data } = validateInquiryUpdateInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const inquiry = await ClientInquiry.findById(req.params.id);
  if (!inquiry) {
    return res.status(404).json({ message: 'Inquiry not found' });
  }

  if (data.status) inquiry.status = data.status;
  if (data.price !== undefined) inquiry.price = data.price;
  if (data.projectDetails !== undefined) inquiry.projectDetails = data.projectDetails;
  if (data.projectLinks) inquiry.projectLinks = data.projectLinks;
  if (data.progressMessage) {
    inquiry.progressUpdates.push({ message: data.progressMessage });
  }

  inquiry.updatedBy = req.user._id;

  const updatedInquiry = await inquiry.save();

  return res.status(200).json({
    message: 'Inquiry updated successfully',
    inquiry: formatInquiryResponse(updatedInquiry)
  });
};

const getAdminMetrics = async (_req, res) => {
  const [totalClients, completedProjects, pendingProjects, revenueResult] = await Promise.all([
    ClientInquiry.countDocuments(),
    ClientInquiry.countDocuments({ status: 'Completed' }),
    ClientInquiry.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
    ClientInquiry.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$price' } } }])
  ]);

  const totalRevenue = revenueResult?.[0]?.totalRevenue || 0;

  return res.status(200).json({
    totalClients,
    completedProjects,
    pendingProjects,
    totalRevenue
  });
};

module.exports = {
  createInquiry,
  getInquiries,
  getUserInquiries,
  updateInquiry,
  getAdminMetrics
};
