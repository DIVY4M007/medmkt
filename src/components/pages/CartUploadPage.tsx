'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  ShoppingCart,
  Package,
  Tag,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  tierPricing: string;
  discountPercent?: number | null;
  minOrderForDiscount?: number | null;
  sellerOrg?: { name: string };
  [key: string]: unknown;
}

interface ParsedRow {
  productName: string;
  quantity: number;
  matchedProductId?: string;
  matchedProduct?: Product;
  status: 'matched' | 'unmatched' | 'invalid';
  error?: string;
}

interface PreMadeListItem {
  productId: string;
  productName: string;
  quantity: number;
}

interface PreMadeList {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: PreMadeListItem[];
  totalItems: number;
}

/* ------------------------------------------------------------------ */
/*  Pre-made Lists (static definitions — matched at runtime)          */
/* ------------------------------------------------------------------ */

const PRE_MADE_LISTS: PreMadeList[] = [
  {
    id: 'hospital-essentials',
    name: 'Hospital Essentials Pack',
    description: 'Core consumables for daily hospital operations',
    icon: '🏥',
    totalItems: 7,
    items: [
      { productId: '', productName: 'Surgical Gloves (Latex-Free)', quantity: 50 },
      { productId: '', productName: 'Disposable Syringes 5ml', quantity: 100 },
      { productId: '', productName: 'Surgical Mask N95', quantity: 200 },
      { productId: '', productName: 'IV Infusion Set', quantity: 30 },
      { productId: '', productName: 'Sterile Gauze Rolls', quantity: 40 },
      { productId: '', productName: 'Hand Sanitizer 500ml', quantity: 25 },
      { productId: '', productName: 'Cotton Roll Absorbent', quantity: 20 },
    ],
  },
  {
    id: 'emergency-preparedness',
    name: 'Emergency Preparedness Kit',
    description: 'Critical supplies for emergency and ICU readiness',
    icon: '🚑',
    totalItems: 5,
    items: [
      { productId: '', productName: 'Surgical Gloves (Latex-Free)', quantity: 100 },
      { productId: '', productName: 'PPE Kit Full Body', quantity: 25 },
      { productId: '', productName: 'Surgical Mask N95', quantity: 500 },
      { productId: '', productName: 'IV Infusion Set', quantity: 50 },
      { productId: '', productName: 'Hand Sanitizer 500ml', quantity: 50 },
    ],
  },
  {
    id: 'pharmacy-starter',
    name: 'Pharmacy Starter Pack',
    description: 'Essential stock for new pharmacy setups',
    icon: '💊',
    totalItems: 4,
    items: [
      { productId: '', productName: 'Disposable Syringes 5ml', quantity: 200 },
      { productId: '', productName: 'Sterile Gauze Rolls', quantity: 60 },
      { productId: '', productName: 'Cotton Roll Absorbent', quantity: 30 },
      { productId: '', productName: 'Hand Sanitizer 500ml', quantity: 40 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CartUploadPage() {
  const { navigate } = useAppStore();
  const [step, setStep] = useState<'lists' | 'upload' | 'preview' | 'result'>('lists');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [resultSummary, setResultSummary] = useState<{ added: number; skipped: number } | null>(null);
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [addingListId, setAddingListId] = useState<string | null>(null);
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  /* ---- Fetch products for matching ---- */
  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.get('/products') as { products: Product[] };
      setProducts(data.products || []);
      return data.products || [];
    } catch {
      toast.error('Failed to load products for matching');
      return [];
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ---- Match list items against product catalog ---- */
  const getMatchedList = useCallback((list: PreMadeList): PreMadeList => {
    return {
      ...list,
      items: list.items.map((item) => {
        const matched = products.find(
          (p) =>
            p.name.toLowerCase().includes(item.productName.toLowerCase()) ||
            item.productName.toLowerCase().includes(p.name.toLowerCase())
        );
        return {
          ...item,
          productId: matched?.id || '',
        };
      }),
    };
  }, [products]);

  /* ---- Get discount info for a product ---- */
  const getProductDiscount = (productId: string): { percent: number; minQty: number } | null => {
    const product = products.find((p) => p.id === productId);
    if (!product?.discountPercent || !product?.minOrderForDiscount) return null;
    return { percent: product.discountPercent, minQty: product.minOrderForDiscount };
  };

  /* ---- Get tier price for a product at a given quantity ---- */
  const getTierPrice = (productId: string, quantity: number): number => {
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;
    try {
      const tiers: { minQty: number; unitPrice: number }[] = JSON.parse(product.tierPricing);
      if (!Array.isArray(tiers) || tiers.length === 0) return 0;
      const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
      const applicable = sorted.find((t) => quantity >= t.minQty);
      return applicable?.unitPrice || sorted[sorted.length - 1]?.unitPrice || 0;
    } catch {
      return 0;
    }
  };

  /* ---- Calculate list total with discounts ---- */
  const getListTotal = (list: PreMadeList): { subtotal: number; discount: number; total: number } => {
    const matched = getMatchedList(list);
    let subtotal = 0;
    let discount = 0;

    for (const item of matched.items) {
      if (!item.productId) continue;
      const unitPrice = getTierPrice(item.productId, item.quantity);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      const discountInfo = getProductDiscount(item.productId);
      if (discountInfo && item.quantity >= discountInfo.minQty) {
        discount += lineTotal * (discountInfo.percent / 100);
      }
    }

    return { subtotal, discount, total: subtotal - discount };
  };

  /* ---- Add pre-made list to cart ---- */
  const handleAddList = async (list: PreMadeList) => {
    const matched = getMatchedList(list);
    const validItems = matched.items.filter((item) => item.productId);

    if (validItems.length === 0) {
      toast.error('No matching products found for this list');
      return;
    }

    setAddingListId(list.id);
    try {
      const data = await api.post('/cart/bulk', {
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }) as { added: number; skipped: number };

      setResultSummary({ added: data.added, skipped: data.skipped });
      setStep('result');
      toast.success(`${data.added} item${data.added !== 1 ? 's' : ''} added to cart`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add items to cart');
    } finally {
      setAddingListId(null);
    }
  };

  /* ---- Parse Excel file ---- */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
      toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setFileName(file.name);
    setLoading(true);

    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

      if (jsonData.length === 0) {
        toast.error('The file appears to be empty');
        setLoading(false);
        return;
      }

      const allProducts = products.length > 0 ? products : await fetchProducts();

      const rows: ParsedRow[] = jsonData.map((row) => {
        const productName = String(
          row['Product Name'] || row['product_name'] || row['Product'] || row['product'] || row['Item'] || row['item'] || ''
        ).trim();

        const quantity = Number(
          row['Quantity'] || row['quantity'] || row['Qty'] || row['qty'] || row['Amount'] || 0
        );

        if (!productName) {
          return { productName: '', quantity: 0, status: 'invalid', error: 'Missing product name' };
        }
        if (!quantity || quantity <= 0) {
          return { productName, quantity: 0, status: 'invalid', error: 'Invalid quantity' };
        }

        const matched = allProducts.find(
          (p) =>
            p.name.toLowerCase().includes(productName.toLowerCase()) ||
            productName.toLowerCase().includes(p.name.toLowerCase())
        );

        if (matched) {
          return {
            productName,
            quantity,
            matchedProductId: matched.id,
            matchedProduct: matched,
            status: 'matched',
          };
        }

        return { productName, quantity, status: 'unmatched', error: 'No matching product found' };
      });

      setParsedRows(rows);
      setStep('preview');
    } catch (err) {
      console.error('Excel parse error:', err);
      toast.error('Failed to parse file. Make sure it\'s a valid Excel or CSV file.');
    } finally {
      setLoading(false);
    }
  };

  /* ---- Remove a row ---- */
  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---- Submit bulk add (from Excel preview) ---- */
  const handleSubmit = async () => {
    const matchedItems = parsedRows.filter((r) => r.status === 'matched' && r.matchedProductId);

    if (matchedItems.length === 0) {
      toast.error('No valid items to add');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post('/cart/bulk', {
        items: matchedItems.map((r) => ({
          productId: r.matchedProductId,
          quantity: r.quantity,
        })),
      }) as { added: number; skipped: number; results: Array<{ status: string; error?: string }> };

      setResultSummary({ added: data.added, skipped: data.skipped });
      setStep('result');
      toast.success(`${data.added} item${data.added !== 1 ? 's' : ''} added to cart`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add items to cart');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Stats for preview ---- */
  const matchedCount = parsedRows.filter((r) => r.status === 'matched').length;
  const unmatchedCount = parsedRows.filter((r) => r.status === 'unmatched').length;
  const invalidCount = parsedRows.filter((r) => r.status === 'invalid').length;

  /* ---- Filter pre-made lists by discount availability ---- */
  const filteredLists = showDiscountOnly
    ? PRE_MADE_LISTS.map((list) => {
        const matched = getMatchedList(list);
        const discountItems = matched.items.filter((item) => {
          if (!item.productId) return false;
          const discount = getProductDiscount(item.productId);
          return discount && item.quantity >= discount.minQty;
        });
        return { list, hasDiscount: discountItems.length > 0 };
      }).filter((entry) => entry.hasDiscount).map((entry) => entry.list)
    : PRE_MADE_LISTS;

  /* ================================================================ */
  /*  Render                                                            */
  /* ================================================================ */
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Back link */}
      <button
        onClick={() => navigate('cart')}
        className="text-primary hover:underline text-sm mb-6 inline-flex items-center gap-1 transition-colors"
        data-testid="back-link"
      >
        <ArrowLeft className="size-4" /> Cart
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl border border-border/60 flex items-center justify-center shrink-0">
          <ShoppingCart className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Quick add to cart
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a pre-made pack or upload your own spreadsheet
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Step: Pre-made Lists                                         */}
      {/* ============================================================ */}
      {step === 'lists' && (
        <div className="space-y-6 stagger-children">
          {/* Discount filter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDiscountOnly(!showDiscountOnly)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                showDiscountOnly
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              }`}
              data-testid="discount-filter-btn"
            >
              <Tag className="size-4" />
              {showDiscountOnly ? 'Showing discounted items' : 'Filter by discount available'}
            </button>
          </div>

          {/* Pre-made order lists */}
          <div className="space-y-4">
            {filteredLists.map((list) => {
              const matched = getMatchedList(list);
              const matchedCount = matched.items.filter((i) => i.productId).length;
              const pricing = getListTotal(list);
              const isExpanded = expandedList === list.id;
              const isAdding = addingListId === list.id;

              return (
                <div
                  key={list.id}
                  className="bg-card rounded-xl border border-border overflow-hidden transition-all"
                  data-testid={`premade-list-${list.id}`}
                >
                  {/* List header */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-lg border border-border/60 flex items-center justify-center text-lg shrink-0">
                        {list.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading text-lg font-semibold text-foreground">
                            {list.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {list.items.length} items
                          </Badge>
                          {pricing.discount > 0 && (
                            <Badge className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              <Tag className="size-3 mr-0.5" />
                              {formatINR(pricing.discount)} off
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{list.description}</p>

                        {/* Pricing summary */}
                        <div className="flex items-center gap-4 flex-wrap">
                          {pricing.subtotal > 0 && (
                            <>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Subtotal: </span>
                                <span className="font-medium text-foreground">{formatINR(pricing.subtotal)}</span>
                              </div>
                              {pricing.discount > 0 && (
                                <div className="text-sm">
                                  <span className="text-emerald-600 font-medium">
                                    −{formatINR(pricing.discount)} discount
                                  </span>
                                </div>
                              )}
                              <div className="text-sm">
                                <span className="text-muted-foreground">Total: </span>
                                <span className="font-semibold text-primary">{formatINR(pricing.total)}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {matchedCount < list.items.length && (
                          <p className="text-xs text-amber-600 mt-2">
                            ⚠ {list.items.length - matchedCount} item{(list.items.length - matchedCount) !== 1 ? 's' : ''} could not be matched
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 ml-14">
                      <Button
                        onClick={() => handleAddList(list)}
                        disabled={isAdding || matchedCount === 0}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-xl btn-press"
                        data-testid={`add-list-${list.id}`}
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="size-4" />
                            Add all to cart
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedList(isExpanded ? null : list.id)}
                        className="text-muted-foreground gap-1"
                        data-testid={`toggle-list-${list.id}`}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="size-4" />
                            Hide items
                          </>
                        ) : (
                          <>
                            <ChevronDown className="size-4" />
                            View items
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded items list */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      <div className="px-5 py-3 bg-secondary">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          <div className="col-span-5">Product</div>
                          <div className="col-span-2">Quantity</div>
                          <div className="col-span-2 text-right">Unit price</div>
                          <div className="col-span-3 text-right">Discount</div>
                        </div>
                      </div>
                      <div className="divide-y divide-border">
                        {matched.items.map((item, idx) => {
                          const unitPrice = item.productId ? getTierPrice(item.productId, item.quantity) : 0;
                          const discountInfo = item.productId ? getProductDiscount(item.productId) : null;
                          const qualifiesForDiscount = discountInfo && item.quantity >= discountInfo.minQty;

                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-sm hover:bg-secondary/30 transition-colors"
                            >
                              <div className="col-span-5 flex items-center gap-2">
                                <Package className="size-4 text-muted-foreground shrink-0" />
                                <span className={item.productId ? 'text-foreground font-medium truncate' : 'text-amber-600 truncate'}>
                                  {item.productName}
                                </span>
                                {!item.productId && (
                                  <span className="text-xs text-amber-500 shrink-0">(unmatched)</span>
                                )}
                              </div>
                              <div className="col-span-2 text-muted-foreground">
                                {item.quantity} {item.productId ? products.find(p => p.id === item.productId)?.unit || '' : ''}
                              </div>
                              <div className="col-span-2 text-right text-muted-foreground">
                                {unitPrice > 0 ? formatINR(unitPrice) : '—'}
                              </div>
                              <div className="col-span-3 text-right">
                                {discountInfo ? (
                                  qualifiesForDiscount ? (
                                    <span className="text-emerald-600 font-medium text-xs">
                                      {discountInfo.percent}% off (min {discountInfo.minQty})
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      {discountInfo.percent}% off at {discountInfo.minQty}+
                                    </span>
                                  )
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredLists.length === 0 && showDiscountOnly && (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="size-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No packs with discounted items match the current filter</p>
              </div>
            )}
          </div>

          {/* Divider with upload toggle */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center gap-2 bg-background px-4 text-sm text-muted-foreground hover:text-primary transition-colors"
                data-testid="toggle-upload"
              >
                <FileSpreadsheet className="size-4" />
                {showUpload ? 'Hide Excel upload' : 'Or upload your own spreadsheet'}
                {showUpload ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              </button>
            </div>
          </div>

          {/* Excel upload section (collapsible) */}
          {showUpload && (
            <div className="space-y-4 animate-fade-in-up">
              {/* File upload zone */}
              <div
                className="bg-card rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 flex flex-col items-center gap-4 cursor-pointer"
                onClick={() => document.getElementById('excel-upload')?.click()}
                data-testid="upload-zone"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-10 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Parsing your file...</p>
                  </>
                ) : (
                  <>
                    <div className="size-14 rounded-full bg-secondary flex items-center justify-center">
                      <Upload className="size-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports .xlsx, .xls, and .csv files
                      </p>
                    </div>
                  </>
                )}
                <Input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="file-input"
                />
              </div>

              {/* Format guide */}
              <div className="bg-secondary rounded-xl border border-border p-5">
                <p className="text-sm font-medium text-foreground mb-2">Expected format</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Your spreadsheet should have these column headers in the first row:
                </p>
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Column</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="px-4 py-2 font-medium text-foreground">Product Name</td>
                        <td className="px-4 py-2 text-muted-foreground">Name of the product (partial match supported)</td>
                        <td className="px-4 py-2 text-muted-foreground">Surgical Gloves</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-2 font-medium text-foreground">Quantity</td>
                        <td className="px-4 py-2 text-muted-foreground">Number of units to order</td>
                        <td className="px-4 py-2 text-muted-foreground">10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/*  Step: Preview & Confirm (from Excel upload)                  */}
      {/* ============================================================ */}
      {step === 'preview' && (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="size-4" />
              <span>{fileName}</span>
              <span className="text-border">·</span>
              <span>{parsedRows.length} row{parsedRows.length !== 1 ? 's' : ''}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep('lists');
                setParsedRows([]);
                setFileName('');
              }}
              className="text-muted-foreground"
              data-testid="re-upload-btn"
            >
              Upload different file
            </Button>
          </div>

          {/* Match summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span className="text-2xl font-heading font-semibold text-foreground">{matchedCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Matched</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertTriangle className="size-4 text-amber-500" />
                <span className="text-2xl font-heading font-semibold text-foreground">{unmatchedCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Unmatched</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <XCircle className="size-4 text-destructive" />
                <span className="text-2xl font-heading font-semibold text-foreground">{invalidCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Invalid</p>
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-secondary text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div className="col-span-3">Product Name</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-4">Matched Product</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1" />
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {parsedRows.map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 border-t border-border items-center text-sm ${
                    row.status === 'matched' ? 'hover:bg-secondary/50' : 'bg-secondary/20'
                  }`}
                >
                  <div className="col-span-3 text-foreground font-medium truncate">
                    {row.productName || '—'}
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {row.quantity || '—'}
                  </div>
                  <div className="col-span-4 text-muted-foreground truncate text-xs">
                    {row.matchedProduct ? row.matchedProduct.name : '—'}
                  </div>
                  <div className="col-span-2">
                    {row.status === 'matched' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="size-3" />
                        Matched
                      </span>
                    )}
                    {row.status === 'unmatched' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="size-3" />
                        No match
                      </span>
                    )}
                    {row.status === 'invalid' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="size-3" />
                        Invalid
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveRow(idx)}
                      data-testid={`remove-row-${idx}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('cart')}
              className="border-border btn-press"
              data-testid="cancel-bulk-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || matchedCount === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 px-6 rounded-xl btn-press"
              data-testid="confirm-bulk-btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding to cart...
                </>
              ) : (
                <>
                  Add {matchedCount} item{matchedCount !== 1 ? 's' : ''} to cart
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Step: Result                                                 */}
      {/* ============================================================ */}
      {step === 'result' && resultSummary && (
        <div className="flex flex-col items-center justify-center py-16 gap-5 animate-fade-in-up">
          <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <div className="text-center">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-1">
              Items added to cart
            </h2>
            <p className="text-sm text-muted-foreground">
              {resultSummary.added} item{resultSummary.added !== 1 ? 's' : ''} added
              {resultSummary.skipped > 0 && (
                <span>, {resultSummary.skipped} skipped</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('marketplace')}
              className="border-border btn-press"
            >
              Continue shopping
            </Button>
            <Button
              onClick={() => navigate('cart')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press gap-1.5"
              data-testid="go-to-cart-btn"
            >
              View cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
