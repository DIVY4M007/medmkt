// Cart-generation service: matches parsed rows against the product catalogue,
// computes tier pricing, and (optionally) commits matched items into the user's draft cart.
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * For each row, find a single best-match active product. Matching strategy:
 *   1. exact case-insensitive name match
 *   2. else: regex contains match (returns null if multiple ambiguous matches)
 * Products owned by the buyer's own org are excluded.
 */
async function matchRows(rows, buyerOrgId) {
  const matched = [];
  const unmatched = [];

  // Pre-load all active products for sellers (one DB round-trip).
  const allProducts = await Product.find({ isActive: true, sellerOrg: { $ne: buyerOrgId } })
    .populate('sellerOrg', 'name type');
  const byName = new Map();
  for (const p of allProducts) byName.set(p.name.toLowerCase(), p);

  for (const row of rows) {
    const exact = byName.get(row.productName.toLowerCase());
    let candidate = exact;

    if (!candidate) {
      // contains match
      const needle = row.productName.toLowerCase();
      const contenders = allProducts.filter((p) => p.name.toLowerCase().includes(needle));
      if (contenders.length === 1) candidate = contenders[0];
      else if (contenders.length > 1) {
        unmatched.push({ ...row, reason: `Ambiguous — ${contenders.length} candidate products` });
        continue;
      }
    }

    if (!candidate) {
      unmatched.push({ ...row, reason: 'No matching product in catalogue' });
      continue;
    }

    const unitPrice = Product.priceForQty(candidate.tierPricing, row.quantity);
    matched.push({
      rowNumber: row.rowNumber,
      productId: candidate._id.toString(),
      productName: candidate.name,
      sellerOrg: candidate.sellerOrg,
      quantity: row.quantity,
      unitPrice,
      lineTotal: unitPrice * row.quantity,
    });
  }

  return { matched, unmatched };
}

/**
 * Append/merge matched rows into the user's draft cart, reusing the same logic
 * as the manual "Add to cart" path.
 */
async function commitToCart(user, matched) {
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

  for (const m of matched) {
    const existing = cart.items.find((it) => it.product.toString() === m.productId);
    if (existing) {
      existing.quantity += m.quantity;
      // Re-fetch product so tier price re-computes against updated qty
      const product = await Product.findById(m.productId);
      existing.unitPrice = Product.priceForQty(product.tierPricing, existing.quantity);
      existing.lineTotal = existing.unitPrice * existing.quantity;
    } else {
      cart.items.push({
        product: m.productId,
        productName: m.productName,
        sellerOrg: m.sellerOrg._id || m.sellerOrg,
        quantity: m.quantity,
        unitPrice: m.unitPrice,
        lineTotal: m.lineTotal,
      });
    }
  }
  cart.recalcTotal();
  await cart.save();

  return Order.findById(cart._id).populate('items.product').populate('items.sellerOrg', 'name type');
}

module.exports = { matchRows, commitToCart };
