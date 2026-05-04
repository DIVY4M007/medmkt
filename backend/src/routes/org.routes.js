const router = require('express').Router();
const c = require('../controllers/org.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/sellers', requireAuth, c.listSellerOrgs);
router.get('/me', requireAuth, c.getMyOrg);
router.get('/me/users', requireAuth, c.listMyUsers);
router.post('/me/users', requireAuth, requireRole('approver'), ...c.inviteUser);

module.exports = router;
