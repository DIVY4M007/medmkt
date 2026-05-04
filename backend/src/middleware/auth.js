// JWT auth + role/org middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET not configured');
  return s;
}

function signToken(user) {
  const orgId = user.organization && user.organization._id
    ? user.organization._id.toString()
    : user.organization.toString();
  return jwt.sign(
    { sub: user._id.toString(), org: orgId, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthenticated' });

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.sub).populate('organization');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    req.org = user.organization;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// requireRole('approver') or requireRole(['approver','requestor'])
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires role: ${allowed.join(' or ')}` });
    }
    next();
  };
}

module.exports = { signToken, requireAuth, requireRole };
