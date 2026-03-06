const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegisterInput, validateLoginInput } = require('../validators/authValidator');

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const buildAuthPayload = (user) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role === 'client' ? 'user' : user.role,
    phone: user.phone
  },
  token: generateToken(user)
});

const register = async (req, res) => {
  const { errors, data } = validateRegisterInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: 'user'
  });

  return res.status(201).json(buildAuthPayload(user));
};

const login = async (req, res) => {
  const { errors, data } = validateLoginInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await user.comparePassword(data.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.status(200).json(buildAuthPayload(user));
};

const getProfile = async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role === 'client' ? 'user' : req.user.role,
      phone: req.user.phone
    }
  });
};

module.exports = {
  register,
  login,
  getProfile
};
