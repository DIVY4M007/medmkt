// Idempotent seeder for the consumables-only marketplace.
const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Product = require('../models/Product');

const IMG_GLOVES = 'https://images.unsplash.com/photo-1631980838946-755ba8443ab7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMG1lZGljaW5lc3xlbnwwfHx8fDE3Nzc4NTE1MDl8MA&ixlib=rb-4.1.0&q=85';
const IMG_SURGICAL = 'https://images.unsplash.com/photo-1746842421936-461e16dd8238?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxzdXJnZXJ5JTIwdG9vbHN8ZW58MHx8fHwxNzc3ODUxNTA4fDA&ixlib=rb-4.1.0&q=85';
const IMG_HOSPITAL = 'https://images.unsplash.com/photo-1710074213379-2a9c2653046a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxob3NwaXRhbCUyMGJlZHxlbnwwfHx8fDE3Nzc4NTE1MDh8MA&ixlib=rb-4.1.0&q=85';

async function autoSeedIfEmpty() {
  const orgCount = await Organization.countDocuments();
  if (orgCount > 0) {
    console.log('[seed] DB already has orgs — skipping org/user seed');
    await ensureDemoProducts();
    return;
  }
  await runSeed();
}

async function ensureDemoProducts() {
  const productCount = await Product.countDocuments({ isActive: true });
  if (productCount > 0) return;
  console.log('[seed] re-seeding products only…');
  const sellers = await Organization.find({ accountType: 'seller' });
  if (sellers.length === 0) return;
  await Product.insertMany(buildProducts(sellers[0]._id, sellers[1]?._id || sellers[0]._id));
}

function buildProducts(vendorId, distributorId) {
  return [
    {
      name: 'Sterile Disposable Syringes 10ml (Pack of 100)',
      description: 'Luer-lock disposable syringes, individually packed. Sterilised by EO.',
      category: 'syringes',
      sellerOrg: vendorId,
      imageUrl: IMG_SURGICAL,
      stock: 5000,
      unit: 'pack',
      tierPricing: [
        { minQty: 1, unitPrice: 14.0 },
        { minQty: 50, unitPrice: 12.0 },
        { minQty: 250, unitPrice: 10.5 },
      ],
      sterility: 'sterile',
      disposable: true,
      packagingQty: 100,
      manufacturer: 'MedSupply Vendors Inc.',
      qualityMetadata: { material: 'Polypropylene', plasticGrade: 'Pharma Grade PP', certifications: ['ISO-7886', 'CE'] },
    },
    {
      name: 'Disposable Nitrile Examination Gloves (Box of 100)',
      description: 'Powder-free, latex-free examination gloves, medical grade.',
      category: 'gloves',
      sellerOrg: vendorId,
      imageUrl: IMG_GLOVES,
      stock: 3000,
      unit: 'box',
      tierPricing: [
        { minQty: 1, unitPrice: 8.0 },
        { minQty: 100, unitPrice: 6.5 },
        { minQty: 500, unitPrice: 5.5 },
      ],
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 100,
      manufacturer: 'MedSupply Vendors Inc.',
      qualityMetadata: { material: 'Nitrile rubber', plasticGrade: 'Medical Grade A', certifications: ['ASTM D6319', 'CE'] },
    },
    {
      name: 'Absorbent Cotton Roll 500g',
      description: 'High-absorbency hospital-grade cotton roll, BP standard.',
      category: 'cotton',
      sellerOrg: distributorId,
      imageUrl: IMG_HOSPITAL,
      stock: 2000,
      unit: 'roll',
      tierPricing: [
        { minQty: 1, unitPrice: 5.5 },
        { minQty: 50, unitPrice: 4.6 },
      ],
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 1,
      manufacturer: 'PrimeHealth Distributors',
      qualityMetadata: { material: 'Bleached cotton', certifications: ['BP', 'ISO-13485'] },
    },
    {
      name: 'Crepe Bandage 10cm x 4m (Pack of 12)',
      description: 'Elastic crepe bandage with secure stretch retention.',
      category: 'bandages',
      sellerOrg: distributorId,
      imageUrl: IMG_HOSPITAL,
      stock: 1500,
      unit: 'pack',
      tierPricing: [
        { minQty: 1, unitPrice: 9.0 },
        { minQty: 25, unitPrice: 7.5 },
      ],
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 12,
      manufacturer: 'PrimeHealth Distributors',
      qualityMetadata: { material: 'Cotton/Elastane blend', certifications: ['CE'] },
    },
    {
      name: '3-Ply Surgical Masks (Box of 50)',
      description: 'Bacterial filtration efficiency >99%. Earloop, single-use.',
      category: 'surgical_masks',
      sellerOrg: vendorId,
      imageUrl: IMG_SURGICAL,
      stock: 8000,
      unit: 'box',
      tierPricing: [
        { minQty: 1, unitPrice: 6.5 },
        { minQty: 100, unitPrice: 5.2 },
        { minQty: 1000, unitPrice: 4.0 },
      ],
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 50,
      manufacturer: 'MedSupply Vendors Inc.',
      qualityMetadata: { material: 'Non-woven polypropylene', certifications: ['EN 14683', 'CE'] },
    },
    {
      name: 'IV Infusion Set with Roller Clamp (Pack of 50)',
      description: 'Sterile, single-use IV administration set with 20-drop chamber.',
      category: 'iv_sets',
      sellerOrg: vendorId,
      imageUrl: IMG_SURGICAL,
      stock: 1200,
      unit: 'pack',
      tierPricing: [
        { minQty: 1, unitPrice: 22.0 },
        { minQty: 25, unitPrice: 19.0 },
      ],
      sterility: 'sterile',
      disposable: true,
      packagingQty: 50,
      manufacturer: 'MedSupply Vendors Inc.',
      qualityMetadata: { material: 'Medical PVC', plasticGrade: 'DEHP-free', certifications: ['ISO-8536', 'CE'] },
    },
    {
      name: 'Sterile Gauze Swabs 10x10cm (Pack of 100)',
      description: '12-ply absorbent gauze swabs, individually folded.',
      category: 'gauze',
      sellerOrg: distributorId,
      imageUrl: IMG_HOSPITAL,
      stock: 2500,
      unit: 'pack',
      tierPricing: [{ minQty: 1, unitPrice: 7.8 }, { minQty: 50, unitPrice: 6.4 }],
      sterility: 'sterile',
      disposable: true,
      packagingQty: 100,
      manufacturer: 'PrimeHealth Distributors',
      qualityMetadata: { material: 'Bleached cotton gauze', certifications: ['EP', 'CE'] },
    },
    {
      name: 'Foley Catheter 16Fr (Box of 10)',
      description: 'Two-way silicone-coated latex Foley catheter, sterile.',
      category: 'catheters',
      sellerOrg: distributorId,
      imageUrl: IMG_SURGICAL,
      stock: 600,
      unit: 'box',
      tierPricing: [{ minQty: 1, unitPrice: 18.0 }, { minQty: 25, unitPrice: 15.5 }],
      sterility: 'sterile',
      disposable: true,
      packagingQty: 10,
      manufacturer: 'PrimeHealth Distributors',
      qualityMetadata: { material: 'Silicone-coated latex', certifications: ['ISO-20696', 'CE'] },
    },
    {
      name: 'PPE Coverall Kit Level 3 (Pack of 10)',
      description: 'Full-body PPE kit incl. coverall, mask, gloves, shoe covers, face shield.',
      category: 'ppe_kits',
      sellerOrg: vendorId,
      imageUrl: IMG_SURGICAL,
      stock: 800,
      unit: 'pack',
      tierPricing: [{ minQty: 1, unitPrice: 32.0 }, { minQty: 25, unitPrice: 28.0 }, { minQty: 100, unitPrice: 25.0 }],
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 10,
      manufacturer: 'MedSupply Vendors Inc.',
      qualityMetadata: { material: 'SMS Non-woven', certifications: ['EN 14126', 'CE'] },
    },
    {
      name: 'Alcohol Swabs 70% IPA (Box of 200)',
      description: 'Pre-saturated alcohol prep pads, single-use.',
      category: 'alcohol_swabs',
      sellerOrg: vendorId,
      imageUrl: IMG_HOSPITAL,
      stock: 4000,
      unit: 'box',
      tierPricing: [{ minQty: 1, unitPrice: 4.2 }, { minQty: 100, unitPrice: 3.4 }],
      sterility: 'sterile',
      disposable: true,
      packagingQty: 200,
      manufacturer: 'MedSupply Vendors Inc.',
      qualityMetadata: { certifications: ['CE'] },
    },
    {
      name: 'Disposable Gowns Level 2 (Pack of 25)',
      description: 'Non-woven splash-resistant isolation gowns, knit cuffs.',
      category: 'disposable_gowns',
      sellerOrg: distributorId,
      imageUrl: IMG_SURGICAL,
      stock: 1500,
      unit: 'pack',
      tierPricing: [{ minQty: 1, unitPrice: 16.0 }, { minQty: 50, unitPrice: 13.5 }],
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 25,
      manufacturer: 'PrimeHealth Distributors',
      qualityMetadata: { material: 'SMS Non-woven', certifications: ['AAMI Level 2', 'CE'] },
    },
    {
      name: 'Hand Sanitizer 500ml (Carton of 12)',
      description: '70% ethanol-based hand rub with moisturiser.',
      category: 'hand_sanitizers',
      sellerOrg: vendorId,
      imageUrl: IMG_HOSPITAL,
      stock: 1000,
      unit: 'carton',
      tierPricing: [{ minQty: 1, unitPrice: 38.0 }, { minQty: 25, unitPrice: 33.0 }],
      sterility: 'non_sterile',
      disposable: true,
      packagingQty: 12,
      manufacturer: 'MedSupply Vendors Inc.',
      qualityMetadata: { certifications: ['WHO formulation', 'CE'] },
    },
  ];
}

async function runSeed() {
  console.log('[seed] populating demo data (consumables marketplace)…');
  const password = await bcrypt.hash('Password123!', 10);

  const [hospital, pharmacy, vendor, distributor] = await Organization.insertMany([
    { name: 'Northwind General Hospital', type: 'hospital', accountType: 'buyer', address: 'Boston, MA' },
    { name: 'BlueCross Pharmacy', type: 'pharmacy', accountType: 'buyer', address: 'New York, NY' },
    { name: 'MedSupply Vendors Inc.', type: 'vendor', accountType: 'seller', address: 'Chicago, IL' },
    { name: 'PrimeHealth Distributors', type: 'distributor', accountType: 'seller', address: 'San Francisco, CA' },
  ]);

  await User.insertMany([
    { name: 'Alice Approver', email: 'alice@hospital.com', passwordHash: password, organization: hospital._id, accountType: 'buyer', role: 'approver' },
    { name: 'Bob Requestor', email: 'bob@hospital.com', passwordHash: password, organization: hospital._id, accountType: 'buyer', role: 'requestor' },
    { name: 'Carol Approver', email: 'carol@pharmacy.com', passwordHash: password, organization: pharmacy._id, accountType: 'buyer', role: 'approver' },
    { name: 'Dan Requestor', email: 'dan@pharmacy.com', passwordHash: password, organization: pharmacy._id, accountType: 'buyer', role: 'requestor' },
    { name: 'Eve Vendor', email: 'eve@vendor.com', passwordHash: password, organization: vendor._id, accountType: 'seller', role: 'approver' },
    { name: 'Frank Distributor', email: 'frank@distributor.com', passwordHash: password, organization: distributor._id, accountType: 'seller', role: 'approver' },
  ]);

  await Product.insertMany(buildProducts(vendor._id, distributor._id));
  console.log('[seed] done.');
}

module.exports = { autoSeedIfEmpty, runSeed };
