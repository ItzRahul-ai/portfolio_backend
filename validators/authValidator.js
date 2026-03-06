const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;

const clean = (value) => String(value || '').trim();

const validateRegisterInput = (payload = {}) => {
  const data = {
    name: clean(payload.name),
    email: clean(payload.email).toLowerCase(),
    password: clean(payload.password),
    phone: clean(payload.phone)
  };

  const errors = [];

  if (data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!emailPattern.test(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (data.phone && !phonePattern.test(data.phone)) {
    errors.push('Please provide a valid phone number');
  }

  return { errors, data };
};

const validateLoginInput = (payload = {}) => {
  const data = {
    email: clean(payload.email).toLowerCase(),
    password: clean(payload.password)
  };

  const errors = [];

  if (!emailPattern.test(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (data.password.length < 1) {
    errors.push('Password is required');
  }

  return { errors, data };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput
};
