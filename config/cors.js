const normalizeOrigin = (origin) => String(origin || '').trim().replace(/\/+$/, '');

const splitOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((item) => normalizeOrigin(item))
    .filter(Boolean);

const parseAllowedOrigins = () => {
  const origins = [
    ...splitOrigins(process.env.CORS_ORIGIN),
    ...splitOrigins(process.env.CORS_ORIGINS),
    ...splitOrigins(process.env.FRONTEND_URL)
  ];

  if (process.env.VERCEL_URL) {
    origins.push(normalizeOrigin(`https://${process.env.VERCEL_URL}`));
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  }

  return Array.from(new Set(origins));
};

const isVercelPreviewOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app');
  } catch (error) {
    return false;
  }
};

const createCorsOptions = () => {
  const allowedOrigins = parseAllowedOrigins();
  const allowVercelPreviews =
    String(process.env.ALLOW_VERCEL_PREVIEWS || 'false').toLowerCase() === 'true';

  return {
    origin(origin, callback) {
      // Allow non-browser requests (curl, Postman, server-to-server).
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      if (allowVercelPreviews && isVercelPreviewOrigin(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
  };
};

module.exports = { createCorsOptions };
