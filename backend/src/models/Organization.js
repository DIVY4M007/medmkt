const mongoose = require('mongoose');

const ORG_TYPES = ['hospital', 'pharmacy', 'vendor', 'distributor'];

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ORG_TYPES, required: true },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    // An org can buy and/or sell. Hospitals/pharmacies are typically buyers; vendors/distributors are sellers,
    // but per spec entities can act as both.
    isBuyer: { type: Boolean, default: true },
    isSeller: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
module.exports.ORG_TYPES = ORG_TYPES;
