const Order = require('../models/Order');
const { z, validate } = require('../utils/validators');

// Helper: re-fetch an order with the same populate chain getOrder uses, so state-transition
// endpoints return a fully populated document the frontend can rely on.
async function populated(orderId) {
  return Order.findById(orderId)
    .populate('buyerOrg', 'name type')
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('items.product')
    .populate('items.sellerOrg', 'name type');
}

// GET /api/orders — list orders relevant to my org. ?view=buyer|seller
async function listOrders(req, res, next) {
  try {
    const view = req.query.view || 'buyer';
    let q = {};
    if (view === 'buyer') {
      q.buyerOrg = req.org._id;
      // Hide drafts of OTHER users in same org
      q.$or = [{ status: { $ne: 'draft' } }, { createdBy: req.user._id }];
    } else if (view === 'seller') {
      // Orders that contain at least one item with my org as seller (status not draft)
      q['items.sellerOrg'] = req.org._id;
      q.status = { $ne: 'draft' };
    }
    const orders = await Order.find(q)
      .populate('buyerOrg', 'name type')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
async function getOrder(req, res, next) {
  try {
    const o = await Order.findById(req.params.id)
      .populate('buyerOrg', 'name type')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('items.product')
      .populate('items.sellerOrg', 'name type');
    if (!o) return res.status(404).json({ error: 'Order not found' });
    // Auth: must be buyer org member or any seller org member listed in items
    const isBuyer = o.buyerOrg._id.toString() === req.org._id.toString();
    const isSeller = o.items.some((it) => it.sellerOrg && it.sellerOrg._id.toString() === req.org._id.toString());
    if (!isBuyer && !isSeller) return res.status(403).json({ error: 'Forbidden' });
    res.json({ order: o });
  } catch (err) {
    next(err);
  }
}

// POST /api/orders/:id/approve  — Approver in buyer org
async function approveOrder(req, res, next) {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ error: 'Order not found' });
    if (o.buyerOrg.toString() !== req.org._id.toString()) return res.status(403).json({ error: 'Forbidden' });
    if (o.status !== 'pending_approval') return res.status(400).json({ error: `Cannot approve from status ${o.status}` });
    o.status = 'approved';
    o.approvedBy = req.user._id;
    o.approvedAt = new Date();
    await o.save();
    res.json({ order: await populated(o._id) });
  } catch (err) {
    next(err);
  }
}

const rejectSchema = z.object({ reason: z.string().min(1) });
async function rejectOrder(req, res, next) {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ error: 'Order not found' });
    if (o.buyerOrg.toString() !== req.org._id.toString()) return res.status(403).json({ error: 'Forbidden' });
    if (o.status !== 'pending_approval') return res.status(400).json({ error: `Cannot reject from status ${o.status}` });
    o.status = 'rejected';
    o.rejectionReason = req.body.reason;
    o.rejectedAt = new Date();
    await o.save();
    res.json({ order: await populated(o._id) });
  } catch (err) {
    next(err);
  }
}

// POST /api/orders/:id/pay  — Approver, mock payment
async function payOrder(req, res, next) {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ error: 'Order not found' });
    if (o.buyerOrg.toString() !== req.org._id.toString()) return res.status(403).json({ error: 'Forbidden' });
    if (o.status !== 'approved') return res.status(400).json({ error: `Cannot pay from status ${o.status}` });
    o.status = 'paid';
    o.paidAt = new Date();
    await o.save();
    res.json({ order: await populated(o._id) });
  } catch (err) {
    next(err);
  }
}

// POST /api/orders/:id/deliver  — Seller marks delivered
async function deliverOrder(req, res, next) {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ error: 'Order not found' });
    const isSeller = o.items.some((it) => it.sellerOrg.toString() === req.org._id.toString());
    if (!isSeller) return res.status(403).json({ error: 'Only seller org can mark delivered' });
    if (o.status !== 'paid') return res.status(400).json({ error: `Cannot deliver from status ${o.status}` });
    o.status = 'delivered';
    o.deliveredAt = new Date();
    await o.save();
    res.json({ order: await populated(o._id) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listOrders,
  getOrder,
  approveOrder,
  rejectOrder: [validate(rejectSchema), rejectOrder],
  payOrder,
  deliverOrder,
};
