const router = require('express').Router();
const c = require('../controllers/product.controller');
const { requireAuth, requireAccountType } = require('../middleware/auth');

// Reading the catalogue is open to any authenticated user.
router.get('/', requireAuth, c.listProducts);
// Listing/managing products belongs to the seller side only.
router.get('/mine', requireAuth, requireAccountType('seller'), c.listMyProducts);
router.get('/:id', requireAuth, c.getProduct);
router.post('/', requireAuth, requireAccountType('seller'), ...c.createProduct);
router.put('/:id', requireAuth, requireAccountType('seller'), ...c.updateProduct);
router.delete('/:id', requireAuth, requireAccountType('seller'), c.deleteProduct);

module.exports = router;
