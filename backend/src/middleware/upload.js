// Multer middleware for in-memory single-file uploads (bulk cart Excel).
// We never persist uploads to disk — keep them small (1MB) and parse straight from buffer.
const multer = require('multer');

const ACCEPTED = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                          // .xls
  'text/csv',                                                          // .csv
  'application/octet-stream',                                          // some browsers send this for xlsx
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED.has(file.mimetype) || /\.(xlsx|xls|csv)$/i.test(file.originalname)) cb(null, true);
    else cb(Object.assign(new Error('Only .xlsx / .xls / .csv files are accepted'), { status: 400 }));
  },
});

module.exports = { uploadSingle: upload.single('file') };
