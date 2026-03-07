const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { createApp } = require('./app');
const { ensureAdminUser } = require('./services/bootstrapService');

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const app = createApp();
let server;

const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminUser();

    server = app.listen(PORT, () => {
      console.log(`Backend server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start backend: ${error.message}`);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    }).catch((error) => {
      console.error(`HTTP server close error: ${error.message}`);
    });
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false).catch((error) => {
      console.error(`MongoDB close error: ${error.message}`);
    });
  }

  process.exit(0);
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.stack || reason.message : String(reason);
  console.error(`Unhandled rejection: ${message}`);
});

process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error.stack || error.message}`);
  process.exit(1);
});

startServer();
