const router = require('express').Router();
const c = require('../controllers/cart.controller');
const { requireAuth, requireRole, requireAccountType } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// All cart actions are buyer-only. Within a buyer org, only requestors mutate the cart.
router.get('/', requireAuth, requireAccountType('buyer'), c.getCart);
router.post('/items', requireAuth, requireAccountType('buyer'), requireRole('requestor'), ...c.addItem);
router.patch('/items/:itemId', requireAuth, requireAccountType('buyer'), requireRole('requestor'), ...c.updateItem);
router.delete('/items/:itemId', requireAuth, requireAccountType('buyer'), requireRole('requestor'), c.removeItem);
router.post('/submit', requireAuth, requireAccountType('buyer'), requireRole('requestor'), c.submitCart);

// Bulk upload — same auth fence (buyer + requestor).
router.post(
  '/upload-excel',
  requireAuth,
  requireAccountType('buyer'),
  requireRole('requestor'),
  uploadSingle,
  c.uploadExcel
);
// Sample template is open to any authenticated buyer requestor.
router.get(
  '/upload-template',
  requireAuth,
  requireAccountType('buyer'),
  requireRole('requestor'),
  c.uploadTemplate
);

module.exports = router;
