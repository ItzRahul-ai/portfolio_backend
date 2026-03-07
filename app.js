const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const inquiryRoutes = require('./routes/inquiries');
const { createCorsOptions } = require('./config/cors');
const { globalLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const DB_STATE = Object.freeze({
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
});

const createHealthPayload = () => ({
  status: 'ok',
  service: 'portfolio-backend',
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
  uptimeSeconds: Math.floor(process.uptime()),
  db: DB_STATE[mongoose.connection.readyState] || 'unknown'
});

const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(globalLimiter);

  app.get('/', (_req, res) => {
    res.status(200).json({
      message: 'Portfolio backend API is running',
      health: '/api/health'
    });
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json(createHealthPayload());
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/inquiries', inquiryRoutes);

  // Backward-compatible aliases for older clients.
  app.use('/api/enquiry', inquiryRoutes);
  app.use('/api/enquiries', inquiryRoutes);

  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
