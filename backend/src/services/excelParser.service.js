// Pure parser: takes an Excel buffer → returns normalized rows + structured errors.
// No express dependencies; trivially unit-testable.
const XLSX = require('xlsx');

const MAX_ROWS = 500;
const ALIAS = {
  productname: 'productName',
  product_name: 'productName',
  product: 'productName',
  name: 'productName',
  qty: 'quantity',
  quantity: 'quantity',
  sku: 'sku',
  code: 'sku',
};

function normaliseHeader(h) {
  if (typeof h !== 'string') return h;
  const key = h.trim().toLowerCase().replace(/\s+/g, '_');
  return ALIAS[key] || ALIAS[key.replace(/_/g, '')] || h.trim();
}

/**
 * Parse a workbook buffer.
 * @returns {{ rows: Array<{rowNumber, productName, quantity, sku}>, errors: Array<{rowNumber, message}> }}
 */
function parseBuffer(buffer) {
  let wb;
  try {
    wb = XLSX.read(buffer, { type: 'buffer' });
  } catch {
    const err = new Error('Could not read the file. Please upload a valid .xlsx or .csv.');
    err.status = 400;
    throw err;
  }
  if (!wb.SheetNames.length) {
    const err = new Error('Workbook contains no sheets.');
    err.status = 400;
    throw err;
  }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  if (raw.length === 0) {
    return { rows: [], errors: [{ rowNumber: 0, message: 'Sheet is empty.' }] };
  }
  if (raw.length > MAX_ROWS) {
    const err = new Error(`File has ${raw.length} rows; the per-upload cap is ${MAX_ROWS}.`);
    err.status = 400;
    throw err;
  }

  const rows = [];
  const errors = [];

  raw.forEach((rawRow, idx) => {
    // +2 because XLSX rows are 1-indexed and row 1 is the header.
    const rowNumber = idx + 2;
    const r = {};
    for (const k of Object.keys(rawRow)) r[normaliseHeader(k)] = rawRow[k];

    const productName = String(r.productName || '').trim();
    const sku = String(r.sku || '').trim();
    const quantity = Number(r.quantity);

    if (!productName) {
      errors.push({ rowNumber, message: 'Missing productName' });
      return;
    }
    if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 1) {
      errors.push({ rowNumber, message: `Invalid quantity "${r.quantity}" — must be a positive integer` });
      return;
    }

    rows.push({ rowNumber, productName, quantity, sku });
  });

  return { rows, errors };
}

/**
 * Collapses duplicate rows (same productName + sku) by summing quantity.
 * Returns { unique, duplicates } where duplicates is metadata only — already merged into unique.
 */
function dedupeRows(rows) {
  const map = new Map();
  const duplicates = [];
  for (const r of rows) {
    const key = `${r.productName.toLowerCase()}|${r.sku.toLowerCase()}`;
    if (map.has(key)) {
      const prior = map.get(key);
      duplicates.push({ rowNumber: r.rowNumber, productName: r.productName, mergedIntoRow: prior.rowNumber, addedQty: r.quantity });
      prior.quantity += r.quantity;
    } else {
      map.set(key, { ...r });
    }
  }
  return { unique: Array.from(map.values()), duplicates };
}

module.exports = { parseBuffer, dedupeRows, MAX_ROWS };
