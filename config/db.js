const dns = require('dns');
const mongoose = require('mongoose');

const maskMongoUri = (uri) => uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

const configureDnsForAtlas = () => {
  const uri = process.env.MONGO_URI || '';
  if (!uri.startsWith('mongodb+srv://')) {
    return;
  }

  const configuredServers = (process.env.MONGO_DNS_SERVERS || '1.1.1.1,8.8.8.8')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (!configuredServers.length) {
    return;
  }

  try {
    dns.setServers(configuredServers);
    console.log(`MongoDB DNS servers: ${configuredServers.join(', ')}`);
  } catch (error) {
    console.warn(`Could not apply custom DNS servers: ${error.message}`);
  }
};

const buildConnectionCandidates = () => {
  const candidates = [process.env.MONGO_URI, process.env.MONGO_URI_FALLBACK]
    .map((uri) => String(uri || '').trim())
    .filter(Boolean);

  const unique = Array.from(new Set(candidates));
  if (!unique.length) {
    throw new Error('MONGO_URI is missing. Please set it in backend/.env');
  }

  return unique;
};

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  configureDnsForAtlas();

  const uris = buildConnectionCandidates();
  let lastError = null;

  for (const uri of uris) {
    try {
      await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000
      });

      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      lastError = error;
      await mongoose.disconnect().catch(() => {});
      console.error(`MongoDB connection failed for ${maskMongoUri(uri)} -> ${error.message}`);
    }
  }

  if (lastError && /querySrv ECONNREFUSED/i.test(lastError.message)) {
    throw new Error(
      'MongoDB SRV DNS lookup failed (querySrv ECONNREFUSED). ' +
        'Set MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8 or provide MONGO_URI_FALLBACK with a non-SRV Atlas URI.'
    );
  }

  throw new Error(lastError?.message || 'MongoDB connection failed');
};

module.exports = connectDB;
