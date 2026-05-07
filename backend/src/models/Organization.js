const mongoose = require('mongoose');

const ORG_TYPES = ['hospital', 'pharmacy', 'vendor', 'distributor'];
const ACCOUNT_TYPES = ['buyer', 'seller'];

// Mapping from org type -> account type. Buyers procure; sellers list products.
const ORG_TYPE_TO_ACCOUNT = {
  hospital: 'buyer',
  pharmacy: 'buyer',
  vendor: 'seller',
  distributor: 'seller',
};

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ORG_TYPES, required: true },
    accountType: { type: String, enum: ACCOUNT_TYPES, required: true, index: true },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    // Kept for backward compatibility with earlier UI; derived from accountType.
    isBuyer: { type: Boolean, default: false },
    isSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Always keep accountType + isBuyer/isSeller in sync with org type.
organizationSchema.pre('validate', function (next) {
  if (!this.accountType && this.type) {
    this.accountType = ORG_TYPE_TO_ACCOUNT[this.type];
  }
  if (this.accountType === 'buyer') {
    this.isBuyer = true; this.isSeller = false;
  } else if (this.accountType === 'seller') {
    this.isBuyer = false; this.isSeller = true;
  }
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
module.exports.ORG_TYPES = ORG_TYPES;
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
module.exports.ORG_TYPE_TO_ACCOUNT = ORG_TYPE_TO_ACCOUNT;
