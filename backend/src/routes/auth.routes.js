const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

// New split portals (preferred)
router.post('/buyer/register', ...c.buyerRegister);
router.post('/buyer/login', ...c.buyerLogin);
router.post('/seller/register', ...c.sellerRegister);
router.post('/seller/login', ...c.sellerLogin);

// Legacy endpoints — kept for back-compat with existing clients
router.post('/register', ...c.legacyRegister);
router.post('/login', ...c.legacyLogin);

router.get('/me', requireAuth, c.me);

module.exports = router;
