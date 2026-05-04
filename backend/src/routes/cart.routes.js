const router = require('express').Router();
const c = require('../controllers/cart.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, c.getCart);
router.post('/items', requireAuth, requireRole('requestor'), ...c.addItem);
router.patch('/items/:itemId', requireAuth, requireRole('requestor'), ...c.updateItem);
router.delete('/items/:itemId', requireAuth, requireRole('requestor'), c.removeItem);
router.post('/submit', requireAuth, requireRole('requestor'), c.submitCart);

module.exports = router;
