// Generates the bulk-upload template workbook in-memory.
const XLSX = require('xlsx');

function buildTemplate() {
  const rows = [
    { productName: 'Disposable Nitrile Examination Gloves (Box of 100)', quantity: 50, sku: '' },
    { productName: '3-Ply Surgical Masks (Box of 50)', quantity: 200, sku: '' },
    { productName: 'Sterile Gauze Swabs 10x10cm (Pack of 100)', quantity: 25, sku: '' },
  ];
  const ws = XLSX.utils.json_to_sheet(rows, { header: ['productName', 'quantity', 'sku'] });
  ws['!cols'] = [{ wch: 60 }, { wch: 10 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bulk Cart');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { buildTemplate };
