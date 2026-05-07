const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { z, validate } = require('../utils/validators');
const { ORG_TYPE_TO_ACCOUNT } = require('../models/Organization');

// ────────────────────────────────────────────────────────────────────────────
// Schemas — split per account type so requestors can't smuggle in mismatched
// org types from the wrong portal.
// ────────────────────────────────────────────────────────────────────────────
const buyerOrgTypes = ['hospital', 'pharmacy'];
const sellerOrgTypes = ['vendor', 'distributor'];

const baseRegister = {
  orgName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
};
const buyerRegisterSchema = z.object({ ...baseRegister, orgType: z.enum(buyerOrgTypes) });
const sellerRegisterSchema = z.object({ ...baseRegister, orgType: z.enum(sellerOrgTypes) });
// Legacy: any org type accepted (kept for back-compat)
const legacyRegisterSchema = z.object({
  ...baseRegister,
  orgType: z.enum(['hospital', 'pharmacy', 'vendor', 'distributor']),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────────────────
async function createOrgAndApprover({ orgName, orgType, name, email, password }) {
  const accountType = ORG_TYPE_TO_ACCOUNT[orgType];
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const org = await Organization.create({ name: orgName, type: orgType, accountType });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    organization: org._id,
    accountType,
    role: 'approver',
  });
  user.organization = org;
  return { org, user };
}

async function loginAs({ email, password, expectedAccountType }) {
  const user = await User.findOne({ email: email.toLowerCase() }).populate('organization');
  if (!user) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }
  if (expectedAccountType && user.accountType !== expectedAccountType) {
    // Don't leak which side the account belongs to — return a generic error.
    const err = new Error(`This account is not registered as a ${expectedAccountType}. Use the correct portal.`);
    err.status = 403;
    throw err;
  }
  return user;
}

// ────────────────────────────────────────────────────────────────────────────
// Controllers
// ────────────────────────────────────────────────────────────────────────────

// POST /api/auth/buyer/register
async function buyerRegister(req, res, next) {
  try {
    const { user } = await createOrgAndApprover(req.body);
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) { next(err); }
}

// POST /api/auth/seller/register
async function sellerRegister(req, res, next) {
  try {
    const { user } = await createOrgAndApprover(req.body);
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) { next(err); }
}

// POST /api/auth/buyer/login
async function buyerLogin(req, res, next) {
  try {
    const user = await loginAs({ ...req.body, expectedAccountType: 'buyer' });
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) { next(err); }
}

// POST /api/auth/seller/login
async function sellerLogin(req, res, next) {
  try {
    const user = await loginAs({ ...req.body, expectedAccountType: 'seller' });
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) { next(err); }
}

// Legacy POST /api/auth/login (any account type) — kept for back-compat
async function legacyLogin(req, res, next) {
  try {
    const user = await loginAs({ ...req.body });
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) { next(err); }
}

// Legacy POST /api/auth/register — kept for back-compat (any org type)
async function legacyRegister(req, res, next) {
  try {
    const { user } = await createOrgAndApprover(req.body);
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) { next(err); }
}

// GET /api/auth/me — current user info from token
async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

module.exports = {
  buyerRegister: [validate(buyerRegisterSchema), buyerRegister],
  sellerRegister: [validate(sellerRegisterSchema), sellerRegister],
  buyerLogin: [validate(loginSchema), buyerLogin],
  sellerLogin: [validate(loginSchema), sellerLogin],
  legacyLogin: [validate(loginSchema), legacyLogin],
  legacyRegister: [validate(legacyRegisterSchema), legacyRegister],
  me,
};
