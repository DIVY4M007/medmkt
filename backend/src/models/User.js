const mongoose = require('mongoose');

const USER_ROLES = ['requestor', 'approver'];
const ACCOUNT_TYPES = ['buyer', 'seller'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    // Denormalised from organization.accountType for fast JWT signing + cheap guards
    accountType: { type: String, enum: ACCOUNT_TYPES, required: true, index: true },
    role: { type: String, enum: USER_ROLES, default: 'requestor' },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    accountType: this.accountType,
    organization: this.organization,
  };
};

module.exports = mongoose.model('User', userSchema);
module.exports.USER_ROLES = USER_ROLES;
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
