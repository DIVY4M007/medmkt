const Product = require('../models/Product');
const { z, validate } = require('../utils/validators');

const tierSchema = z.object({
  minQty: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  category: z.enum(['medicines', 'consumables', 'equipment', 'used_equipment']),
  imageUrl: z.string().optional().default(''),
  stock: z.number().int().nonnegative().default(100),
  unit: z.string().default('unit'),
  tierPricing: z.array(tierSchema).min(1),
  qualityMetadata: z
    .object({
      material: z.string().optional().default(''),
      plasticGrade: z.string().optional().default(''),
      certifications: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({}),
  isUsed: z.boolean().optional().default(false),
  condition: z.enum(['like_new', 'good', 'fair', 'refurbished']).optional(),
  usageDetails: z.string().optional().default(''),
  yearOfManufacture: z.number().int().optional(),
});

// GET /api/products — public listing (auth required) with filters
async function listProducts(req, res, next) {
  try {
    const { category, search, sellerOrg, isUsed } = req.query;
    const q = { isActive: true };
    if (category) q.category = category;
    if (sellerOrg) q.sellerOrg = sellerOrg;
    if (isUsed !== undefined) q.isUsed = isUsed === 'true';
    if (search) q.name = { $regex: search, $options: 'i' };
    const products = await Product.find(q).populate('sellerOrg', 'name type').sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/mine — products owned by my org
async function listMyProducts(req, res, next) {
  try {
    const products = await Product.find({ sellerOrg: req.org._id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
async function getProduct(req, res, next) {
  try {
    const p = await Product.findById(req.params.id).populate('sellerOrg', 'name type address');
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: p });
  } catch (err) {
    next(err);
  }
}

// POST /api/products — create (any user from a seller org)
async function createProduct(req, res, next) {
  try {
    const data = { ...req.body, sellerOrg: req.org._id };
    const product = await Product.create(data);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id
async function updateProduct(req, res, next) {
  try {
    const p = await Product.findOne({ _id: req.params.id, sellerOrg: req.org._id });
    if (!p) return res.status(404).json({ error: 'Product not found in your org' });
    Object.assign(p, req.body);
    await p.save();
    res.json({ product: p });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id (soft delete)
async function deleteProduct(req, res, next) {
  try {
    const p = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerOrg: req.org._id },
      { isActive: false },
      { new: true }
    );
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  listMyProducts,
  getProduct,
  createProduct: [validate(productSchema), createProduct],
  updateProduct: [validate(productSchema.partial()), updateProduct],
  deleteProduct,
};
