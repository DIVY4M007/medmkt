const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { z, validate } = require('../utils/validators');

const registerSchema = z.object({
  orgName: z.string().min(2),
  orgType: z.enum(['hospital', 'pharmacy', 'vendor', 'distributor']),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register — creates a new org and its first user (approver by default).
async function register(req, res, next) {
  try {
    const { orgName, orgType, name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const org = await Organization.create({ name: orgName, type: orgType });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      organization: org._id,
      role: 'approver', // first user in org is admin/approver
    });
    user.organization = org;
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).populate('organization');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me — current user info from token
async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

module.exports = {
  register: [validate(registerSchema), register],
  login: [validate(loginSchema), login],
  me,
};
