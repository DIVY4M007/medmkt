const router = require('express').Router();
const c = require('../controllers/order.controller');
const { requireAuth, requireRole, requireAccountType } = require('../middleware/auth');

router.get('/', requireAuth, c.listOrders);
router.get('/:id', requireAuth, c.getOrder);
// Buyer-side state transitions (approver-only within a buyer org).
router.post('/:id/approve', requireAuth, requireAccountType('buyer'), requireRole('approver'), c.approveOrder);
router.post('/:id/reject', requireAuth, requireAccountType('buyer'), requireRole('approver'), ...c.rejectOrder);
router.post('/:id/pay', requireAuth, requireAccountType('buyer'), requireRole('approver'), c.payOrder);
// Seller marks delivery (any role within a seller org).
router.post('/:id/deliver', requireAuth, requireAccountType('seller'), c.deliverOrder);

module.exports = router;
