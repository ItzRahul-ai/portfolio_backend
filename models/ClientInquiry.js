const mongoose = require('mongoose');

const allowedStatuses = ['Pending', 'In Progress', 'Completed'];

const progressUpdateSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const clientInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100
    },
    projectType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    budget: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    requirements: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    timeline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    status: {
      type: String,
      enum: allowedStatuses,
      default: 'Pending',
      index: true
    },
    price: {
      type: Number,
      min: 0,
      default: 0
    },
    projectDetails: {
      type: String,
      trim: true,
      default: ''
    },
    projectLinks: {
      type: [String],
      default: []
    },
    progressUpdates: {
      type: [progressUpdateSchema],
      default: []
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

clientInquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ClientInquiry', clientInquirySchema);
module.exports.allowedStatuses = allowedStatuses;
