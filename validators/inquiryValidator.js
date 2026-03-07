const ClientInquiry = require('../models/ClientInquiry');

const allowedStatuses = ClientInquiry.allowedStatuses || ['Pending', 'In Progress', 'Completed'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;

const clean = (value) => String(value || '').trim();

const ensureArrayOfStrings = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => clean(item))
    .filter(Boolean)
    .slice(0, 10);
};

const validateInquiryInput = (payload = {}) => {
  const fallbackMessage = clean(payload.message);
  const isSimpleInquiry =
    !clean(payload.phone) &&
    !clean(payload.projectType) &&
    !clean(payload.budget) &&
    !clean(payload.requirements) &&
    !clean(payload.timeline);

  const data = {
    name: clean(payload.name),
    phone: clean(payload.phone || '0000000000'),
    email: clean(payload.email).toLowerCase(),
    projectType: clean(payload.projectType || 'General Inquiry'),
    budget: clean(payload.budget || 'Not specified'),
    requirements: clean(payload.requirements || fallbackMessage),
    timeline: clean(payload.timeline || 'Not specified')
  };

  const errors = [];

  if (data.name.length < 2) errors.push('Name is required');
  if (!emailPattern.test(data.email)) errors.push('Valid email is required');

  if (isSimpleInquiry) {
    if (data.requirements.length < 5) {
      errors.push('Message is required');
    }
  } else {
    if (!phonePattern.test(data.phone)) errors.push('Valid phone number is required');
    if (data.projectType.length < 2) errors.push('Project type is required');
    if (data.budget.length < 1) errors.push('Budget is required');
    if (data.requirements.length < 10) errors.push('Website requirements should be at least 10 characters');
    if (data.timeline.length < 2) errors.push('Timeline is required');
  }

  return { errors, data };
};

const validateInquiryUpdateInput = (payload = {}) => {
  const data = {};
  const errors = [];

  if (payload.status !== undefined) {
    const status = clean(payload.status);
    if (!allowedStatuses.includes(status)) {
      errors.push(`Status must be one of: ${allowedStatuses.join(', ')}`);
    } else {
      data.status = status;
    }
  }

  if (payload.price !== undefined) {
    const price = Number(payload.price);
    if (!Number.isFinite(price) || price < 0) {
      errors.push('Price must be a positive number');
    } else {
      data.price = price;
    }
  }

  if (payload.projectDetails !== undefined) {
    data.projectDetails = clean(payload.projectDetails);
  }

  if (payload.projectLinks !== undefined) {
    data.projectLinks = ensureArrayOfStrings(payload.projectLinks);
  }

  if (payload.progressMessage !== undefined) {
    const progressMessage = clean(payload.progressMessage);
    if (progressMessage.length < 3) {
      errors.push('Progress update must be at least 3 characters');
    } else {
      data.progressMessage = progressMessage;
    }
  }

  if (!Object.keys(data).length) {
    errors.push('At least one field must be provided to update the inquiry');
  }

  return { errors, data };
};

module.exports = {
  allowedStatuses,
  validateInquiryInput,
  validateInquiryUpdateInput
};
