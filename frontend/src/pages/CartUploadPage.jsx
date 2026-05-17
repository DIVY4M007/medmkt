import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_BASE } from '../lib/api';
import { Button } from '../components/ui/button';
import { formatINR } from '../lib/format';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Download, ChevronLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function CartUploadPage() {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [committing, setCommitting] = useState(false);

  const reset = () => {
    setFile(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(null);
  };

  const uploadPreview = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/cart/upload-excel', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(data);
      if (data.summary.matchedCount === 0) {
        toast.warning('No rows matched a product in the catalogue.');
      } else {
        toast.success(`${data.summary.matchedCount} of ${data.summary.totalRows} rows matched.`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    if (!file) return;
    setCommitting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/cart/upload-excel?commit=true', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Added ${data.summary.matchedCount} item(s) to cart.`);
      navigate('/cart');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Commit failed');
    } finally {
      setCommitting(false);
    }
  };

  // Direct browser download — pulls bytes through axios so the bearer token is sent.
  const downloadTemplate = async () => {
    try {
      const res = await api.get('/cart/upload-template', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'bulk-cart-template.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not fetch template');
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto" data-testid="cart-upload-page">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-[#5C635F] hover:text-[#1F2321] mb-6" data-testid="back-to-cart">
        <ChevronLeft className="h-4 w-4" /> Cart
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="label-overline text-[#C47055] mb-2">Bulk upload</div>
          <h1 className="font-heading text-4xl font-semibold">Generate cart from Excel</h1>
          <p className="text-[#5C635F] mt-2 max-w-xl">
            Upload an Excel sheet with product names and quantities. We'll match them against the catalogue,
            apply tier pricing, and prefill your draft cart.
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="border-[#D5CEBD] rounded-md" data-testid="download-template-btn">
          <Download className="h-4 w-4 mr-2" /> Download template
        </Button>
      </header>

      {/* Upload area */}
      <div className="border border-[#D5CEBD] rounded-md p-8 bg-[#FDFBF7] mb-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-md bg-[#4A675B]/10 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="h-6 w-6 text-[#4A675B]" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="label-overline text-[#5C635F] mb-1">Step 1 — Pick file</div>
            <p className="text-sm text-[#5C635F] mb-4">
              Accepted: .xlsx, .xls, .csv · max 1MB · columns: <code>productName</code>, <code>quantity</code>, optional <code>sku</code>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInput}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onPickFile}
                className="block text-sm text-[#1F2321] file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#F4F1EA] file:text-[#1F2321] hover:file:bg-[#EAE5D9]"
                data-testid="upload-file-input"
              />
              <Button onClick={uploadPreview} disabled={!file || busy} data-testid="upload-preview-btn"
                className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md">
                <Upload className="h-4 w-4 mr-2" /> {busy ? 'Parsing…' : 'Preview'}
              </Button>
              {file && (
                <button onClick={reset} className="text-xs text-[#5C635F] hover:text-[#1F2321] underline" data-testid="upload-reset-btn">
                  reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="space-y-6" data-testid="upload-preview">
          {/* Summary tiles */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Tile icon={CheckCircle2} label="Matched" value={preview.summary.matchedCount} accent="text-[#4A675B]" testid="summary-matched" />
            <Tile icon={AlertTriangle} label="Unmatched" value={preview.summary.unmatchedCount} accent="text-[#C47055]" testid="summary-unmatched" />
            <Tile icon={XCircle} label="Validation errors" value={preview.summary.validationErrorCount} accent="text-red-600" testid="summary-errors" />
            <Tile label="Total" value={formatINR(preview.summary.grandTotal)} accent="text-[#4A675B] font-heading text-2xl" testid="summary-total" />
          </div>

          {preview.matched.length > 0 && (
            <Section title="Matched items" subtitle="These rows will be added to your cart" testid="section-matched">
              <table className="w-full text-sm">
                <thead className="bg-[#F4F1EA] text-[#5C635F]">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Row</th>
                    <th className="text-left px-4 py-2.5 font-medium">Product</th>
                    <th className="text-left px-4 py-2.5 font-medium">Seller</th>
                    <th className="text-right px-4 py-2.5 font-medium">Qty</th>
                    <th className="text-right px-4 py-2.5 font-medium">Unit</th>
                    <th className="text-right px-4 py-2.5 font-medium">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.matched.map((m) => (
                    <tr key={`${m.rowNumber}-${m.productId}`} className="border-t border-[#D5CEBD]" data-testid={`matched-row-${m.rowNumber}`}>
                      <td className="px-4 py-2.5 text-[#5C635F]">#{m.rowNumber}</td>
                      <td className="px-4 py-2.5 font-medium">{m.productName}</td>
                      <td className="px-4 py-2.5 text-[#5C635F]">{m.sellerOrg?.name || '—'}</td>
                      <td className="px-4 py-2.5 text-right">{m.quantity}</td>
                      <td className="px-4 py-2.5 text-right">{formatINR(m.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-right font-heading">{formatINR(m.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {preview.unmatched.length > 0 && (
            <Section title="Unmatched rows" subtitle="No suitable product found in the catalogue" testid="section-unmatched">
              <ul className="divide-y divide-[#D5CEBD]">
                {preview.unmatched.map((u) => (
                  <li key={u.rowNumber} className="px-4 py-2.5 flex items-start justify-between gap-4 text-sm" data-testid={`unmatched-row-${u.rowNumber}`}>
                    <div>
                      <span className="text-[#5C635F]">#{u.rowNumber}</span>{' '}
                      <span className="font-medium">{u.productName}</span>
                      <span className="text-[#5C635F]"> · qty {u.quantity}</span>
                    </div>
                    <span className="text-[#C47055] text-xs whitespace-nowrap">{u.reason}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {preview.duplicates.length > 0 && (
            <Section title="Merged duplicates" subtitle="Rows referencing the same product were summed" testid="section-duplicates">
              <ul className="divide-y divide-[#D5CEBD] text-sm">
                {preview.duplicates.map((d, i) => (
                  <li key={i} className="px-4 py-2.5 flex items-start justify-between gap-4">
                    <div><span className="text-[#5C635F]">#{d.rowNumber}</span> {d.productName}</div>
                    <span className="text-[#5C635F]">+{d.addedQty} → row #{d.mergedIntoRow}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {preview.validationErrors.length > 0 && (
            <Section title="Validation errors" subtitle="These rows were skipped" testid="section-errors">
              <ul className="divide-y divide-[#D5CEBD] text-sm">
                {preview.validationErrors.map((e, i) => (
                  <li key={i} className="px-4 py-2.5 flex items-start justify-between gap-4">
                    <div><span className="text-[#5C635F]">#{e.rowNumber}</span></div>
                    <span className="text-red-600">{e.message}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Commit bar */}
          <div className="border border-[#D5CEBD] rounded-md p-5 bg-[#F4F1EA] flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-[#5C635F]">
              Adding <span className="font-medium text-[#1F2321]">{preview.summary.matchedCount}</span> item(s)
              · grand total <span className="font-medium text-[#1F2321]">{formatINR(preview.summary.grandTotal)}</span>
            </div>
            <Button
              disabled={preview.summary.matchedCount === 0 || committing}
              onClick={commit}
              data-testid="commit-upload-btn"
              className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md"
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> {committing ? 'Adding…' : 'Add matched to cart'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const Tile = ({ icon: Icon, label, value, accent, testid }) => (
  <div className="border border-[#D5CEBD] rounded-md bg-[#FDFBF7] p-5" data-testid={testid}>
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className={`h-4 w-4 ${accent || 'text-[#5C635F]'}`} strokeWidth={1.75} />}
      <span className="label-overline text-[#5C635F]">{label}</span>
    </div>
    <div className={`font-heading text-3xl font-semibold ${accent || 'text-[#1F2321]'}`}>{value}</div>
  </div>
);

const Section = ({ title, subtitle, children, testid }) => (
  <div className="border border-[#D5CEBD] rounded-md bg-[#FDFBF7] overflow-hidden" data-testid={testid}>
    <div className="px-4 py-3 border-b border-[#D5CEBD] bg-[#F4F1EA]">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-[#5C635F]">{subtitle}</div>
    </div>
    {children}
  </div>
);
