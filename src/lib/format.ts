export const CATEGORY_LABELS: Record<string, string> = {
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

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  paid: 'Paid',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

export const STATUS_FLOW = ['draft', 'pending_approval', 'approved', 'paid', 'delivered'];

export const ORG_TYPE_LABELS: Record<string, string> = {
  hospital: 'Hospital',
  pharmacy: 'Pharmacy',
  vendor: 'Vendor',
  distributor: 'Distributor',
};

export const BUYER_ORG_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'pharmacy', label: 'Pharmacy' },
];

export const SELLER_ORG_TYPES = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'distributor', label: 'Distributor' },
];

export const STERILITY_LABELS: Record<string, string> = {
  sterile: 'Sterile',
  non_sterile: 'Non-Sterile',
};

export function formatINR(amount: number | null | undefined): string {
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

export function priceForQty(tierPricingJson: string | null | undefined, qty: number): number {
  if (!tierPricingJson) return 0;
  const tiers = JSON.parse(tierPricingJson) as Array<{ minQty: number; unitPrice: number }>;
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let chosen = sorted[0].unitPrice;
  for (const t of sorted) {
    if (qty >= t.minQty) chosen = t.unitPrice;
  }
  return chosen;
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}
