const User = require('../models/User');

const ensureAdminUser = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_INITIAL_PASSWORD || '').trim();

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not set. Admin auto-bootstrap skipped.');
    return;
  }

  let admin = await User.findOne({ email: adminEmail }).select('+password');

  if (!admin) {
    if (!adminPassword) {
      console.warn('ADMIN_INITIAL_PASSWORD not set. Cannot bootstrap admin user.');
      return;
    }

    admin = await User.create({
      name: process.env.ADMIN_NAME || 'Dip Bag',
      email: adminEmail,
      password: adminPassword,
      phone: process.env.ADMIN_PHONE || '',
      role: 'admin'
    });

    console.log(`Admin user created for ${admin.email}`);
    return;
  }

  let hasChanges = false;

  if (admin.role !== 'admin') {
    admin.role = 'admin';
    hasChanges = true;
    console.log(`User role upgraded to admin for ${admin.email}`);
  }

  if (adminPassword) {
    const passwordMatches = await admin.comparePassword(adminPassword);
    if (!passwordMatches) {
      admin.password = adminPassword;
      hasChanges = true;
      console.log(`Admin password synced for ${admin.email}`);
    }
  }

  if (admin.name !== (process.env.ADMIN_NAME || 'Dip Bag')) {
    admin.name = process.env.ADMIN_NAME || 'Dip Bag';
    hasChanges = true;
  }

  if ((admin.phone || '') !== (process.env.ADMIN_PHONE || '')) {
    admin.phone = process.env.ADMIN_PHONE || '';
    hasChanges = true;
  }

  if (hasChanges) {
    await admin.save();
  } else {
    console.log(`Admin user already in sync for ${admin.email}`);
  }
};

module.exports = { ensureAdminUser };
