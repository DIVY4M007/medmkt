const mongoose = require('mongoose');

// Consumables marketplace — single domain. The `category` field below replaces the
// previous broad enum (medicines / consumables / equipment / used_equipment).
const CATEGORIES = [
  'syringes',
  'gloves',
  'cotton',
  'bandages',
  'surgical_masks',
  'iv_sets',
  'gauze',
  'catheters',
  'ppe_kits',
  'disposable_drapes',
  'alcohol_swabs',
  'specimen_containers',
  'surgical_tape',
  'cannulas',
  'urine_bags',
  'disposable_gowns',
  'face_shields',
  'shoe_covers',
  'hand_sanitizers',
  'disposable_caps',
];

const STERILITY = ['sterile', 'non_sterile'];

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
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    sellerOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    imageUrl: { type: String, default: '' },
    stock: { type: Number, default: 100, min: 0 },
    unit: { type: String, default: 'box' },

    // Tier pricing — sorted ascending by minQty in middleware
    tierPricing: { type: [tierSchema], default: [] },

    // Consumable-specific structured attributes
    sterility: { type: String, enum: STERILITY, default: 'non_sterile' },
    disposable: { type: Boolean, default: true }, // disposable vs reusable
    packagingQty: { type: Number, default: 1, min: 1 }, // pieces per pack/box
    manufacturer: { type: String, default: '' },

    // Quality metadata (free-form material spec + cert list)
    qualityMetadata: {
      material: { type: String, default: '' },
      plasticGrade: { type: String, default: '' },
      certifications: { type: [String], default: [] },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (Array.isArray(this.tierPricing)) {
    this.tierPricing.sort((a, b) => a.minQty - b.minQty);
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
module.exports.STERILITY = STERILITY;
