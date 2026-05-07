const router = require('express').Router();
const c = require('../controllers/cart.controller');
const { requireAuth, requireRole, requireAccountType } = require('../middleware/auth');

// All cart actions are buyer-only. Within a buyer org, only requestors mutate the cart.
router.get('/', requireAuth, requireAccountType('buyer'), c.getCart);
router.post('/items', requireAuth, requireAccountType('buyer'), requireRole('requestor'), ...c.addItem);
router.patch('/items/:itemId', requireAuth, requireAccountType('buyer'), requireRole('requestor'), ...c.updateItem);
router.delete('/items/:itemId', requireAuth, requireAccountType('buyer'), requireRole('requestor'), c.removeItem);
router.post('/submit', requireAuth, requireAccountType('buyer'), requireRole('requestor'), c.submitCart);

module.exports = router;
