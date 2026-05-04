// Display helpers for categories, statuses, currency
export const CATEGORY_LABELS = {
  medicines: 'Medicines',
  consumables: 'Consumables',
  equipment: 'Medical Equipment',
  used_equipment: 'Used / Refurbished',
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
