const jwt = require('jsonwebtoken');
const User = require('../models/User');

const readBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
};

const loadUserFromToken = async (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in environment variables');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error('User not found for token');
  }

  return user;
};

const protect = async (req, res, next) => {
  try {
    const token = readBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    req.user = await loadUserFromToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, _res, next) => {
  try {
    const token = readBearerToken(req);
    if (!token) {
      return next();
    }

    req.user = await loadUserFromToken(token);
    return next();
  } catch (error) {
    return next();
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
  }

  return next();
};

module.exports = { protect, optionalAuth, authorizeRoles };
