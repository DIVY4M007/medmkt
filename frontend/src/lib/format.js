// Display helpers for categories, statuses, currency
export const CATEGORY_LABELS = {
  syringes: 'Syringes',
  gloves: 'Gloves',
  cotton: 'Cotton',
  bandages: 'Bandages',
  surgical_masks: 'Surgical Masks',
  iv_sets: 'IV Sets',
  gauze: 'Gauze',
  catheters: 'Catheters',
  ppe_kits: 'PPE Kits',
  disposable_drapes: 'Disposable Drapes',
  alcohol_swabs: 'Alcohol Swabs',
  specimen_containers: 'Specimen Containers',
  surgical_tape: 'Surgical Tape',
  cannulas: 'Cannulas',
  urine_bags: 'Urine Bags',
  disposable_gowns: 'Disposable Gowns',
  face_shields: 'Face Shields',
  shoe_covers: 'Shoe Covers',
  hand_sanitizers: 'Hand Sanitizers',
  disposable_caps: 'Disposable Caps',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

export const STERILITY_LABELS = {
  sterile: 'Sterile',
  non_sterile: 'Non-sterile',
};

export const STATUS_LABELS = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  paid: 'Paid',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

export const STATUS_FLOW = ['draft', 'pending_approval', 'approved', 'paid', 'delivered'];

// ─── Currency ───────────────────────────────────────────────────────────────
// Backend stores raw numeric values; all currency formatting happens here.
// Uses Indian numbering system (lakhs, crores) and the ₹ symbol natively.
//
// Examples:
//   formatINR(1250)      → "₹1,250"
//   formatINR(1250000)   → "₹12,50,000"
//   formatINR(3.5)       → "₹3.50"
//   formatINR(null)      → "—"
export function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '—';
  const n = Number(amount);
  const isInt = Number.isInteger(n);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// Back-compat alias — older code paths can keep calling formatCurrency.
export const formatCurrency = formatINR;

export function priceForQty(tiers, qty) {
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let chosen = sorted[0].unitPrice;
  for (const t of sorted) if (qty >= t.minQty) chosen = t.unitPrice;
  return chosen;
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}
