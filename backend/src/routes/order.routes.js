const router = require('express').Router();
const c = require('../controllers/order.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, c.listOrders);
router.get('/:id', requireAuth, c.getOrder);
// Approver-only state transitions on buyer side
router.post('/:id/approve', requireAuth, requireRole('approver'), c.approveOrder);
router.post('/:id/reject', requireAuth, requireRole('approver'), ...c.rejectOrder);
router.post('/:id/pay', requireAuth, requireRole('approver'), c.payOrder);
// Seller marks delivery (any role within seller org)
router.post('/:id/deliver', requireAuth, c.deliverOrder);

module.exports = router;
