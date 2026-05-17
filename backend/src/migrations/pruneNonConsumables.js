// Migration-safe cleanup for the consumables-only marketplace pivot.
// Removes any product whose category is no longer supported (medicines / equipment / used_equipment, etc.)
// and clears legacy fields if they exist on the document.
const Product = require('../models/Product');
const { CATEGORIES } = Product;

async function pruneNonConsumables() {
  // Hard-delete legacy products whose category isn't in the new whitelist.
  const removed = await Product.deleteMany({ category: { $nin: CATEGORIES } });
  if (removed.deletedCount) {
    console.log(`[migrate] removed ${removed.deletedCount} legacy non-consumable products`);
  }
  // Clear obsolete fields that may linger on documents written by the old schema.
  const cleared = await Product.updateMany(
    { $or: [{ isUsed: { $exists: true } }, { condition: { $exists: true } }, { usageDetails: { $exists: true } }, { yearOfManufacture: { $exists: true } }] },
    { $unset: { isUsed: '', condition: '', usageDetails: '', yearOfManufacture: '' } }
  );
  if (cleared.modifiedCount) {
    console.log(`[migrate] cleared legacy fields on ${cleared.modifiedCount} products`);
  }
}

module.exports = { pruneNonConsumables };
