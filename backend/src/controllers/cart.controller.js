// Cart = user's draft Order. One draft per user.
const Order = require('../models/Order');
const Product = require('../models/Product');
const { z, validate } = require('../utils/validators');

async function getOrCreateDraft(user) {
  let cart = await Order.findOne({ createdBy: user._id, status: 'draft' });
  if (!cart) {
    cart = await Order.create({
      buyerOrg: user.organization._id || user.organization,
      createdBy: user._id,
      status: 'draft',
      items: [],
      total: 0,
    });
  }
  return cart;
}

// GET /api/cart
async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateDraft(req.user);
    const populated = await Order.findById(cart._id).populate('items.product').populate('items.sellerOrg', 'name type');
    res.json({ cart: populated });
  } catch (err) {
    next(err);
  }
}

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

// POST /api/cart/items
async function addItem(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ error: 'Product not found' });
    if (product.sellerOrg.toString() === (req.user.organization._id || req.user.organization).toString()) {
      return res.status(400).json({ error: 'You cannot order from your own organisation' });
    }

    const cart = await getOrCreateDraft(req.user);
    // Merge if exists
    const existing = cart.items.find((it) => it.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
      existing.unitPrice = Product.priceForQty(product.tierPricing, existing.quantity);
      existing.lineTotal = existing.unitPrice * existing.quantity;
    } else {
      const unitPrice = Product.priceForQty(product.tierPricing, quantity);
      cart.items.push({
        product: product._id,
        productName: product.name,
        sellerOrg: product.sellerOrg,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      });
    }
    cart.recalcTotal();
    await cart.save();
    const populated = await Order.findById(cart._id).populate('items.product').populate('items.sellerOrg', 'name type');
    res.json({ cart: populated });
  } catch (err) {
    next(err);
  }
}

const updateItemSchema = z.object({ quantity: z.number().int().positive() });

// PATCH /api/cart/items/:itemId
async function updateItem(req, res, next) {
  try {
    const cart = await getOrCreateDraft(req.user);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ error: 'Product unavailable' });
    item.quantity = req.body.quantity;
    item.unitPrice = Product.priceForQty(product.tierPricing, item.quantity);
    item.lineTotal = item.unitPrice * item.quantity;
    cart.recalcTotal();
    await cart.save();
    const populated = await Order.findById(cart._id).populate('items.product').populate('items.sellerOrg', 'name type');
    res.json({ cart: populated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/items/:itemId
async function removeItem(req, res, next) {
  try {
    const cart = await getOrCreateDraft(req.user);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });
    item.deleteOne();
    cart.recalcTotal();
    await cart.save();
    const populated = await Order.findById(cart._id).populate('items.product').populate('items.sellerOrg', 'name type');
    res.json({ cart: populated });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart/submit — Requestor submits cart for approval
async function submitCart(req, res, next) {
  try {
    const cart = await getOrCreateDraft(req.user);
    if (cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    cart.status = 'pending_approval';
    cart.submittedAt = new Date();
    await cart.save();
    res.json({ order: cart });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart/upload-excel — bulk preview (no commit) or commit if ?commit=true.
// All heavy lifting delegated to services.
const { parseBuffer, dedupeRows } = require('../services/excelParser.service');
const { matchRows, commitToCart } = require('../services/cartGen.service');
const { buildTemplate } = require('../services/excelTemplate.service');

async function uploadExcel(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name: file)' });

    // 1. Parse + validate rows
    const { rows, errors } = parseBuffer(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No usable rows', validationErrors: errors });
    }

    // 2. De-duplicate same product+sku rows by summing quantity
    const { unique, duplicates } = dedupeRows(rows);

    // 3. Match against catalogue + compute tier price
    const { matched, unmatched } = await matchRows(unique, req.org._id);

    const summary = {
      totalRows: rows.length,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      duplicateCount: duplicates.length,
      validationErrorCount: errors.length,
      grandTotal: matched.reduce((s, m) => s + m.lineTotal, 0),
    };

    const commit = String(req.query.commit || '').toLowerCase() === 'true';
    if (!commit) {
      return res.json({ committed: false, summary, matched, unmatched, duplicates, validationErrors: errors });
    }

    if (matched.length === 0) {
      return res.status(400).json({ error: 'Nothing to commit — no rows matched', summary, unmatched, validationErrors: errors });
    }

    const cart = await commitToCart(req.user, matched);
    return res.json({ committed: true, summary, matched, unmatched, duplicates, validationErrors: errors, cart });
  } catch (err) {
    next(err);
  }
}

// GET /api/cart/upload-template — downloads the bulk-cart Excel template
async function uploadTemplate(_req, res, next) {
  try {
    const buf = buildTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="bulk-cart-template.xlsx"');
    res.send(buf);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCart,
  addItem: [validate(addItemSchema), addItem],
  updateItem: [validate(updateItemSchema), updateItem],
  removeItem,
  submitCart,
  uploadExcel,
  uploadTemplate,
};
