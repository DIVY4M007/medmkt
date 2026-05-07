// Entry point: bootstraps Express + MongoDB and mounts /api routes
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');

const authRoutes = require('./src/routes/auth.routes');
const orgRoutes = require('./src/routes/org.routes');
const productRoutes = require('./src/routes/product.routes');
const cartRoutes = require('./src/routes/cart.routes');
const orderRoutes = require('./src/routes/order.routes');

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: corsOrigins.length === 1 && corsOrigins[0] === '*' ? true : corsOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Health
app.get('/api/', (req, res) => {
  res.json({ message: 'Healthcare Marketplace API', status: 'ok' });
});

// Mount feature routers (all under /api)
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralised error handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '8001', 10);
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  try {
    await connectDB();
    // Migration-safe: backfill accountType on pre-existing orgs/users.
    await require('./src/migrations/backfillAccountType').backfillAccountTypes();
    // Auto-seed on first start when DB is empty
    await require('./src/seeders/seed').autoSeedIfEmpty();
    app.listen(PORT, HOST, () => {
      console.log(`API listening on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
})();
