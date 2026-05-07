const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { z, validate } = require('../utils/validators');

// GET /api/orgs/me — current org details
async function getMyOrg(req, res) {
  res.json({ organization: req.org });
}

// GET /api/orgs/me/users — users in current org (approvers can see)
async function listMyUsers(req, res, next) {
  try {
    const users = await User.find({ organization: req.org._id }).select('-passwordHash');
    res.json({ users: users.map((u) => u.toSafeJSON()) });
  } catch (err) {
    next(err);
  }
}

const inviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['requestor', 'approver']),
});

// POST /api/orgs/me/users — add a user to the current org (approvers only).
// New user inherits the org's accountType automatically.
async function inviteUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      organization: req.org._id,
      accountType: req.org.accountType,
      role,
    });
    res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// GET /api/orgs/sellers — list all seller orgs (for marketplace filters)
async function listSellerOrgs(_req, res, next) {
  try {
    const orgs = await Organization.find({ accountType: 'seller' });
    res.json({ organizations: orgs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyOrg,
  listMyUsers,
  inviteUser: [validate(inviteSchema), inviteUser],
  listSellerOrgs,
};
