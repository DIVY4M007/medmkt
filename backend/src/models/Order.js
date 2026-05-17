const mongoose = require('mongoose');

const ORDER_STATUSES = ['draft', 'pending_approval', 'approved', 'paid', 'delivered', 'rejected'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true }, // snapshot
    sellerOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true, timestamps: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: { type: [orderItemSchema], default: [] },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'draft' },
    notes: { type: String, default: '' },
    submittedAt: Date,
    approvedAt: Date,
    paidAt: Date,
    deliveredAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

orderSchema.methods.recalcTotal = function () {
  this.total = this.items.reduce((sum, it) => sum + (it.lineTotal || 0), 0);
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
