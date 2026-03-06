const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { ensureAdminUser } = require('./services/bootstrapService');

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS policy does not allow this origin'));
  }
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '20kb' }));
app.use(globalLimiter);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

app.get('/api/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({ status: 'ok', db: dbState });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/admin', require('./routes/admin'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 8000);

const startDatabaseWithRetry = async () => {
  while (true) {
    try {
      await connectDB();
      await ensureAdminUser();
      console.log('Database bootstrap complete');
      return;
    } catch (error) {
      console.error(`Database init failed: ${error.message}`);
      console.error(`Retrying database connection in ${DB_RETRY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, DB_RETRY_MS));
    }
  }
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startDatabaseWithRetry();
});
