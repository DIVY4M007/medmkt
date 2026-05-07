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

// Ordered list for selects
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

export function formatCurrency(n) {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function priceForQty(tiers, qty) {
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let chosen = sorted[0].unitPrice;
  for (const t of sorted) if (qty >= t.minQty) chosen = t.unitPrice;
  return chosen;
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
