const router = require('express').Router();
const c = require('../controllers/product.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, c.listProducts);
router.get('/mine', requireAuth, c.listMyProducts);
router.get('/:id', requireAuth, c.getProduct);
router.post('/', requireAuth, ...c.createProduct);
router.put('/:id', requireAuth, ...c.updateProduct);
router.delete('/:id', requireAuth, c.deleteProduct);

module.exports = router;
