const mongoose = require('mongoose');

const CATEGORIES = ['medicines', 'consumables', 'equipment', 'used_equipment'];
const CONDITIONS = ['like_new', 'good', 'fair', 'refurbished'];

const tierSchema = new mongoose.Schema(
  {
    minQty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, required: true },
    sellerOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    imageUrl: { type: String, default: '' },
    stock: { type: Number, default: 100, min: 0 },
    unit: { type: String, default: 'unit' }, // e.g. box, vial, piece
    // Tier pricing — sorted ascending by minQty in middleware
    tierPricing: { type: [tierSchema], default: [] },
    // Structured quality metadata (free-form key/value)
    qualityMetadata: {
      material: { type: String, default: '' },
      plasticGrade: { type: String, default: '' },
      certifications: { type: [String], default: [] },
      extra: { type: Map, of: String, default: {} },
    },
    // Used / refurbished specifics
    isUsed: { type: Boolean, default: false },
    condition: { type: String, enum: CONDITIONS, default: undefined },
    usageDetails: { type: String, default: '' }, // hours used, year, etc.
    yearOfManufacture: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (Array.isArray(this.tierPricing)) {
    this.tierPricing.sort((a, b) => a.minQty - b.minQty);
  }
  // Used products must be in the used_equipment category
  if (this.isUsed && this.category !== 'used_equipment') {
    this.category = 'used_equipment';
  }
  next();
});

// Static helper: pick the unit price for a given quantity from tier pricing.
productSchema.statics.priceForQty = function (tiers, qty) {
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let chosen = sorted[0].unitPrice;
  for (const t of sorted) {
    if (qty >= t.minQty) chosen = t.unitPrice;
  }
  return chosen;
};

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.CONDITIONS = CONDITIONS;
